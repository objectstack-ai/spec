# Examples

This directory contains example code demonstrating how to use the `@objectstack/spec` package.

## Files

- **namespaced-imports.example.ts** - Demonstrates both flat and namespaced import styles

## Running Examples

These examples are for reference only. They demonstrate the TypeScript API but are not executable as standalone files.

To use these patterns in your own code:

1. Install the package:
   ```bash
   npm install @objectstack/spec
   ```

2. Import using your preferred style:
   ```typescript
   // Flat imports
   import { Field, User } from '@objectstack/spec';
   
   // Namespaced imports
   import * as Data from '@objectstack/spec/data';
   import * as System from '@objectstack/spec/system';
   ```

3. See the main [README.md](../README.md) for more usage examples.

## Contributing

If you have useful examples to add, please submit a PR!
