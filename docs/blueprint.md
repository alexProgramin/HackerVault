# **App Name**: HackerVault

## Core Features:

- Vault Management: Secure vault creation and unlocking using a master password derived with Argon2id.
- Entry Management: Create, read, update, and delete entries with fields for title, username, password, URL, and notes, all encrypted.
- TOTP Authentication: Offline Time-based One-time Password (TOTP) generation with encrypted secret storage for two-factor authentication.
- Password Generation: Advanced password generator with customizable length and character sets, including options to avoid ambiguous characters.
- Vault Export/Import: Export and import encrypted vault data using a passphrase, ensuring secure backup and transfer.
- Biometric Unlock: Optional biometric unlock for convenient access, secured with Keystore-wrapped Data Key encryption.
- Password Strength Analyzer: AI-powered tool that analyses password strength based on current security standards, displaying real-time suggestions to the user as they input characters.

## Style Guidelines:

- Primary color: Red (#FF2A2A), chosen to evoke feelings of alert, warnings and security.
- Background color: Black (#0B0B0D), nearly desaturated hue of the primary red.
- Accent color: Neon Green (#00E676), chosen for its strong contrast with the background and alignment with a hacking theme.
- Font: 'Source Code Pro' (monospace) Note: currently only Google Fonts are supported.
- Full-screen binary overlay as a subtle, low-opacity backdrop to reinforce the 'Hacker' theme.
- Use a set of glyph icons representing the core features of a password vault.
- Create animations that transition the interface from one page to another.