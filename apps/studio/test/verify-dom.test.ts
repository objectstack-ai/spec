
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { simulateBrowser } from '../src/mocks/simulateBrowser';

describe('DOM Simulation', () => {
    let env: any;

    beforeAll(async () => {
        env = await simulateBrowser();
        await env.client.connect();
    });

    afterAll(() => {
        if (env) env.cleanup();
    });

    it('simulates ObjectDataTable structure verifying columns exist', async () => {
        const { client } = env;
        
        // 1. Fetch Definition (use short name — resolves via registry fallback)
        const result: any = await client.meta.getItem('object', 'task');
        const def = result.data || result;
        
        console.log('Definition Check:', {
            hasData: !!result.data,
            name: def.name,
            fieldCount: Object.keys(def.fields || {}).length
        });
        
        expect(def.name).toBe('task');
        expect(Object.keys(def.fields).length).toBeGreaterThan(0);

        // 2. Fetch Data (short name resolves via engine.resolveObjectName)
        const dataResult: any = await client.data.find('task');
        let records = [];
        if (dataResult.success && dataResult.data) records = dataResult.data;
        else if (Array.isArray(dataResult)) records = dataResult;
        
        console.log('Data Check:', {
            recordCount: records.length,
            firstRecord: records[0]
        });

        // 3. Simulate Render Logic (pure JS, matching React)
        const fields = def.fields || {};
        const columns = Object.keys(fields).map(key => {
            const f = fields[key];
            return {
                name: f.name || key,
                label: f.label || key
            };
        }).filter(c => !['formatted_summary', 'password'].includes(c.name));

        const headers = columns.map(c => c.label);
        console.log('Resolved Columns:', headers);

        // Fail if no columns (would result in empty table body)
        expect(columns.length).toBeGreaterThan(0);
        expect(headers).toContain('Subject');  // Field label uses title case
    });
});
