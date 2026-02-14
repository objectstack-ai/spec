---
'@objectstack/objectql': minor
---

feat(objectql): add utility functions, introspection types, and kernel factory

Upstream key functionality from downstream `@objectql/core` to enable its future deprecation:

- **Introspection types**: `IntrospectedSchema`, `IntrospectedTable`, `IntrospectedColumn`, `IntrospectedForeignKey`
- **Utility functions**: `toTitleCase()`, `convertIntrospectedSchemaToObjects()`
- **Kernel factory**: `createObjectQLKernel()` with `ObjectQLKernelOptions`
