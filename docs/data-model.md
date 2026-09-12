# VoidManager Data Model

## 1. Entity Relationship Diagram (Conceptual)

### Core Entities
- **User**: Identity and authentication details.
- **Employee**: Professional profile linked to a User.
- **Department**: Organizational grouping for employees.
- **Role**: A collection of granular permissions.
- **Permission**: The smallest unit of access control.

### Supporting Entities
- **Document**: Metadata for stored files, linked to an Employee.
- **Credential**: Encrypted vault entries linked to an Employee.
- **AuditLog**: Immutable record of security events.
- **CustomField**: Admin-defined field definitions.
- **CustomFieldValue**: Values for custom fields linked to employees.

## 2. Schema Design Principles
- **Normalization**: 3NF to ensure data integrity.
- **Referential Integrity**: Strict use of foreign keys.
- **Auditability**: Every table includes `created_at` and `updated_at` timestamps.
- **Privacy**: Sensitive data is stored in encrypted format; search is limited to non-sensitive indices.

## 3. Custom Fields (EAV Model)
To support dynamic fields without schema changes, an Entity-Attribute-Value (EAV) approach is used:
- **`CustomField`**: `id`, `name`, `type` (text, boolean, date, etc.), `is_required`.
- **`CustomFieldValue`**: `id`, `field_id`, `employee_id`, `value` (stored as text/json).
