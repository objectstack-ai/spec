/**
 * YAML Metadata Serializer
 * 
 * Handles YAML format serialization and deserialization
 */

import * as yaml from 'js-yaml';
import type { z } from 'zod';
import type { MetadataFormat } from '@objectstack/spec/system';
import type { MetadataSerializer, SerializeOptions } from './serializer-interface.js';

export class YAMLSerializer implements MetadataSerializer {
  serialize<T>(item: T, options?: SerializeOptions): string {
    const { indent = 2, sortKeys = false } = options || {};

    return yaml.dump(item, {
      indent,
      sortKeys,
      lineWidth: -1, // Disable line wrapping
      noRefs: true,  // Disable YAML references
    });
  }

  deserialize<T>(content: string, schema?: z.ZodSchema): T {
    // Use JSON_SCHEMA to prevent arbitrary code execution
    // This restricts YAML to JSON-compatible types only
    const parsed = yaml.load(content, { schema: yaml.JSON_SCHEMA });

    if (schema) {
      return schema.parse(parsed) as T;
    }

    return parsed as T;
  }

  getExtension(): string {
    return '.yaml';
  }

  canHandle(format: MetadataFormat): boolean {
    return format === 'yaml';
  }

  getFormat(): MetadataFormat {
    return 'yaml';
  }
}
