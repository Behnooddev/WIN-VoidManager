# VoidManager Architecture

## 1. Overview
VoidManager is a secure employee management platform designed for high privacy and strict access control. It follows a clean, layered architecture to ensure maintainability, testability, and security.

## 2. High-Level Structure
The project is organized as a monorepo:

- **`apps/api`**: NestJS backend. Handles business logic, authentication, and data orchestration.
- **`apps/web`**: React + Vite + Tailwind CSS frontend. Provides a professional, dark-first administrative interface.
- **`packages/shared`**: Common TypeScript types, Zod validation schemas, and constants.
- **`packages/security`**: Isolated cryptographic primitives and security utilities.
- **`infrastructure/`**: Docker configurations, database migrations, and environment templates.

## 3. Design Patterns
### Layered Architecture
The backend follows a strict layering strategy:
1. **Presentation Layer (Controllers)**: Handles HTTP requests and responses.
2. **Application Layer (Services)**: Orchestrates business logic and enforces security policies.
3. **Domain Layer**: Contains core entities and business rules.
4. **Infrastructure Layer (Repositories/Providers)**: Handles database access and external integrations (S3, Redis, SMTP).

### Security-First Design
- **Deny-by-Default**: All endpoints are locked unless explicitly permitted.
- **Least Privilege**: Roles are mapped to granular permissions.
- **Isolation**: Cryptographic operations are isolated in a dedicated package to minimize the attack surface.

## 4. Component Interaction
1. **Web Client** $\rightarrow$ **API Gateway (NestJS)**
2. **API Gateway** $\rightarrow$ **Auth Guard (Session check via Redis)**
3. **Auth Guard** $\rightarrow$ **RBAC Guard (Permission check)**
4. **Service** $\rightarrow$ **Security Package (Encryption/Decryption)**
5. **Service** $\rightarrow$ **Database (PostgreSQL via Prisma)**
6. **Service** $\rightarrow$ **Storage Provider (MinIO/S3)**
