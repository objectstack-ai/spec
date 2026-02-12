# Field Name Validation Fix - Technical Summary

## Issue Report (Chinese)
按规则，字段名必须是 snake_case，这里的代码是怎么 test 通过的？为什么启动没有报错？

**Translation:**
According to the rules, field names must be snake_case. How did this code pass the tests? Why didn't it report an error at startup?

## Root Cause Analysis

### The Problem
The ObjectStack Protocol specification mandates snake_case naming for field names, but this validation was not being enforced in practice.

### Investigation Findings

1. **Field Schema Validation EXISTS** (but wasn't running):
   - Location: `packages/spec/src/data/field.zod.ts:346`
   - Regex: `/^[a-z_][a-z0-9_]*$/`
   - Field `name` property is optional and validated when provided

2. **Object Schema Validation EXISTS** (but wasn't running):
   - Location: `packages/spec/src/data/object.zod.ts:263-265`
   - Field **keys** in `fields` record validated with same regex
   - Custom error message: "Field names must be lowercase snake_case"

3. **defineStack() Bypassed Validation**:
   - Location: `packages/spec/src/stack.zod.ts:335-337`
   - Default was `strict: false`
   - When `strict: false`, returned config as-is **without any validation**
   - Code: `if (!options?.strict) { return config as ObjectStackDefinition; }`

### Why Tests Passed

The test suite was passing because:
- Tests that checked validation explicitly used `ObjectSchema.parse()` 
- Tests that used `defineStack()` relied on default `strict: false` behavior
- The validation logic itself was correct, just never executed
- Examples used `as any` casts to bypass TypeScript checking

### Why No Runtime Errors

Runtime didn't fail because:
- `defineStack()` with default options skipped validation entirely
- Invalid field names were accepted and passed through
- Only when strict=true was explicitly set would validation run

## Solution Implemented

### Core Fix
Changed `defineStack()` default from `strict: false` to `strict: true`:

```typescript
// Before (packages/spec/src/stack.zod.ts)
/**
 * @default false  // ❌ BAD: No validation by default
 */
strict?: boolean;

if (!options?.strict) {
  return config as ObjectStackDefinition;  // ❌ Skip validation
}

// After
/**
 * @default true  // ✅ GOOD: Validate by default
 */
strict?: boolean;

const strict = options?.strict !== false;  // ✅ Default to true

if (!strict) {
  return config as ObjectStackDefinition;  // Only skip if explicitly requested
}
```

### Additional Changes

1. **Updated Tests** (`packages/spec/src/stack.test.ts`):
   - Fixed test expecting old behavior
   - Added 4 new field name validation tests
   - Verified camelCase/PascalCase rejection
   - Verified snake_case acceptance
   - Verified strict=false bypass

2. **Added Validation Tests** (`packages/spec/src/data/field-name-validation.test.ts`):
   - Direct FieldSchema validation tests
   - Confirms regex works correctly

3. **Created Changeset** (`.changeset/strict-validation-by-default.md`):
   - Documents breaking change
   - Migration guide for users
   - Explains benefits and impact

## Validation Rules Reference

### Valid Field Names (snake_case)
```typescript
✅ first_name
✅ last_name
✅ email
✅ company_name
✅ annual_revenue
✅ _system_id
```

### Invalid Field Names
```typescript
❌ firstName      // camelCase
❌ FirstName      // PascalCase
❌ first-name     // kebab-case
❌ first name     // spaces
❌ 123field       // starts with number
❌ first.name     // dots
```

## Validation Flow

### With strict=true (NEW DEFAULT)
```
defineStack(config)
  ↓
ObjectStackDefinitionSchema.safeParse(config)
  ↓
ObjectSchema validation
  ↓
fields: z.record(regex validation on keys)
  ↓
Reject if any field key is not snake_case
  ↓
Cross-reference validation
  ↓
Return validated data
```

### With strict=false (OPT-OUT)
```
defineStack(config, { strict: false })
  ↓
Return config as-is (NO VALIDATION)
```

## Impact Assessment

### Breaking Change
This is a **major version breaking change** because:
- Existing code with invalid field names will now fail
- Default behavior changed from permissive to strict
- Migration required for affected projects

### Benefits
1. **Early Error Detection**: Catches naming violations during development
2. **Convention Enforcement**: Ensures consistent snake_case naming
3. **Database Compatibility**: Prevents case-sensitivity issues in SQL queries
4. **AI Safety**: Prevents AI-generated objects from violating conventions
5. **Better DX**: Clear error messages guide developers to fix issues

### Migration Path

**Option 1: Fix Field Names (Recommended)**
```typescript
// Change field definitions to use snake_case
fields: {
  first_name: Field.text(),  // ✅ Fixed
  last_name: Field.text(),   // ✅ Fixed
}
```

**Option 2: Temporary Bypass (Not Recommended)**
```typescript
// Use strict: false to temporarily disable validation
defineStack(config, { strict: false });
```

## Test Results

✅ **All tests passing**: 195 test files, 5251 tests
✅ **Examples verified**: All use correct snake_case naming
✅ **Validation confirmed**: Correctly rejects camelCase/PascalCase
✅ **Validation confirmed**: Correctly accepts snake_case
✅ **Backward compatibility**: strict=false still works for edge cases

## Files Modified

1. `packages/spec/src/stack.zod.ts` - Changed default to strict=true
2. `packages/spec/src/stack.test.ts` - Updated tests for new behavior
3. `packages/spec/src/data/field-name-validation.test.ts` - New validation tests
4. `.changeset/strict-validation-by-default.md` - Breaking change documentation

## Conclusion

The issue was that field name validation **existed but was disabled by default**. By changing `defineStack()` to validate by default, we now enforce the snake_case naming convention that was always part of the specification but wasn't being checked in practice.

This fix ensures that the rule "字段名必须是 snake_case" (field names must be snake_case) is now actually enforced, preventing issues like the one reported by the user.
