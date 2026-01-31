/**
 * TypeScript/JavaScript Metadata Serializer
 * 
 * Handles TypeScript/JavaScript module format serialization and deserialization
 */

import type { z } from 'zod';
import type { MetadataFormat } from '@objectstack/spec/system';
import type { MetadataSerializer, SerializeOptions } from './serializer-interface.js';

export class TypeScriptSerializer implements MetadataSerializer {
  constructor(private format: 'typescript' | 'javascript' = 'typescript') {}

  serialize<T>(item: T, options?: SerializeOptions): string {
    const { prettify = true, indent = 2 } = options || {};

    const jsonStr = JSON.stringify(item, null, prettify ? indent : 0);
    
    if (this.format === 'typescript') {
      return `import type { ServiceObject } from '@objectstack/spec/data';\n\n` +
        `export const metadata: ServiceObject = ${jsonStr};\n\n` +
        `export default metadata;\n`;
    } else {
      return `export const metadata = ${jsonStr};\n\n` +
        `export default metadata;\n`;
    }
  }

  deserialize<T>(content: string, schema?: z.ZodSchema): T {
    // For TypeScript/JavaScript files, we need to extract the exported object
    // Note: This is a simplified parser that works with JSON-like object literals
    // For complex TypeScript with nested objects, consider using a proper TypeScript parser
    
    // Try to find the object literal in various export patterns
    // Pattern 1: export const metadata = {...};
    let objectStart = content.indexOf('export const');
    if (objectStart === -1) {
      // Pattern 2: export default {...};
      objectStart = content.indexOf('export default');
    }
    
    if (objectStart === -1) {
      throw new Error(
        'Could not parse TypeScript/JavaScript module. ' +
        'Expected export pattern: "export const metadata = {...};" or "export default {...};"'
      );
    }

    // Find the first opening brace after the export statement
    const braceStart = content.indexOf('{', objectStart);
    if (braceStart === -1) {
      throw new Error('Could not find object literal in export statement');
    }

    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          braceEnd = i;
          break;
        }
      }
    }

    if (braceEnd === -1) {
      throw new Error('Could not find matching closing brace for object literal');
    }

    // Extract the object literal
    const objectLiteral = content.substring(braceStart, braceEnd + 1);

    try {
      // Parse as JSON
      const parsed = JSON.parse(objectLiteral);

      if (schema) {
        return schema.parse(parsed) as T;
      }

      return parsed as T;
    } catch (error) {
      throw new Error(
        `Failed to parse object literal as JSON: ${error instanceof Error ? error.message : String(error)}. ` +
        'Make sure the TypeScript/JavaScript object uses JSON-compatible syntax.'
      );
    }
  }

  getExtension(): string {
    return this.format === 'typescript' ? '.ts' : '.js';
  }

  canHandle(format: MetadataFormat): boolean {
    return format === 'typescript' || format === 'javascript';
  }

  getFormat(): MetadataFormat {
    return this.format;
  }
}
