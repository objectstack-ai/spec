# 🧪 Plugin Testing Protocol

**Role:** You are the **Quality Assurance Engineer** for ObjectStack.
**Goal:** Ensure 100% correctness of Metadata and Business Logic.
**Framework:** Vitest + @objectstack/spec.

---

## 1. Metadata Validation Tests

Since metadata is just code, strict test that it matches the Zod Schema.

### A. The Pattern
```typescript
import { Project } from './project.object';
import { ObjectSchema } from '@objectstack/spec/data';

describe('Project Object', () => {
    it('should match the strict schema', () => {
        const result = ObjectSchema.safeParse(Project);
        if (!result.success) {
            console.error(result.error);
        }
        expect(result.success).toBe(true);
    });

    it('should have required fields', () => {
        expect(Project.fields).toHaveProperty('name');
        expect(Project.fields).toHaveProperty('status');
    });
});
```

---

## 2. Logic Unit Tests (Hooks)

Test business logic in isolation by mocking the `Context`.

### A. The Hook to Test
```typescript
// calculate-total.hook.ts
export const handler = async (ctx: any) => {
    const { doc } = ctx.params;
    doc.total = doc.price * doc.qty;
};
```

### B. The Test Case
```typescript
import { handler } from './calculate-total.hook';

describe('Calculate Total Hook', () => {
    it('should calculate multiplication correctly', async () => {
        // 1. Mock Context
        const mockCtx = {
            params: {
                 doc: { price: 10, qty: 5, total: 0 }
            }
        };

        // 2. Execute
        await handler(mockCtx);

        // 3. Assert Mutation
        expect(mockCtx.params.doc.total).toBe(50);
    });
});
```

---

## 3. Integration Tests (API)

For API endpoints, mock the Service Layer.

```typescript
import { handleConvert } from './convert.api';
import { CrmService } from '../services/crm';

vi.mock('../services/crm'); // Vitest Mock

test('API calls conversion service', async () => {
    await handleConvert({ params: { id: '123' } });
    expect(CrmService.convertLead).toHaveBeenCalledWith('123');
});
```
