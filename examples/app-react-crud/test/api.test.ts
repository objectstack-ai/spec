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
        const { client, kernel } = env;

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
        let items = Array.isArray(response) ? response : (response as any).value;
        
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
        const list = Array.isArray(fetched) ? fetched : (fetched as any).value;
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(newTask.id);
    });
});
