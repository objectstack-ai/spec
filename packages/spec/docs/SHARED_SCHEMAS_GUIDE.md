# Shared Schema Usage Guide

This guide explains how to use the reusable base schemas and validation patterns in ObjectStack.

## 📦 Base Schemas

The `base-schemas.zod.ts` module provides composable building blocks for common entity patterns.

### TimestampedSchema

For entities that track creation and modification times.

```typescript
import { TimestampedSchema } from '../shared/base-schemas.zod.js';

export const ArticleSchema = TimestampedSchema.extend({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

// Result:
// {
//   id: string;
//   title: string;
//   content: string;
//   createdAt: string; // ISO 8601 datetime
//   updatedAt: string; // ISO 8601 datetime
// }
```

### AuditableSchema

Extends `TimestampedSchema` with user tracking for audit trails.

```typescript
import { AuditableSchema } from '../shared/base-schemas.zod.js';

export const InvoiceSchema = AuditableSchema.extend({
  id: z.string(),
  amount: z.number(),
  status: z.enum(['draft', 'sent', 'paid']),
});

// Result adds:
// createdAt, updatedAt, createdBy, updatedBy
```

### SoftDeletableSchema

Extends `AuditableSchema` with soft delete tracking.

```typescript
import { SoftDeletableSchema } from '../shared/base-schemas.zod.js';

export const ProjectSchema = SoftDeletableSchema.extend({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'archived']),
});

// Result adds:
// createdAt, updatedAt, createdBy, updatedBy, deletedAt?, deletedBy?
```

### NamedEntitySchema

For entities with both machine name (snake_case) and human label (any case).

```typescript
import { NamedEntitySchema } from '../shared/base-schemas.zod.js';

export const CustomFieldSchema = NamedEntitySchema.extend({
  type: z.enum(['text', 'number', 'boolean']),
  required: z.boolean().default(false),
});

// Result:
// {
//   name: string; // snake_case (e.g., "email_address")
//   label: string; // any case (e.g., "Email Address")
//   description?: string;
//   type: 'text' | 'number' | 'boolean';
//   required: boolean;
// }
```

### VersionableSchema

For entities that support semantic versioning.

```typescript
import { VersionableSchema } from '../shared/base-schemas.zod.js';

export const PluginManifestSchema = VersionableSchema.extend({
  id: z.string(),
  name: z.string(),
  dependencies: z.array(z.string()),
});

// Enforces semver: "1.2.3" or "2.0.0-beta.1"
```

### TaggableSchema

For entities with free-form tags.

```typescript
import { TaggableSchema } from '../shared/base-schemas.zod.js';

export const DocumentSchema = TaggableSchema.extend({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

// Adds optional tags: string[]
```

### OwnableSchema

For entities with ownership tracking.

```typescript
import { OwnableSchema } from '../shared/base-schemas.zod.js';

export const FileSchema = OwnableSchema.extend({
  id: z.string(),
  filename: z.string(),
  size: z.number(),
});

// Result:
// {
//   id, filename, size,
//   ownerId: string,
//   ownerType: 'user' | 'team' | 'organization' (default: 'user'),
//   groupId?: string
// }
```

### ActivatableSchema

For entities that can be enabled/disabled.

```typescript
import { ActivatableSchema } from '../shared/base-schemas.zod.js';

export const IntegrationSchema = ActivatableSchema.extend({
  id: z.string(),
  provider: z.string(),
  apiKey: z.string(),
});

// Result:
// {
//   id, provider, apiKey,
//   active: boolean (default: true),
//   activatedAt?: string,
//   deactivatedAt?: string
// }
```

### MetadataContainerSchema

For entities with extensible metadata fields.

```typescript
import { MetadataContainerSchema } from '../shared/base-schemas.zod.js';

export const EventSchema = MetadataContainerSchema.extend({
  id: z.string(),
  type: z.string(),
  timestamp: z.string().datetime(),
});

// Result:
// {
//   id, type, timestamp,
//   metadata?: Record<string, unknown>
// }
```

## 🔧 Validation Patterns

The `validation-patterns.zod.ts` module provides regex patterns and pre-configured schemas.

### Using Regex Constants

```typescript
import { SNAKE_CASE_PATTERN, EMAIL_PATTERN } from '../shared/validation-patterns.zod.js';

export const UserSchema = z.object({
  username: z.string().regex(SNAKE_CASE_PATTERN),
  email: z.string().regex(EMAIL_PATTERN),
});
```

### Using Pre-Configured Schemas

```typescript
import {
  SnakeCaseString,
  EmailString,
  UuidString,
  SemverString,
} from '../shared/validation-patterns.zod.js';

export const PackageSchema = z.object({
  id: UuidString,
  name: SnakeCaseString,
  version: SemverString,
  maintainerEmail: EmailString,
});
```

### Using Length Constraints

```typescript
import { LENGTH_CONSTRAINTS } from '../shared/validation-patterns.zod.js';

export const CommentSchema = z.object({
  title: z.string()
    .min(LENGTH_CONSTRAINTS.SHORT_TEXT.min)
    .max(LENGTH_CONSTRAINTS.SHORT_TEXT.max),
  
  body: z.string()
    .min(LENGTH_CONSTRAINTS.MEDIUM_TEXT.min)
    .max(LENGTH_CONSTRAINTS.MEDIUM_TEXT.max),
});
```

