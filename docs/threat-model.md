# VoidManager Threat Model

## 1. Attack Surface
- **Public API Endpoints**: Primary entry point for all users.
- **File Uploads**: Risk of malware or path traversal.
- **Administrative Interface**: High-value target for privilege escalation.
- **Database/Storage**: Targets for data exfiltration.

## 2. Threat Matrix & Mitigations

| Threat | Vector | Mitigation |
| :--- | :--- | :--- |
| **Account Takeover** | Brute force, Credential stuffing | Argon2id $\rightarrow$ MFA $\rightarrow$ Rate Limiting $\rightarrow$ Account Lockout. |
| **Session Hijacking** | XSS, Packet sniffing | HTTP-only Secure Cookies $\rightarrow$ TLS $\rightarrow$ Session expiration. |
| **BOLA / IDOR** | Manipulating IDs in API calls | Strict server-side ownership checks for every resource access. |
| **Privilege Escalation** | Modifying role requests | Granular RBAC enforced at the Service layer; roles cannot be self-assigned. |
| **SQL Injection** | Unsanitized input | Use of Prisma ORM with parameterized queries. |
| **XSS** | Malicious scripts in profile fields | Strict input validation $\rightarrow$ Output encoding $\rightarrow$ Content Security Policy (CSP). |
| **Path Traversal** | Malicious filenames in uploads | Randomized storage IDs $\rightarrow$ Storage abstraction $\rightarrow$ MIME validation. |
| **Credential Leakage** | Database dump | Envelope encryption for secrets $\rightarrow$ Master Key isolation. |
| **Insider Threat** | Malicious Admin | Comprehensive Audit Logging $\rightarrow$ Separation of duties (Auditor role). |

## 3. Limitations
No system is "unhackable". The primary risk remains the compromise of the Master Encryption Key or a zero-day vulnerability in the underlying framework (Node.js/NestJS). Regular dependency audits via Dependabot are mandated.
