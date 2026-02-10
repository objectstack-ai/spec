// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { SchemaRegistry } from './registry.js';

/**
 * MetadataFacade
 * 
 * Provides a clean, injectable interface over SchemaRegistry.
 * Registered as the 'metadata' kernel service to eliminate
 * downstream packages needing to manually wrap SchemaRegistry.
 */
export class MetadataFacade {
  /**
   * Register a metadata item
   */
  register(type: string, definition: any): void {
    if (type === 'object') {
      SchemaRegistry.registerItem(type, definition, 'name' as any);
    } else {
      SchemaRegistry.registerItem(type, definition, definition.id ? 'id' as any : 'name' as any);
    }
  }

  /**
   * Get a metadata item by type and name
   */
  get(type: string, name: string): any {
    const item = SchemaRegistry.getItem(type, name) as any;
    return item?.content ?? item;
  }

  /**
   * Get the raw entry (with metadata wrapper)
   */
  getEntry(type: string, name: string): any {
    return SchemaRegistry.getItem(type, name);
  }

  /**
   * List all items of a type
   */
  list(type: string): any[] {
    const items = SchemaRegistry.listItems(type);
    return items.map((item: any) => item?.content ?? item);
  }

  /**
   * Unregister a metadata item
   */
  unregister(type: string, name: string): void {
    SchemaRegistry.unregisterItem(type, name);
  }

  /**
   * Unregister all metadata from a package
   */
  unregisterPackage(packageName: string): void {
    SchemaRegistry.unregisterObjectsByPackage(packageName);
  }

  /**
   * Convenience: get object definition
   */
  getObject(name: string): any {
    return SchemaRegistry.getObject(name);
  }

  /**
   * Convenience: list all objects
   */
  listObjects(): any[] {
    return SchemaRegistry.getAllObjects();
  }
}
