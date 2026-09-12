# VoidManager Security Specification

## 1. Authentication (AuthN)
### Password Hashing
- **Algorithm**: Argon2id.
- **Standard**: Passwords are never stored in plaintext. Salting is handled automatically by the library.

### Session Management
- **Mechanism**: Server-side sessions stored in Redis.
- **Transport**: Secure, HTTP-only, SameSite=Strict cookies.
- **Lifecycle**: Sessions have a fixed expiration time and can be revoked immediately by administrators.

### Multi-Factor Authentication (MFA)
- **Standard**: TOTP (Time-based One-Time Password).
- **Requirement**: Can be enforced globally or per-user.
- **Recovery**: Securely stored recovery codes for account restoration.

## 2. Authorization (AuthZ)
### RBAC Model
VoidManager uses Granular Role-Based Access Control.
- **Permissions**: Atomic strings (e.g., `employee.read`, `credential.reveal`).
- **Roles**: Named groups of permissions (e.g., `SuperAdmin`, `HR`, `Manager`, `Employee`).

### Enforcement
- **Backend-First**: Every API request is validated against the user's permissions on the server.
- **Ownership Validation**: Middleware ensures users cannot access resources they do not own (prevents IDOR/BOLA).
- **Contextual Scope**: Managers' access is restricted to their specific organizational unit.

## 3. Encryption Architecture
### Data at Rest
- **Algorithm**: AES-256-GCM (Authenticated Encryption).
- **Scope**: Sensitive fields (Address, Phone, Emergency Contacts) are encrypted before being stored in PostgreSQL.

### Credential Vault (Envelope Encryption)
To ensure high security for credentials:
1. **Master Key (MK)**: A root key stored in a secure KMS or environment variable.
2. **Data Encryption Key (DEK)**: A unique key generated for each secret.
3. **Storage**: 
   - `Encrypted_Value = AES_GCM(Secret, DEK)`
   - `Encrypted_DEK = AES_GCM(DEK, MK)`
4. **Rotation**: Master key rotation only requires re-encrypting DEKs, not the actual secrets.

## 4. Key Management
- **Abstraction**: A `KeyManagementService` interface allows switching between providers (Local $\rightarrow$ HashiCorp Vault $\rightarrow$ AWS KMS).
- **Zero-Leak Policy**: Keys are never committed to Git and never printed in logs.
