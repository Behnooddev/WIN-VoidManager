# VoidManager — Secure Employee Management Platform

You are an expert software architect, security engineer, backend engineer, frontend engineer, and DevOps engineer.

Build a complete, production-oriented employee management platform called **VoidManager**.

VoidManager is a private company system for securely managing employee profiles, employee-provided personal information, documents, credentials, and internal records.

This project will be maintained as a real GitHub repository. Do not produce a toy project, mockup-only application, or simplified tutorial implementation.

---

## 1. Project Identity

**Project name:** VoidManager

**Developer:** Behnood Shafiei

**Copyright:**

Copyright (c) 2026 BehnoodShafiei (Behnooddev) (VoidRoot)

VoidManager is part of the VoidRoot ecosystem.

The project must be designed around:

* Privacy
* Security
* Data minimization
* Explicit user consent
* Least-privilege access
* Secure authentication
* Strong encryption
* Auditing
* Maintainability
* Clean architecture
* Professional UX

Never claim that the application is "100% secure" or "unhackable". Security should be implemented realistically and documented with its limitations.

---

# 2. Core Concept

Each employee has a dedicated profile.

A profile may contain information such as:

* First name
* Last name
* Preferred name
* Employee ID
* Profile photo
* Date of birth, only when legitimately required
* Phone numbers
* Email addresses
* Address
* Emergency contact
* Social media/contact links
* Job title
* Department
* Employment status
* Start date
* Notes
* Employee-provided custom fields
* Documents
* Secure credentials/secrets, when legitimately required by the company

The system must allow authorized users to organize employee information into logical categories.

Employees must be able to control or review information that the company allows them to manage themselves.

---

# 3. Important Privacy Requirement

Treat employee data as highly sensitive personal data.

Do NOT design the system around collecting as much information as possible.

Implement:

* Data minimization
* Purpose limitation
* Explicit consent where appropriate
* Configurable retention policies
* Secure deletion
* Access control
* Auditability
* Privacy-friendly defaults

Do not collect sensitive information merely because the application technically supports it.

The system must make it clear which information is:

1. Required by the organization
2. Optional
3. Provided by the employee
4. Restricted
5. Visible only to specific roles

---

# 4. Authentication

Implement a robust authentication system.

Requirements:

* Secure password hashing using Argon2id or another modern password hashing algorithm
* Never store plaintext passwords
* Never log passwords
* Never expose passwords through API responses
* Secure session management
* Session expiration
* Session revocation
* Secure logout
* Login rate limiting
* Brute-force protection
* Account lockout or progressive delays
* Secure password reset flow
* Email verification where applicable
* Optional MFA
* TOTP-based MFA support
* Recovery codes stored securely
* Protection against session fixation
* Protection against CSRF where applicable
* Secure cookie configuration
* Appropriate security headers

Do not implement fake authentication such as:

```text
admin/admin
```

Do not hardcode credentials anywhere in the repository.

---

# 5. Role-Based Access Control

Implement proper RBAC.

At minimum support:

### Super Admin

Full system administration.

### HR/Admin

Can manage employee records according to assigned permissions.

### Manager

Can access employees assigned to their organizational scope.

### Employee

Can access their own permitted information.

### Auditor

Read-only access to appropriate audit information.

Permissions must be granular.

Examples:

```text
employee.read
employee.create
employee.update
employee.delete

employee.documents.read
employee.documents.upload
employee.documents.delete

employee.credentials.read
employee.credentials.create
employee.credentials.update
employee.credentials.delete

audit.read
system.manage
users.manage
roles.manage
```

Do not rely only on frontend permission checks.

Every sensitive authorization decision must also be enforced server-side.

---

# 6. Employee Profiles

Create a complete employee profile system.

Profile sections should include:

### Basic Information

* First name
* Last name
* Preferred name
* Employee ID
* Profile picture

### Contact

* Email
* Phone
* Secondary phone
* Address
* Emergency contact

### Employment

* Department
* Position
* Manager
* Employment status
* Start date
* End date
* Internal notes

### Social / External Contacts

Allow configurable links such as:

* LinkedIn
* GitHub
* X
* Instagram
* Personal website
* Other custom platforms

Do not assume every employee has every platform.

---

# 7. Custom Fields

The system should support administrator-defined custom fields.

Examples:

