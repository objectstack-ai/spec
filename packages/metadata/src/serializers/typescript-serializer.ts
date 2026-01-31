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
    // This implementation extracts the object literal from common export patterns
    
    // Pattern 1: export const metadata = {...};
    let match = content.match(/export\s+const\s+\w+\s*=\s*({[\s\S]*?});/);
    
    // Pattern 2: export default {...};
    if (!match) {
      match = content.match(/export\s+default\s+({[\s\S]*?});/);
    }
    
    if (!match) {
      throw new Error(
        'Could not parse TypeScript/JavaScript module. ' +
        'Expected export pattern: "export const metadata = {...};" or "export default {...};"'
      );
    }

    try {
      // Parse the object literal as JSON
      // This is safer than eval but still requires the content to be valid JSON-like syntax
      const parsed = JSON.parse(match[1]);

      if (schema) {
        return schema.parse(parsed) as T;
      }

      return parsed as T;
    } catch (error) {
      throw new Error(
        `Failed to parse object literal: ${error instanceof Error ? error.message : String(error)}`
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
