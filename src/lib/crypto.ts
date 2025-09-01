
// This uses the Web Crypto API, which is available in modern browsers and service workers.
// Note: This is a simplified implementation for demonstration. A production-grade
// app would need more robust error handling, key management, and potentially
// web workers for performance-intensive crypto operations to avoid blocking the main thread.

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits is recommended for AES-GCM

// Helper to convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Helper to convert Base64 string to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * A constant-time comparison function to prevent timing attacks.
 * This is crucial for securely comparing cryptographic hashes.
 */
function timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);

    if (viewA.length !== viewB.length) {
      // For unequal length, we perform a comparison of `b` against itself.
      // This ensures the loop runs for the same duration as a failed comparison
      // of two buffers of `b`'s length, preventing timing leaks about length.
      // We then return `false` because the lengths were different.
      let diff = 0;
      for (let i = 0; i < viewB.length; i++) {
        diff |= viewB[i] ^ viewB[i]; // This will always be 0
      }
      return false;
    }
    
    let diff = 0;
    for (let i = 0; i < viewA.length; i++) {
      diff |= viewA[i] ^ viewB[i];
    }

    return diff === 0;
}


// ---- MASTER PASSWORD ----

/**
 * Derives a key from a password and salt using PBKDF2.
 * This key is used for encrypting/decrypting the vault data.
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: base64ToBuffer(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Hashes a password with a new random salt.
 * The salt is stored along with the hash.
 */
export async function hashPassword(password: string): Promise<{ hash: string, salt: string }> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        key,
        256
    );
    const saltB64 = bufferToBase64(salt);
    const hashB64 = bufferToBase64(hashBuffer);

    // Store salt with the hash, separated by a period.
    const combined = `${hashB64}.${btoa(JSON.stringify({ salt: saltB64 }))}`;
    return { hash: combined, salt: saltB64 };
}

/**
 * Verifies a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [hashB64, metadataB64] = storedHash.split('.');
        if (!metadataB64) {
            console.error("Stored hash is in an invalid format.");
            return false;
        }
        const metadata = JSON.parse(atob(metadataB64));
        const salt = base64ToBuffer(metadata.salt);
        const encoder = new TextEncoder();
        
        const key = await crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256',
            },
            key,
            256
        );

        const storedHashBuffer = base64ToBuffer(hashB64);
        return timingSafeEqual(hashBuffer, storedHashBuffer);
    } catch (e) {
        console.error("Password verification failed", e);
        return false;
    }
}


// ---- VAULT DATA ENCRYPTION ----

/**
 * Encrypts data using AES-GCM with a given key.
 */
export async function encryptData(data: string, key: CryptoKey): Promise<{ iv: string, encryptedData: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(data)
    );
    return {
        iv: bufferToBase64(iv),
        encryptedData: bufferToBase64(encryptedData)
    };
}

/**
 * Decrypts data using AES-GCM with a given key and IV.
 */
export async function decryptData(encryptedData: string, key: CryptoKey, iv: string): Promise<string> {
    const decoder = new TextDecoder();
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBuffer(iv) },
        key,
        base64ToBuffer(encryptedData)
    );
    return decoder.decode(decryptedBuffer);
}

// ---- PIN & RECOVERY QUESTIONS (using a simpler hash as they are for lower-security actions) ----
const PIN_ITERATIONS = 10000; // Lower than master password, but still decent.

async function simpleHash(data: string, salt: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(data), { name: 'PBKDF2' }, false, ['deriveBits']);
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PIN_ITERATIONS,
            hash: 'SHA-256',
        },
        key,
        256
    );
    const hashB64 = bufferToBase64(hashBuffer);
    const saltB64 = bufferToBase64(salt);
    return `${hashB64}.${btoa(JSON.stringify({ salt: saltB64 }))}`;
}

async function verifySimpleHash(data: string, storedHash: string): Promise<boolean> {
     try {
        const [hashB64, metadataB64] = storedHash.split('.');
        if (!metadataB64) return false;
        const metadata = JSON.parse(atob(metadataB64));
        const salt = base64ToBuffer(metadata.salt);
        const encoder = new TextEncoder();
        
        const key = await crypto.subtle.importKey('raw', encoder.encode(data), { name: 'PBKDF2' }, false, ['deriveBits']);
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PIN_ITERATIONS,
                hash: 'SHA-256',
            },
            key,
            256
        );

        const storedHashBuffer = base64ToBuffer(hashB64);
        return timingSafeEqual(hashBuffer, storedHashBuffer);
    } catch (e) {
        console.error("Simple hash verification failed", e);
        return false;
    }
}

export async function hashPin(pin: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    return simpleHash(pin, salt);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    return verifySimpleHash(pin, storedHash);
}

export async function hashAnswer(answer: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    // Normalize answer to prevent issues with casing or whitespace
    return simpleHash(answer.toLowerCase().trim(), salt);
}

export async function verifyAnswer(answer: string, storedHash: string): Promise<boolean> {
    return verifySimpleHash(answer.toLowerCase().trim(), storedHash);
}
