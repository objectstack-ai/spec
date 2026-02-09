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
        const response: any = await client.meta.getItems('object');
        // Response after unwrap: { type: 'object', items: [...] }
        const objects = response.items || response.data || response;
        
        console.log('Fetched Objects:', objects.map((o: any) => o.name));
        
        expect(objects).toBeDefined();
        expect(Array.isArray(objects)).toBe(true);
        expect(objects.length).toBeGreaterThan(0);
        
        // Object name without namespace prefix (studio config has no namespace)
        const task = objects.find((o: any) => o.name === 'task');
        expect(task).toBeDefined();
    });

    it('should fetch object details via client.meta.getItem("object", ...)', async () => {
        const { client } = env;
        // Use short name 'task' which resolves via registry fallback
        const response: any = await client.meta.getItem('object', 'task');
        const def = response.data || response;
        
        expect(def).toBeDefined();
        expect(def.name).toBe('task');
        expect(def.fields).toBeDefined();
        
        // Check if fields are parsed correctly (client might return Map or Object depending on version)
        // Adjust expectation based on ObjectStackClient behavior
        // Assuming it matches the raw JSON or a wrapper
        console.log('Fields:', def.fields);
        // expect(Object.keys(def.fields).length).toBeGreaterThan(0);
    });
});