## 🎨 Composition Patterns

### Combining Multiple Base Schemas

```typescript
import {
  NamedEntitySchema,
  AuditableSchema,
  TaggableSchema,
} from '../shared/base-schemas.zod.js';

// Method 1: Using .merge()
export const ResourceSchema = NamedEntitySchema
  .merge(AuditableSchema)
  .merge(TaggableSchema)
  .extend({
    id: z.string(),
    type: z.enum(['document', 'image', 'video']),
  });

// Method 2: Using .extend() with spread (when you need to pick fields)
export const LightweightResourceSchema = z.object({
  id: z.string(),
  ...NamedEntitySchema.shape,
  ...TimestampedSchema.shape,
});
```

### Selective Field Usage

```typescript
import { NamedEntitySchema } from '../shared/base-schemas.zod.js';

// Reuse just the name field with custom constraints
export const CategorySchema = z.object({
  id: z.string(),
  name: NamedEntitySchema.shape.name.max(32), // Add max length
  parentId: z.string().optional(),
});
```

### Creating Domain-Specific Base Schemas

```typescript
import { AuditableSchema, OwnableSchema } from '../shared/base-schemas.zod.js';

// Create your own base schema for a specific domain
export const CRMEntitySchema = AuditableSchema
  .merge(OwnableSchema)
  .extend({
    stage: z.enum(['lead', 'opportunity', 'customer']),
    source: z.string(),
  });

// Now use it across your domain
export const LeadSchema = CRMEntitySchema.extend({
  company: z.string(),
  contactEmail: z.string().email(),
});

export const OpportunitySchema = CRMEntitySchema.extend({
  amount: z.number(),
  closeDate: z.string().datetime(),
});
```

## 📋 Best Practices

### 1. Always Export Types

```typescript
export const MySchema = z.object({...});
export type MyType = z.infer<typeof MySchema>;

// For schemas with .default() or .transform()
export type MyTypeInput = z.input<typeof MySchema>;
```

### 2. Use .describe() on All Fields

```typescript
export const UserSchema = z.object({
  id: z.string().describe('Unique user identifier'),
  email: EmailString.describe('User email address'),
  role: z.enum(['admin', 'user']).describe('User role in the system'),
});
```

### 3. Prefer Composition Over Duplication

```typescript
// ❌ BAD: Duplicating timestamp fields
export const PostSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // ... other fields
});

// ✅ GOOD: Using TimestampedSchema
export const PostSchema = TimestampedSchema.extend({
  // ... other fields
});
```

### 4. Use Discriminated Unions for Polymorphic Types

```typescript
import { NamedEntitySchema } from '../shared/base-schemas.zod.js';

const TextFieldSchema = NamedEntitySchema.extend({
  type: z.literal('text'),
  maxLength: z.number().optional(),
});

const NumberFieldSchema = NamedEntitySchema.extend({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const FieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  NumberFieldSchema,
]);
```

### 5. Keep Machine Names and Labels Separate

```typescript
// ❌ BAD: Using label-like names for machine identifiers
const BadSchema = z.object({
  name: z.string(), // Is this "User Profile" or "user_profile"?
});

// ✅ GOOD: Use NamedEntitySchema to enforce the distinction
const GoodSchema = NamedEntitySchema.extend({
  // name: snake_case machine name
  // label: human-readable display name
});
```

## 🧪 Testing with Shared Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { MySchema } from './my-schema.zod.js';

describe('MySchema', () => {
  it('should validate timestamps from base schema', () => {
    const valid = {
      // ... your fields
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
    };
    expect(() => MySchema.parse(valid)).not.toThrow();
  });
});
```

## 📚 Reference

### All Available Base Schemas

- `TimestampedSchema` - createdAt, updatedAt
- `AuditableSchema` - extends Timestamped + createdBy, updatedBy
- `SoftDeletableSchema` - extends Auditable + deletedAt?, deletedBy?
- `NamedEntitySchema` - name, label, description?
- `VersionableSchema` - version, versionHistory?
- `TaggableSchema` - tags?
- `OwnableSchema` - ownerId, ownerType, groupId?
- `ActivatableSchema` - active, activatedAt?, deactivatedAt?
- `MetadataContainerSchema` - metadata?

### Available Validation Patterns

- Identifiers: `SNAKE_CASE_PATTERN`, `CAMEL_CASE_PATTERN`, `PASCAL_CASE_PATTERN`, `KEBAB_CASE_PATTERN`
- Versions: `SEMVER_PATTERN`, `VERSION_PATTERN`
- URLs: `URL_SLUG_PATTERN`, `HTTP_URL_PATTERN`
- Data: `EMAIL_PATTERN`, `PHONE_PATTERN`, `UUID_V4_PATTERN`
- Security: `STRONG_PASSWORD_PATTERN`, `JWT_PATTERN`
- And 10+ more...

### Available Pre-Configured Schemas

- `SnakeCaseString`, `DotNotationString`
- `SemverString`, `UrlSlugString`
- `EmailString`, `UuidString`
- `HexColorString`, `HttpUrlString`
