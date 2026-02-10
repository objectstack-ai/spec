// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Test Suite: Metadata Service CRUD Operations
 * 
 * Tests the ObjectQL metadata service functionality for loading and saving
 * view metadata to/from a database.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ObjectKernel } from '@objectstack/core';
import { ObjectQLPlugin } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { ObjectSchema, Field } from '@objectstack/spec/data';
import { ListView, ViewSchema } from '@objectstack/spec/ui';

describe('Metadata Service - View CRUD', () => {
  let kernel: ObjectKernel;
  let objectql: any;
  
  beforeAll(async () => {
    // Setup kernel and ObjectQL
    kernel = new ObjectKernel({
      appId: 'test-metadata',
      name: 'Test Metadata'
    });
    
    kernel.use(new ObjectQLPlugin());
    await kernel.bootstrap();
    
    objectql = kernel.getService('objectql');
    
    // Register driver
    const driver = new InMemoryDriver();
    objectql.registerDriver(driver);
    objectql.setDefaultDriver('memory');
    
    // Define metadata storage object
    const SysView = ObjectSchema.create({
      name: 'sys_view',
      label: 'View Metadata',
      
      fields: {
        name: Field.text({ required: true, unique: true }),
        object_name: Field.text({ required: true }),
        label: Field.text(),
        type: Field.select(['grid', 'kanban', 'calendar'], { required: true }),
        definition: Field.json({ required: true }),
        is_default: Field.boolean({ defaultValue: false }),
      },
      
      indexes: [
        { fields: ['name'], unique: true },
      ],
    });
    
    objectql.registerObject(SysView);
  });
  
  afterAll(async () => {
    // Cleanup
    if (kernel) {
      await kernel.shutdown?.();
    }
  });
  
  describe('Save View Metadata', () => {
    it('should save a new view definition to database', async () => {
      const viewDef: ListView = {
        type: 'grid',
        columns: ['name', 'status', 'owner'],
        filter: [],
        sort: [{ field: 'name', order: 'asc' }],
      };
      
      const record = {
        name: 'test_list_view',
        object_name: 'test_object',
        label: 'Test List View',
        type: viewDef.type,
        definition: viewDef,
        is_default: false,
      };
      
      const result = await objectql.insert('sys_view', record);
      
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.name).toBe('test_list_view');
    });
    
    it('should update an existing view definition', async () => {
      // First, create a view
      const viewDef: ListView = {
        type: 'grid',
        columns: ['name'],
        filter: [],
      };
      
      const record = {
        name: 'update_test_view',
        object_name: 'test_object',
        type: viewDef.type,
        definition: viewDef,
      };
      
      const created = await objectql.insert('sys_view', record);
      
      // Now update it
      const updatedDef: ListView = {
        type: 'grid',
        columns: ['name', 'status', 'owner'],
        filter: [],
      };
      
      const updated = await objectql.update('sys_view', created._id, {
        definition: updatedDef,
        label: 'Updated View',
      });
      
      expect(updated._id).toBe(created._id);
      expect(updated.definition.columns).toHaveLength(3);
      expect(updated.label).toBe('Updated View');
    });
    
    it('should validate view definition against schema', () => {
      const validView: ListView = {
        type: 'grid',
        columns: ['name', 'status'],
        filter: [],
      };
      
      // Should not throw
      expect(() => ViewSchema.parse({ list: validView })).not.toThrow();
      
      const invalidView = {
        type: 'invalid_type',
        columns: [],
      };
      
      // Should throw
      expect(() => ViewSchema.parse({ list: invalidView })).toThrow();
    });
  });
  
  describe('Load View Metadata', () => {
    beforeAll(async () => {
      // Setup test data
      const views = [
        {
          name: 'account_list',
          object_name: 'account',
          type: 'grid',
          definition: {
            type: 'grid',
            columns: ['name', 'industry'],
            filter: []
          }
        },
        {
          name: 'account_kanban',
          object_name: 'account',
          type: 'kanban',
          definition: {
            type: 'kanban',
            columns: ['name'],
            kanban: {
              groupByField: 'stage',
              columns: ['name']
            }
          }
        },
      ];
      
      for (const view of views) {
        await objectql.insert('sys_view', view);
      }
    });
    
    it('should load a single view by name', async () => {
      const result = await objectql.findOne('sys_view', {
        filters: [['name', '=', 'account_list']]
      });
      
      expect(result).toBeDefined();
      expect(result.name).toBe('account_list');
      expect(result.definition.type).toBe('grid');
      expect(result.definition.columns).toContain('name');
    });
    
    it('should return null for non-existent view', async () => {
      const result = await objectql.findOne('sys_view', {
        filters: [['name', '=', 'non_existent_view']]
      });
      
      expect(result).toBeNull();
    });
    
    it('should load all views for an object', async () => {
      const results = await objectql.find('sys_view', {
        filters: [['object_name', '=', 'account']],
        sort: [{ field: 'name', order: 'asc' }]
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('account_kanban');
      expect(results[1].name).toBe('account_list');
    });
    
    it('should extract view definition from database record', async () => {
      const result = await objectql.findOne('sys_view', {
        filters: [['name', '=', 'account_list']]
      });
      
      const viewDef = result.definition as ListView;
      
      // Validate it's a proper view definition
      expect(viewDef.type).toBe('grid');
      expect(viewDef.columns).toBeDefined();
      expect(Array.isArray(viewDef.columns)).toBe(true);
    });
  });
  
  describe('Delete View Metadata', () => {
    it('should delete a view by ID', async () => {
      // Create a view
      const record = {
        name: 'delete_test_view',
        object_name: 'test_object',
        type: 'grid',
        definition: { type: 'grid', columns: [], filter: [] }
      };
      
      const created = await objectql.insert('sys_view', record);
      
      // Delete it
      await objectql.delete('sys_view', created._id);
      
      // Verify deletion
      const result = await objectql.findOne('sys_view', {
        filters: [['name', '=', 'delete_test_view']]
      });
      
      expect(result).toBeNull();
    });
    
    it('should handle deleting non-existent view gracefully', async () => {
      // Attempt to delete non-existent ID
      // Should not throw, but may return null or similar
      await expect(
        objectql.delete('sys_view', 'non-existent-id')
      ).resolves.toBeDefined();
    });
  });
  
  describe('Query and Filter Views', () => {
    it('should filter views by type', async () => {
      const gridViews = await objectql.find('sys_view', {
        filters: [['type', '=', 'grid']]
      });
      
      expect(gridViews.length).toBeGreaterThan(0);
      gridViews.forEach((view: any) => {
        expect(view.type).toBe('grid');
      });
    });
    
    it('should sort views by name', async () => {
      const results = await objectql.find('sys_view', {
        sort: [{ field: 'name', order: 'asc' }]
      });
      
      expect(results.length).toBeGreaterThan(0);
      
      // Verify sorting
      for (let i = 1; i < results.length; i++) {
        expect(results[i].name >= results[i - 1].name).toBe(true);
      }
    });
    
    it('should support pagination', async () => {
      const page1 = await objectql.find('sys_view', {
        limit: 2,
        offset: 0
      });
      
      const page2 = await objectql.find('sys_view', {
        limit: 2,
        offset: 2
      });
      
      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
      
      // Verify different results
      if (page1.length > 0 && page2.length > 0) {
        expect(page1[0]._id).not.toBe(page2[0]._id);
      }
    });
  });
  
  describe('Metadata Service Interface', () => {
    it('should implement IMetadataService interface', () => {
      const metadataService = objectql;
      
      // Check that required methods exist
      expect(typeof metadataService.find).toBe('function');
      expect(typeof metadataService.findOne).toBe('function');
      expect(typeof metadataService.insert).toBe('function');
      expect(typeof metadataService.update).toBe('function');
      expect(typeof metadataService.delete).toBe('function');
    });
    
    it('should be accessible via kernel service registry', () => {
      const metadataService = kernel.getService('metadata');
      
      expect(metadataService).toBeDefined();
      expect(metadataService).toBe(objectql);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty filter array', async () => {
      const results = await objectql.find('sys_view', {
        filters: []
      });
      
      // Should return all views
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
    
    it('should handle complex view definitions with nested data', async () => {
      const complexView: ListView = {
        type: 'kanban',
        columns: ['name', 'status'],
        filter: [['status', '!=', 'archived']],
        kanban: {
          groupByField: 'stage',
          summarizeField: 'amount',
          columns: ['name', 'owner', 'amount']
        },
        searchableFields: ['name', 'description'],
        pagination: {
          pageSize: 50,
          pageSizeOptions: [25, 50, 100]
        }
      };
      
      const record = {
        name: 'complex_kanban',
        object_name: 'opportunity',
        type: 'kanban',
        definition: complexView,
      };
      
      const created = await objectql.insert('sys_view', record);
      
      // Load and verify
      const loaded = await objectql.findOne('sys_view', {
        filters: [['name', '=', 'complex_kanban']]
      });
      
      expect(loaded.definition.kanban).toBeDefined();
      expect(loaded.definition.kanban.groupByField).toBe('stage');
      expect(loaded.definition.pagination.pageSize).toBe(50);
    });
    
    it('should preserve JSON data types in definition field', async () => {
      const viewDef = {
        type: 'grid',
        columns: ['name'],
        filter: [],
        pagination: {
          pageSize: 25, // number
          pageSizeOptions: [10, 25, 50] // array of numbers
        },
        selection: {
          type: 'multiple' // string
        },
        virtualScroll: true, // boolean
      };
      
      const record = {
        name: 'type_test_view',
        object_name: 'test',
        type: 'grid',
        definition: viewDef,
      };
      
      const created = await objectql.insert('sys_view', record);
      const loaded = await objectql.findOne('sys_view', {
        filters: [['_id', '=', created._id]]
      });
      
      // Verify types are preserved
      expect(typeof loaded.definition.pagination.pageSize).toBe('number');
      expect(Array.isArray(loaded.definition.pagination.pageSizeOptions)).toBe(true);
      expect(typeof loaded.definition.selection.type).toBe('string');
      expect(typeof loaded.definition.virtualScroll).toBe('boolean');
    });
  });
});
