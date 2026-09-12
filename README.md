# VoidManager

**VoidManager** is a professional, secure employee management platform designed for privacy, security, and strict data minimization. It is part of the VoidRoot ecosystem.

## 🛡️ Security First
VoidManager is built on the principle of "Security by Design." Every feature is reasoned through a threat model before implementation. 

### Key Security Features:
- **Argon2id** Password Hashing.
- **TOTP-based MFA** support.
- **Granular RBAC** (Role-Based Access Control).
- **Field-Level Encryption** (AES-256-GCM).
- **Envelope Encryption** for the Credential Vault.
- **Private Object Storage** with pre-signed URLs.
- **Immutable Audit Logging**.

## 🚀 Tech Stack
- **Backend**: Node.js, TypeScript, NestJS.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **Database**: PostgreSQL.
- **Cache/Session**: Redis.
- **Storage**: MinIO (Dev) / S3 (Prod).
- **Infrastructure**: Docker, Docker Compose.

## 🛠️ Development Setup
Detailed setup instructions are available in `docs/deployment.md` (coming soon).

## 📜 Attribution
**Developer:** Behnood Shafiei
**Copyright (c) 2026 BehnoodShafiei (Behnooddev) (VoidRoot)**
