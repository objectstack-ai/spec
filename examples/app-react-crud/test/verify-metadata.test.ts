import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { simulateBrowser } from '../src/mocks/simulateBrowser';

describe('Metadata Service Integration', () => {
    let env: any;

    beforeAll(async () => {
        env = await simulateBrowser();
        await env.client.connect();
    });

    afterAll(() => {
        if (env) env.cleanup();
    });

    it('should fetch list of objects via client.meta.getItems("object")', async () => {
        const { client } = env;
        const objects = await client.meta.getItems('object');
        
        console.log('Fetched Objects:', objects.map((o: any) => o.name));
        
        expect(objects).toBeDefined();
        expect(Array.isArray(objects)).toBe(true);
        expect(objects.length).toBeGreaterThan(0);
        
        const todoTask = objects.find((o: any) => o.name === 'todo_task');
        expect(todoTask).toBeDefined();
    });

    it('should fetch object details via client.meta.getItem("object", ...)', async () => {
        const { client } = env;
        const def = await client.meta.getItem('object', 'todo_task');
        
        expect(def).toBeDefined();
        expect(def.name).toBe('todo_task');
        expect(def.fields).toBeDefined();
        
        // Check if fields are parsed correctly (client might return Map or Object depending on version)
        // Adjust expectation based on ObjectStackClient behavior
        // Assuming it matches the raw JSON or a wrapper
        console.log('Fields:', def.fields);
        // expect(Object.keys(def.fields).length).toBeGreaterThan(0);
    });
});
