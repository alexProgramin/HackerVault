
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { 
    deriveKeyFromPassword, 
    hashPassword, 
    verifyPassword, 
    encryptData, 
    decryptData,
    hashPin,
    verifyPin as verifyPinCrypto,
    hashAnswer,
    verifyAnswer
} from '@/lib/crypto';

export interface Credential {
  id: string;
  name: string;
  username: string;
  password: string; 
}

export interface SecurityQuestion {
  question: string;
  answerHash: string; // This will be a proper hash
}

// Represents the data as it is stored in localStorage (i.e., encrypted)
interface StoredVault {
    isSetup: boolean;
    masterPasswordHash: string | null;
    encryptedCredentials: { iv: string; data: string; } | null;
    pinHash: string | null;
    securityQuestions: SecurityQuestion[];
}

// Represents the state of the vault in memory (i.e., decrypted)
interface VaultState {
  isSetup: boolean;
  isLocked: boolean | null; // null means loading, true means locked, false means unlocked
  credentials: Credential[];
  pinHash: string | null;
  securityQuestions: SecurityQuestion[];
}

interface VaultContextType {
  vault: VaultState;
  setupVault: (masterPassword: string) => Promise<void>;
  login: (masterPassword: string) => Promise<boolean>;
  logout: () => void;
  addCredential: (credential: Omit<Credential, 'id'>) => Promise<void>;
  updateCredential: (credential: Credential) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  setupRecovery: (questions: { question: string; answer: string }[]) => Promise<void>;
  verifyRecoveryAnswers: (answers: string[]) => Promise<boolean>;
  resetPassword: (newMasterPassword: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// In-memory key, lost on page refresh. This is the goal.
let sessionEncryptionKey: CryptoKey | null = null;

export const VaultProvider = ({ children }: { children: ReactNode }) => {
    const [storedVault, setStoredVault] = useLocalStorage<StoredVault>('hacker-vault-state', {
        isSetup: false,
        masterPasswordHash: null,
        encryptedCredentials: null,
        pinHash: null,
        securityQuestions: [],
    });
  
    const [isUnlockedForSession, setIsUnlockedForSession] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [decryptedCredentials, setDecryptedCredentials] = useState<Credential[]>([]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const decryptAndSetCredentials = useCallback(async () => {
        if (isUnlockedForSession && sessionEncryptionKey && storedVault.encryptedCredentials) {
            try {
                const decrypted = await decryptData(storedVault.encryptedCredentials.data, sessionEncryptionKey, storedVault.encryptedCredentials.iv);
                setDecryptedCredentials(JSON.parse(decrypted));
            } catch (e) {
                console.error("Decryption failed:", e);
                logout(); // If decryption fails, log out for safety.
            }
        } else {
            setDecryptedCredentials([]);
        }
    }, [isUnlockedForSession, storedVault.encryptedCredentials]);

    useEffect(() => {
        decryptAndSetCredentials();
    }, [decryptAndSetCredentials]);
  
    const vault: VaultState = {
        isSetup: storedVault.isSetup,
        isLocked: isClient ? !isUnlockedForSession : null,
        credentials: decryptedCredentials,
        pinHash: storedVault.pinHash,
        securityQuestions: storedVault.securityQuestions || [],
    };

    const setupVault = async (masterPassword: string) => {
        const passwordHash = await hashPassword(masterPassword);
        sessionEncryptionKey = await deriveKeyFromPassword(masterPassword, passwordHash.salt);
        setStoredVault({
            isSetup: true,
            masterPasswordHash: passwordHash.hash,
            encryptedCredentials: null,
            pinHash: null,
            securityQuestions: [],
        });
        setIsUnlockedForSession(true);
    };

    const login = async (masterPassword: string): Promise<boolean> => {
        if (!storedVault.masterPasswordHash) {
            console.error("Login attempt with no master password hash set.");
            return false;
        }
        
        const isValid = await verifyPassword(masterPassword, storedVault.masterPasswordHash);
        
        if (isValid) {
            try {
                const [, metadataB64] = storedVault.masterPasswordHash.split('.');
                if (!metadataB64) {
                    console.error("Cannot derive key: salt metadata is missing from hash.");
                    logout();
                    return false;
                }
                const metadata = JSON.parse(atob(metadataB64));
                const salt = metadata.salt;

                sessionEncryptionKey = await deriveKeyFromPassword(masterPassword, salt);
                setIsUnlockedForSession(true);
                return true;
            } catch(e) {
                console.error("Failed to derive key after login, logging out.", e);
                logout();
                return false;
            }
        } else {
            console.log("Password verification failed.");
            return false;
        }
    };
  
    const logout = () => {
        sessionEncryptionKey = null;
        setIsUnlockedForSession(false);
        setDecryptedCredentials([]);
    };
    
    const persistCredentials = async (credentials: Credential[]) => {
        if (!sessionEncryptionKey) throw new Error("Not logged in");
        const { iv, encryptedData } = await encryptData(JSON.stringify(credentials), sessionEncryptionKey);
        setStoredVault(prev => ({
            ...prev,
            encryptedCredentials: { iv, data: encryptedData },
        }));
        setDecryptedCredentials(credentials);
    };

    const addCredential = async (credential: Omit<Credential, 'id' | 'username'> & { username?: string }) => {
        const newCredentials = [
            ...decryptedCredentials, 
            { ...credential, id: crypto.randomUUID(), username: credential.username || '' }
        ];
        await persistCredentials(newCredentials);
    };

    const updateCredential = async (updatedCredential: Credential) => {
        const newCredentials = decryptedCredentials.map(c => c.id === updatedCredential.id ? updatedCredential : c);
        await persistCredentials(newCredentials);
    };
  
    const deleteCredential = async (id: string) => {
        const newCredentials = decryptedCredentials.filter(c => c.id !== id);
        await persistCredentials(newCredentials);
    };

    const setupPin = async (pin: string) => {
        const newPinHash = await hashPin(pin);
        setStoredVault(prev => ({
            ...prev,
            pinHash: newPinHash,
        }));
    };

    const verifyPin = async (pin: string): Promise<boolean> => {
        if (!vault.pinHash) return false;
        return await verifyPinCrypto(pin, vault.pinHash);
    };

    const setupRecovery = async (questions: { question: string; answer: string }[]) => {
        const hashedQuestions = await Promise.all(questions.map(async (q) => ({
            question: q.question,
            answerHash: await hashAnswer(q.answer),
        })));

        setStoredVault(prev => ({
            ...prev,
            securityQuestions: hashedQuestions,
        }));
    };

    const verifyRecoveryAnswers = async (answers: string[]): Promise<boolean> => {
        if (!vault.securityQuestions || vault.securityQuestions.length !== answers.length) {
            return false;
        }

        const results = await Promise.all(
            vault.securityQuestions.map((sq, index) => verifyAnswer(answers[index], sq.answerHash))
        );
        return results.every(res => res);
    };

    const resetPassword = async (newMasterPassword: string) => {
        const passwordHash = await hashPassword(newMasterPassword);
        sessionEncryptionKey = await deriveKeyFromPassword(newMasterPassword, passwordHash.salt);

        // Re-encrypt credentials with the new key
        const newEncryptedCredentials = sessionEncryptionKey && decryptedCredentials.length > 0 
            ? await encryptData(JSON.stringify(decryptedCredentials), sessionEncryptionKey) 
            : null;

        setStoredVault(prev => ({
            ...prev,
            masterPasswordHash: passwordHash.hash,
            encryptedCredentials: newEncryptedCredentials ? { iv: newEncryptedCredentials.iv, data: newEncryptedCredentials.encryptedData } : null,
        }));
        setIsUnlockedForSession(true);
    };

    const contextValue = {
        vault,
        setupVault,
        login,
        logout,
        addCredential,
        updateCredential,
        deleteCredential,
        setupPin,
        verifyPin,
        setupRecovery,
        verifyRecoveryAnswers,
        resetPassword,
    };

    return (
        <VaultContext.Provider value={contextValue}>
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};