```text
Field name: Office Location
Type: text

Field name: Employment Type
Type: select

Field name: Remote Worker
Type: boolean

Field name: Contract Expiration
Type: date
```

Support appropriate field types:

* Text
* Number
* Boolean
* Date
* Select
* Multi-select
* URL

Custom fields must still respect permissions and privacy rules.

---

# 8. Secure Document Management

Employees may have documents associated with their profile.

Examples:

* Contracts
* Certifications
* Identification documents
* Internal HR documents
* Training documents
* Other company-approved documents

Documents must be categorized.

Example categories:

```text
Contracts
Identity
Legal
Training
Certificates
HR
Other
```

Requirements:

* Secure upload
* File type validation
* File size limits
* Malware scanning integration point
* Randomized storage identifiers
* Never trust original filenames
* Prevent path traversal
* Prevent arbitrary file execution
* Access-controlled downloads
* Document metadata
* Upload timestamp
* Uploader information
* Versioning where appropriate
* Secure deletion
* Audit logging

Do not expose private files through predictable public URLs.

Use authorization checks before every document download.

---

# 9. Credential / Secret Vault

VoidManager may contain sensitive credentials when an organization legitimately needs to manage them.

Examples:

* Company service credentials
* Internal account credentials
* API credentials
* Recovery information

This section must be treated as a separate high-security subsystem.

Never store credentials as plaintext.

Use strong encryption for secret values.

Prefer envelope encryption:

```text
Master Key
    ↓
Data Encryption Keys
    ↓
Encrypted Secret Values
```

The encryption design must support key rotation.

Secret values must never appear in:

* Logs
* Error messages
* Analytics
* Database query logs
* API debug output
* Frontend source
* Browser localStorage
* URLs
* Audit logs

The UI should require an explicit user action before revealing a secret.

Implement:

* Permission checks
* Re-authentication for sensitive operations
* Optional MFA step-up
* Secret reveal auditing
* Secret update auditing
* Secret deletion auditing
* Copy-to-clipboard controls
* Automatic clipboard clearing where reasonably possible
* Visibility timeout

Do not implement any mechanism intended to secretly monitor employees.

---

# 10. Encryption

Encryption is a core requirement.

Implement encryption for sensitive data at rest.

Use modern, authenticated encryption such as:

* AES-256-GCM

or an equivalent modern authenticated encryption construction.

Never invent cryptographic algorithms.

Never implement custom cryptography.

Use established, audited cryptographic libraries.

Sensitive fields should be encrypted where appropriate.

Examples:

* Address
* Personal phone numbers
* Emergency contact information
* Sensitive notes
* Credential values
* Sensitive document metadata

Passwords used for authentication must be HASHED, not encrypted.

This distinction must be documented clearly.

---

# 11. Key Management

Do not hardcode encryption keys.

Do not commit secrets to Git.

Support environment-based secret configuration for development.

For production, design the architecture so encryption keys can be supplied through a proper secrets-management system such as:

* HashiCorp Vault
* Cloud KMS
* AWS KMS
* Azure Key Vault
* Google Cloud KMS

Create a clean abstraction around key management so the application is not permanently coupled to one provider.

Document:

* Key generation
* Key storage
* Key rotation
* Key revocation
* Backup strategy
* Recovery strategy

Never print keys in logs.

---

# 12. Database Security

Use a relational database.

Design normalized schemas for:

```text
users
employees
departments
roles
permissions
role_permissions
user_roles
employee_documents
document_categories
employee_credentials
sessions
mfa_methods
audit_logs
custom_fields
custom_field_values
notifications
```

Add:

* Foreign keys
* Unique constraints
* Appropriate indexes
* Created timestamps
* Updated timestamps
* Soft deletion where appropriate
* Referential integrity

Sensitive encrypted values should not be searchable directly unless a privacy-preserving search strategy is deliberately implemented.

Do not store unnecessary personal information.

---

# 13. Audit Logging

Implement a robust audit system.

Record security-sensitive events such as:

* Login
* Failed login
* Logout
* Password change
* MFA changes
* Employee creation
* Employee modification
* Employee deletion
* Document upload
* Document download
* Document deletion
* Credential creation
* Credential update
* Credential reveal
* Credential deletion
* Permission changes
* Role changes
* Security configuration changes

Audit logs should contain useful metadata such as:

* Event type
* Actor
* Target
* Timestamp
* Result
* IP address when appropriate
* User agent when appropriate

