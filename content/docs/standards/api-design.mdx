# API Design Principles

> Guidelines for designing consistent and developer-friendly APIs in ObjectStack

## Core Principles

### 1. Protocol-First Design

All APIs must be defined as **Zod schemas** before implementation:

```typescript
// ✅ Correct - Define schema first
export const CreateRecordRequestSchema = z.object({
  objectName: z.string(),
  data: z.record(z.any()),
  options: z.object({
    returnFields: z.array(z.string()).optional(),
    validateOnly: z.boolean().default(false),
  }).optional(),
});

export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
```

### 2. Consistent Response Envelopes

All API responses use standardized envelope schemas from `@objectstack/spec/api`:

```typescript
import { BaseResponseSchema, SingleRecordResponseSchema } from '@objectstack/spec';

// Success response
{
  success: true,
  data: { /* record data */ },
  metadata: { /* optional metadata */ }
}

// Error response  
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Field "email" is required',
    details: { /* error details */ }
  }
}
```

### 3. Resource-Oriented Design

Follow RESTful resource conventions:

```
GET    /api/v1/objects/{object}/records           # List records
GET    /api/v1/objects/{object}/records/{id}      # Get single record
POST   /api/v1/objects/{object}/records           # Create record
PATCH  /api/v1/objects/{object}/records/{id}      # Update record
DELETE /api/v1/objects/{object}/records/{id}      # Delete record
```

### 4. Versioning

Use URL path versioning:

```
/api/v1/...  # Current stable version
/api/v2/...  # Next version (if needed)
```

## Request Design

### Query Parameters

Use `camelCase` for query parameters:

```typescript
GET /api/v1/objects/account/records?
  fields=name,email&
  filter=status:active&
  orderBy=created_date&
  limit=25&
  offset=0
```

### Request Body

Use `camelCase` for JSON properties:

```typescript
POST /api/v1/objects/account/records

{
  "data": {
    "account_name": "Acme Corp",     // Field name - snake_case
    "annual_revenue": 1000000        // Field name - snake_case
  },
  "options": {
    "returnFields": ["id", "name"],  // Config - camelCase
    "validateOnly": false            // Config - camelCase
  }
}
```

## Response Design

### Success Response Structure

```typescript
{
  "success": true,
  "data": { /* primary response data */ },
  "metadata": {
    "timestamp": "2026-01-22T10:00:00Z",
    "requestId": "req_abc123",
    "duration": 45  // milliseconds
  }
}
```

### Error Response Structure

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "reason": "invalid_format"
    }
  },
  "metadata": {
    "timestamp": "2026-01-22T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Codes

Use consistent error code patterns:

- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR` - Server error

## Pagination

### Offset-Based Pagination

```typescript
GET /api/v1/objects/account/records?limit=25&offset=0

{
  "success": true,
  "data": [/* records */],
  "pagination": {
    "total": 150,
    "limit": 25,
    "offset": 0,
    "hasMore": true
  }
}
```

### Cursor-Based Pagination

```typescript
GET /api/v1/objects/account/records?limit=25&cursor=abc123

{
  "success": true,
  "data": [/* records */],
  "pagination": {
    "limit": 25,
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

## Filtering and Sorting

### Filter Syntax

Use structured filter objects:

```typescript
GET /api/v1/objects/account/records?filter={"status":"active","revenue_gt":100000}

// Or use query string operators:
GET /api/v1/objects/account/records?status=active&revenue_gt=100000
```

### Sort Syntax

```typescript
GET /api/v1/objects/account/records?orderBy=created_date:desc,name:asc
```

## Best Practices

### 1. Use Proper HTTP Methods

- `GET` - Read operations (safe, idempotent)
- `POST` - Create operations
- `PUT` - Full update (replace)
- `PATCH` - Partial update
- `DELETE` - Delete operations

### 2. Return Appropriate Status Codes

- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

### 3. Support Partial Responses

Allow clients to request specific fields:

```typescript
GET /api/v1/objects/account/records?fields=id,name,email
```

### 4. Provide Metadata

Include helpful metadata in responses:

```typescript
{
  "success": true,
  "data": { /* data */ },
  "metadata": {
    "timestamp": "2026-01-22T10:00:00Z",
    "requestId": "req_abc123",
    "duration": 45,
    "version": "1.0"
  }
}
```

## Examples

### Create Record

```typescript
POST /api/v1/objects/customer_account/records

Request:
{
  "data": {
    "account_name": "Acme Corp",
    "annual_revenue": 1000000,
    "industry": "technology"
  },
  "options": {
    "returnFields": ["id", "account_name", "created_date"],
    "validateOnly": false
  }
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "acc_123",
    "account_name": "Acme Corp",
    "created_date": "2026-01-22T10:00:00Z"
  },
  "metadata": {
    "timestamp": "2026-01-22T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### Query Records

```typescript
GET /api/v1/objects/customer_account/records?
  fields=id,account_name,annual_revenue&
  filter={"industry":"technology","revenue_gt":500000}&
  orderBy=annual_revenue:desc&
  limit=10

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "acc_123",
      "account_name": "Acme Corp",
      "annual_revenue": 1000000
    }
    // ... more records
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Related

- [Naming Conventions](./naming-conventions.md)
- [Error Handling](./error-handling.md)
- [REST API Specification](../../content/docs/specifications/server/rest-api.mdx)
