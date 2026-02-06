import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { simulateBrowser } from '../src/mocks/simulateBrowser';

describe('App React CRUD Integration Tests (Virtual Browser)', () => {
    let env: any;

    beforeAll(async () => {
        // Spin up the Simulation
        env = await simulateBrowser();
    });

    afterAll(() => {
        // Tear down
        if (env) env.cleanup();
    });

    it('should boot kernel and have seeded data available immediately', async () => {
        const { client } = env;

        console.log('[Test] Verifying network-to-kernel bridge...');

        // 1. Client makes HTTP Request
        // 2. MSW intercepts
        // 3. Handler calls Kernel.broker
        // 4. Kernel reads Memory Driver
        const response = await client.data.find('todo_task', {
            top: 5
        });

        console.log('[Test] Response received:', response);

        // Expect items (array or paginated value)
        // Handle Standard Envelope ({ success: true, data: [...] }) 
        const result: any = response;
        let items = result.data ? result.data : (Array.isArray(response) ? response : (response as any).value);
        
        expect(items).toBeDefined();
        // Since we force seeded in createKernel, we expect 5 items
        expect(items.length).toBe(5);
        expect(items[0]).toHaveProperty('subject');
        
        // Check for 'is_completed' as per actual data
        expect(items[0]).toHaveProperty('is_completed');
    });

    it('should support CRUD operations via Client', async () => {
        const { client } = env;

        // CREATE
        const newTask = await client.data.create('todo_task', {
            subject: 'Test generated task',
            is_completed: false,
            priority: 3
        });

        expect(newTask).toBeDefined();
        expect(newTask.id).toBeDefined();
        expect(newTask.subject).toBe('Test generated task');

        // READ
        const fetched = await client.data.find('todo_task', {
            filters: { id: newTask.id }
        });
        // find returns array/paginated list
        const r_fetched: any = fetched;
        const list = r_fetched.data || (Array.isArray(fetched) ? fetched : (fetched as any).value);
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(newTask.id);

        // UPDATE
        const updated = await client.data.update('todo_task', newTask.id, {
            subject: 'Updated Task Title'
        });
        expect(updated.subject).toBe('Updated Task Title');

        // DELETE
        await client.data.delete('todo_task', newTask.id);
        const afterDelete = await client.data.find('todo_task', { filters: { id: newTask.id } });
        const r_afterDelete: any = afterDelete;
        const missingList = r_afterDelete.data || (Array.isArray(afterDelete) ? afterDelete : (afterDelete as any).value);
        expect(missingList).toHaveLength(0);
    });

    it('should support pagination, sorting and field selection', async () => {
        const { client } = env;
        
        // 1. Test Sorting
        // default data has priorities 1, 2, 3
        const sorted = await client.data.find('todo_task', {
            sort: ['priority'] // Ascending
        });
        const r_sorted: any = sorted;
        const sortedItems = r_sorted.data || (Array.isArray(sorted) ? sorted : (sorted as any).value);
        expect(sortedItems[0].priority).toBeLessThanOrEqual(sortedItems[1].priority);

        // 2. Test Pagination (Top)
        const top2 = await client.data.find('todo_task', {
            top: 2
        });
        const r_top2: any = top2;
        const top2Items = r_top2.data || (Array.isArray(top2) ? top2 : (top2 as any).value);
        expect(top2Items).toHaveLength(2);

        // 3. Test Select
        const selected = await client.data.find('todo_task', {
            top: 1,
            select: ['subject']
        });
        const r_selected: any = selected;
        const selectedItems = r_selected.data || (Array.isArray(selected) ? selected : (selected as any).value);
        expect(selectedItems[0]).toHaveProperty('subject');
        expect(selectedItems[0]).not.toHaveProperty('priority'); // Should be excluded
        expect(selectedItems[0]).toHaveProperty('id'); // ID is always returned
    });
});