Never store secret values in audit logs.

Audit logs themselves must be protected against unauthorized modification.

---

# 14. Search

Implement secure employee search.

Search should support:

* Name
* Employee ID
* Department
* Position
* Employment status

Do not accidentally expose restricted fields through search results.

Search results must respect the authenticated user's permissions.

Do not return sensitive information simply because it exists in the database.

---

# 15. Dashboard

Create a professional dashboard.

Possible widgets:

* Total employees
* Active employees
* Departments
* Pending documents
* Recently updated profiles
* Security events
* Recent administrative activity

Dashboard data must respect user permissions.

Do not expose sensitive employee information in aggregate dashboards unnecessarily.

---

# 16. Employee Self-Service

Employees should have a dedicated view of their own profile.

Allow them to:

* View permitted information
* Update permitted fields
* Upload permitted documents
* Manage their account
* Configure MFA
* Review active sessions
* Review relevant account activity
* Request correction of information

Administrators should be able to configure which fields employees may edit.

---

# 17. Sessions & Security Center

Create a security center.

Users should be able to see:

* Current session
* Other active sessions
* Approximate login information
* Last login
* MFA status
* Password status
* Security events

Allow users with appropriate permissions to revoke sessions.

---

# 18. Notifications

Implement a notification system for important events.

Examples:

* Password changed
* MFA enabled/disabled
* New login
* New document uploaded
* Permission changed
* Account status changed

Notifications must never include sensitive secrets.

---

# 19. API Security

All sensitive API endpoints must require authentication and authorization.

Implement:

* Input validation
* Schema validation
* Rate limiting
* Request size limits
* Secure error handling
* Consistent HTTP status codes
* Authorization middleware/guards
* CSRF protection where applicable
* CORS configuration
* Security headers
* API versioning
* Request IDs

Never return stack traces in production.

Never expose internal database errors directly to clients.

---

# 20. Frontend Security

The frontend must never be trusted for security decisions.

Never store:

* Authentication secrets
* Encryption master keys
* Employee passwords
* Credential vault keys

in:

```text
localStorage
sessionStorage
URL parameters
frontend source code
```

Use secure HTTP-only cookies or another appropriate secure authentication architecture.

Avoid exposing sensitive information in browser state unnecessarily.

Prevent:

* XSS
* DOM injection
* unsafe HTML rendering
* insecure redirects
* sensitive data leakage through URLs

---

# 21. UI / UX

Design a modern professional interface.

Visual direction:

* Dark-first
* Minimal
* Clean
* Modern
* Professional
* Subtle glassmorphism
* Strong typography
* Excellent spacing
* Responsive layout
* Desktop-first but responsive
* No unnecessary cyberpunk aesthetics

VoidManager should feel like serious enterprise software.

Avoid excessive gradients, glowing neon effects, gaming UI, or childish visual elements.

Include:

* Sidebar navigation
* Top navigation
* Global search
* Breadcrumbs
* Tables
* Profile cards
* Secure document browser
* Security center
* Audit log viewer
* Settings
* Permission management

---

# 22. Accessibility

Follow modern accessibility practices.

Implement:

* Keyboard navigation
* Focus states
* Semantic HTML
* Accessible forms
* Screen-reader-friendly labels
* Good contrast
* Error messages that are understandable
* Reduced-motion support

---

# 23. File Storage Architecture

Do not store uploaded documents directly in a public web directory.

Support an abstraction such as:

```text
StorageProvider
├── LocalStorageProvider
├── S3StorageProvider
└── MinIOStorageProvider
```

Development may use local storage or MinIO.

Production should support private object storage.

All file access must go through authorization checks.

---

# 24. Docker

Provide Docker support.

Development environment should be reproducible.

Include services such as:

```text
Application
Database
Redis
Object Storage
```

depending on the selected architecture.

Provide:

```text
docker-compose.yml
.env.example
```

Never include real secrets in `.env.example`.

---

# 25. Environment Configuration

Use environment variables for:

* Database credentials
* Session secrets
* Encryption configuration
* Storage credentials
* Email configuration
* OAuth configuration
* MFA configuration
* Application URLs

Provide:

```text
.env.example
```

with safe placeholder values.

Never commit:

```text
.env
*.key
*.pem
credentials.json
private certificates
production secrets
```

unless a specific file is intentionally a public development fixture and contains no real secret.

---

# 26. Email

