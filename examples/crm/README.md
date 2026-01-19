# ObjectStack CRM Example

This is a reference implementation of a simple CRM schema using the ObjectStack Protocol.

## Structure

*   `src/domains/crm/` - Contains the Object definitions (`Account`, `Contact`, `Opportunity`).
*   `objectstack.config.ts` - The application manifest that bundles the objects into an app.

## Usage

This package is part of the `examples` workspace. To build it and verify types:

```bash
pnpm build
```
