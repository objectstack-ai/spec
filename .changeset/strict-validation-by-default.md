---
"@objectstack/spec": patch
---

**Breaking Change: Strict Validation Enabled by Default**

`defineStack()` now validates configurations by default to enforce naming conventions and catch errors early.

**What Changed:**
- `defineStack()` now defaults to `strict: true` (was `strict: false`)
- Field names are now validated to ensure snake_case format
- Object names, field types, and all schema definitions are validated

**Migration Guide:**

If you have existing code that violates naming conventions:

```typescript
// Before (would silently accept invalid names):
defineStack({
  manifest: {...},
  objects: [{
    name: 'my_object',
    fields: {
      firstName: { type: 'text' }  // ❌ Invalid: camelCase
    }
  }]
});

// After (will throw validation error):
// Error: Field names must be lowercase snake_case

// Fix: Use snake_case
defineStack({
  manifest: {...},
  objects: [{
    name: 'my_object',
    fields: {
      first_name: { type: 'text' }  // ✅ Valid: snake_case
    }
  }]
});
```

**Temporary Workaround:**

If you need to temporarily disable validation while fixing your code:

```typescript
defineStack(config, { strict: false });  // Bypass validation
```

**Why This Change:**

1. **Catches Errors Early**: Invalid field names caught during development, not runtime
2. **Enforces Conventions**: Ensures consistent snake_case naming across all projects
3. **Prevents AI Hallucinations**: AI-generated objects must follow proper conventions
4. **Database Compatibility**: snake_case prevents case-sensitivity issues in queries

**Impact:**

- Projects with properly named fields (snake_case): ✅ No changes needed
- Projects with camelCase/PascalCase fields: ⚠️ Must update field names or use `strict: false`
