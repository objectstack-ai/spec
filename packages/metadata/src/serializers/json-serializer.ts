/**
 * JSON Metadata Serializer
 * 
 * Handles JSON format serialization and deserialization
 */

import type { z } from 'zod';
import type { MetadataFormat } from '@objectstack/spec/system';
import type { MetadataSerializer, SerializeOptions } from './serializer-interface.js';

export class JSONSerializer implements MetadataSerializer {
  serialize<T>(item: T, options?: SerializeOptions): string {
    const { prettify = true, indent = 2, sortKeys = false } = options || {};

    if (sortKeys) {
      // Sort keys recursively
      const sorted = this.sortObjectKeys(item);
      return prettify
        ? JSON.stringify(sorted, null, indent)
        : JSON.stringify(sorted);
    }

    return prettify
      ? JSON.stringify(item, null, indent)
      : JSON.stringify(item);
  }

  deserialize<T>(content: string, schema?: z.ZodSchema): T {
    const parsed = JSON.parse(content);

    if (schema) {
      return schema.parse(parsed) as T;
    }

    return parsed as T;
  }

  getExtension(): string {
    return '.json';
  }

  canHandle(format: MetadataFormat): boolean {
    return format === 'json';
  }

  getFormat(): MetadataFormat {
    return 'json';
  }

  /**
   * Recursively sort object keys
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
      sorted[key] = this.sortObjectKeys(obj[key]);
    }

    return sorted;
  }
}
