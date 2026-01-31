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
    // For TypeScript/JavaScript files, we expect them to be imported as modules
    // This is a simplified version - in practice, you'd use dynamic import
    // or a proper module loader
    
    // Extract the JSON/object from the module content
    const match = content.match(/export\s+(?:const|default)\s+\w+\s*=\s*({[\s\S]*?});?\s*$/m);
    
    if (!match) {
      throw new Error('Could not parse TypeScript/JavaScript module');
    }

    // Use Function constructor to safely evaluate the object literal
    // eslint-disable-next-line no-new-func
    const parsed = new Function(`return ${match[1]}`)();

    if (schema) {
      return schema.parse(parsed) as T;
    }

    return parsed as T;
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
