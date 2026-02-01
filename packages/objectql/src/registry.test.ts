import { describe, it, expect } from 'vitest';
import { SchemaRegistry } from './registry';

describe('SchemaRegistry', () => {
    it('should register and retrieve an item', () => {
        const item = { name: 'test_object', type: 'object' };
        
        SchemaRegistry.registerItem('object', item, 'name');
        
        const retrieved = SchemaRegistry.getItem('object', 'test_object');
        expect(retrieved).toEqual(item);
    });

    it('should list items by type', () => {
        const item1 = { name: 'obj1' };
        const item2 = { name: 'obj2' };
        
        SchemaRegistry.registerItem('object', item1, 'name');
        SchemaRegistry.registerItem('object', item2, 'name');
        
        const items = SchemaRegistry.listItems('object');
        // Note: Registry is singleton, so it might contain previous test items or other items
        expect(items.length).toBeGreaterThanOrEqual(2);
        expect(items).toContainEqual(item1);
        expect(items).toContainEqual(item2);
    });
});