Create an email provider abstraction.

Support:

```text
EmailProvider
├── SMTPProvider
└── DevelopmentMailProvider
```

Use it for:

* Password reset
* Email verification
* Security notifications
* Account notifications

Do not put passwords or secret values inside emails.

---

# 27. Error Handling

Implement centralized error handling.

Development may expose detailed debugging information.

Production must return safe error messages.

Never expose:

* Stack traces
* SQL queries
* Encryption information
* Internal filesystem paths
* Secrets
* Authentication tokens
* Private employee data

---

# 28. Logging

Implement structured logging.

Logs must be useful for debugging and security monitoring.

NEVER log:

* Passwords
* Session tokens
* MFA secrets
* Recovery codes
* Encryption keys
* Credential values
* Private document contents
* Sensitive employee fields

Implement log redaction where appropriate.

---

# 29. Testing

Create a serious testing strategy.

Include:

### Unit Tests

Test:

* Authentication
* Authorization
* Encryption utilities
* Validation
* Services
* Permission checks

### Integration Tests

Test:

* Authentication flows
* Database operations
* File storage
* RBAC
* Document access
* Credential vault

### Security Tests

Test:

* Unauthorized access
* Horizontal privilege escalation
* Vertical privilege escalation
* IDOR/BOLA
* Session invalidation
* Rate limiting
* Input validation
* File upload security
* Access to restricted documents
* Restricted credential access

A user must never be able to access another employee's information merely by changing an ID in an API request.

---

# 30. Security Threat Model

Create a security documentation section.

Document threats including:

* Account takeover
* Stolen sessions
* Insider threats
* Privilege escalation
* IDOR/BOLA
* Database compromise
* File upload attacks
* XSS
* CSRF
* SQL injection
* Brute-force attacks
* Credential leakage
* Misconfigured storage
* Backup exposure
* Supply-chain vulnerabilities

For each threat, document the implemented mitigation.

---

# 31. Backup & Recovery

Design a backup strategy.

Document:

* Database backups
* Object-storage backups
* Encryption of backups
* Backup retention
* Recovery testing
* Key recovery considerations

Never assume backups are safe merely because the primary database is encrypted.

---

# 32. Data Retention & Deletion

Implement configurable retention policies.

Support:

* Employee record archival
* Document retention
* Secure deletion
* Account deletion
* Data export where appropriate

Be careful with audit logs: some records may need separate retention policies.

Do not immediately destroy audit records simply because an employee profile is deleted unless policy explicitly requires it.

---

# 33. Data Export

Allow authorized administrators to export appropriate employee information.

Exports must:

* Require authorization
* Be auditable
* Avoid unnecessary sensitive fields
* Have secure temporary storage
* Expire automatically
* Never be publicly accessible

Do not create permanent public download URLs.

---

# 34. Architecture

Use a clean, maintainable architecture.

Separate:

```text
Presentation
Application
Domain
Infrastructure
```

Keep security-sensitive functionality isolated.

Examples:

```text
AuthService
AuthorizationService
EncryptionService
KeyManagementService
EmployeeService
DocumentService
CredentialVaultService
AuditService
NotificationService
StorageService
```

Do not place all application logic into a single controller or route file.

---

# 35. Recommended Technology

Use modern stable technologies.

Preferred stack:

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Accessible component architecture

### Backend

* Node.js
* TypeScript
* NestJS

### Database

* PostgreSQL

### ORM

* Prisma or TypeORM

### Cache / Sessions / Rate Limiting

* Redis

### Object Storage

* MinIO for development
* S3-compatible storage for production

### Containerization

* Docker
* Docker Compose

If you have a strong technical reason to change any technology, document the reason before doing so.

---

# 36. Repository Structure

Create a clean repository structure similar to:

