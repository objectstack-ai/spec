---
"@objectstack/spec": patch
"@objectstack/driver-memory": patch
---

Fix filter operators (contains, notContains, startsWith, endsWith, between, null) broken across spec and memory driver

- Add `$notContains` to `StringOperatorSchema`, `FieldOperatorsSchema`, `FILTER_OPERATORS`, and `Filter` type
- Add `notcontains` / `not_contains` to `VALID_AST_OPERATORS` and `AST_OPERATOR_MAP`
- Fix memory driver `convertToMongoQuery()` passthrough to normalize non-standard operators to Mingo-compatible format
- Add `$notContains` and `$null` operators to memory matcher
- Fix undefined value guard in memory matcher to exclude `$exists`, `$ne`, and `$null`