```text
VoidManager/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── security/
│   └── config/
├── infrastructure/
├── docs/
├── scripts/
├── tests/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

Adapt this structure if the selected architecture requires something better.

---

# 37. GitHub Standards

The repository must be GitHub-ready.

Include:

* README.md
* LICENSE
* SECURITY.md
* CONTRIBUTING.md
* CODE_OF_CONDUCT.md
* Architecture documentation
* Threat model
* Deployment documentation
* Development setup
* Environment configuration documentation

README and documentation must be professional.

Do not write documentation that sounds like it was generated by an AI.

Do not use phrases such as:

```text
This project was generated by AI.
As an AI...
Here is a comprehensive guide...
```

Do not add unnecessary emojis to repository documentation.

---

# 38. GitHub Security

Configure appropriate GitHub security features where possible.

Include:

* Dependabot configuration
* Code scanning configuration
* Secret scanning guidance
* CI security checks
* Dependency auditing
* Automated tests

Do not commit real credentials.

Do not commit private keys.

Do not commit production certificates.

---

# 39. CI/CD

Create GitHub Actions for:

```text
Install dependencies
Lint
Typecheck
Unit tests
Integration tests
Build frontend
Build backend
Security/dependency checks
```

The CI pipeline must fail when important checks fail.

Do not silently ignore security or test failures.

---

# 40. Documentation

Create documentation explaining:

```text
docs/
├── architecture.md
├── authentication.md
├── authorization.md
├── encryption.md
├── key-management.md
├── threat-model.md
├── data-model.md
├── file-storage.md
├── deployment.md
├── backup-and-recovery.md
└── security.md
```

Explain security decisions rather than merely listing technologies.

---

# 41. Secure Defaults

The application must be secure by default.

Examples:

* New accounts have minimum permissions
* Documents are private by default
* Sensitive profile fields are restricted by default
* MFA can be required by administrators
* Sessions expire
* Rate limiting is enabled
* Production errors are sanitized
* Debug mode is disabled in production
* CORS is restrictive by default
* Object storage is private by default

---

# 42. No Hidden Monitoring

VoidManager must NOT contain:

* Hidden employee surveillance
* Keyloggers
* Secret screen recording
* Hidden microphone recording
* Hidden webcam access
* Stealth tracking
* Undisclosed telemetry
* Secret data collection

All monitoring or auditing features must be transparent and legitimately related to system security and administration.

---

# 43. No Fake Security

Do not add meaningless features just to make the application appear secure.

Examples of unacceptable implementations:

```text
Base64 as encryption
MD5 passwords
SHA1 passwords
Hardcoded AES keys
Plaintext secrets
Fake MFA
Fake RBAC
Frontend-only authorization
Public document URLs
Security headers that do not actually protect anything
```

Use established security libraries and standards.

---

# 44. Production Readiness

Before considering the project complete, verify:

* Authentication works
* Authorization works server-side
* RBAC works
* Sensitive fields are protected
* Passwords are hashed
* Secrets are encrypted
* Encryption keys are not stored in source code
* Documents are private
* File uploads are validated
* Audit logs work
* Sessions can be revoked
* MFA works
* Rate limiting works
* Security headers are configured
* Error handling is safe
* Tests pass
* Docker setup works
* CI passes
* Documentation is complete

---

# 45. Development Rules

Do not generate the entire application as one giant file.

Use clean modules.

Do not leave fake implementations such as:

```text
TODO: implement security later
```

for core security functionality.

If a feature cannot safely be implemented yet, clearly mark it as incomplete rather than pretending it is secure.

Do not silently replace security requirements with weaker alternatives.

If an architectural decision has significant security implications, explain the decision in the relevant documentation.

---

# 46. Code Quality

Use:

* TypeScript strict mode
* Strong typing
* Input validation
* Consistent naming
* Small maintainable modules
* Clear interfaces
* Dependency injection where appropriate
* Centralized configuration
* Centralized error handling
* Automated formatting
* Linting

Avoid unnecessary abstractions.

Avoid duplicated security logic.

---

# 47. Copyright / Attribution

The following attribution must be included in appropriate project files and documentation:

```text
Developer: Behnood Shafiei

Copyright (c) 2026 BehnoodShafiei (Behnooddev) (VoidRoot)
```

Do not replace this attribution with an AI-generated author name.

Do not add fake contributors.

---

# 48. Final Requirement

Build VoidManager as a real secure application, not a visual prototype.

Prioritize:

1. Security
2. Privacy
3. Correct authorization
4. Data integrity
5. Maintainability
6. User experience
7. Performance

Before generating implementation code, reason through the architecture, database model, authentication model, authorization model, encryption architecture, file-storage model, and threat model.

Then implement the project incrementally.

At every stage, keep the project runnable.

Do not expose secrets in source code.

Do not weaken security requirements merely to simplify implementation.

The final repository should be clean, professional, documented, testable, Docker-compatible, and ready for continued development as part of the VoidRoot ecosystem.
