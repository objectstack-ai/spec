// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach } from 'vitest';
import { LiteKernel } from '@objectstack/core';
import { AutomationEngine } from './engine.js';
import { AutomationServicePlugin } from './plugin.js';
import { CrudNodesPlugin } from './plugins/crud-nodes-plugin.js';
import { LogicNodesPlugin } from './plugins/logic-nodes-plugin.js';
import { HttpConnectorPlugin } from './plugins/http-connector-plugin.js';
import type { NodeExecutor } from './engine.js';
import type { IAutomationService } from '@objectstack/spec/contracts';

// ─── Helper: Create a minimal logger for unit tests ─────────────────

function createTestLogger() {
    return {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        child: () => createTestLogger(),
    } as any;
}

// ─── AutomationEngine Unit Tests ─────────────────────────────────────

describe('AutomationEngine', () => {
    let engine: AutomationEngine;

    beforeEach(() => {
        engine = new AutomationEngine(createTestLogger());
    });

    describe('Node Executor Registration', () => {
        it('should register a node executor', () => {
            const executor: NodeExecutor = {
                type: 'test_node',
                async execute() {
                    return { success: true };
                },
            };
            engine.registerNodeExecutor(executor);
            expect(engine.getRegisteredNodeTypes()).toContain('test_node');
        });

        it('should replace an existing executor for the same type', () => {
            engine.registerNodeExecutor({
                type: 'test_node',
                async execute() {
                    return { success: true, output: { version: 1 } };
                },
            });
            engine.registerNodeExecutor({
                type: 'test_node',
                async execute() {
                    return { success: true, output: { version: 2 } };
                },
            });
            expect(engine.getRegisteredNodeTypes().filter(t => t === 'test_node')).toHaveLength(1);
        });

        it('should unregister a node executor', () => {
            engine.registerNodeExecutor({
                type: 'test_node',
                async execute() {
                    return { success: true };
                },
            });
            engine.unregisterNodeExecutor('test_node');
            expect(engine.getRegisteredNodeTypes()).not.toContain('test_node');
        });
    });

    describe('Trigger Registration', () => {
        it('should register and unregister a trigger', () => {
            engine.registerTrigger({
                type: 'schedule',
                start: () => {},
                stop: () => {},
            });
            expect(engine.getRegisteredTriggerTypes()).toContain('schedule');

            engine.unregisterTrigger('schedule');
            expect(engine.getRegisteredTriggerTypes()).not.toContain('schedule');
        });
    });

    describe('Flow Registration', () => {
        it('should register and list flows', async () => {
            engine.registerFlow('test_flow', {
                name: 'test_flow',
                label: 'Test Flow',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [{ id: 'e1', source: 'start', target: 'end' }],
            });

            const flows = await engine.listFlows();
            expect(flows).toContain('test_flow');
        });

        it('should unregister a flow', async () => {
            engine.registerFlow('temp_flow', {
                name: 'temp_flow',
                label: 'Temp',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [{ id: 'e1', source: 'start', target: 'end' }],
            });
            engine.unregisterFlow('temp_flow');
            const flows = await engine.listFlows();
            expect(flows).not.toContain('temp_flow');
        });

        it('should reject invalid flow definitions', () => {
            expect(() => engine.registerFlow('bad', { invalid: true })).toThrow();
        });
    });

    describe('Flow Execution', () => {
        it('should return error for non-existent flow', async () => {
            const result = await engine.execute('nonexistent');
            expect(result.success).toBe(false);
            expect(result.error).toContain('not found');
        });

        it('should execute a simple start → end flow', async () => {
            engine.registerFlow('simple', {
                name: 'simple',
                label: 'Simple',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [{ id: 'e1', source: 'start', target: 'end' }],
            });

            const result = await engine.execute('simple');
            expect(result.success).toBe(true);
            expect(result.durationMs).toBeGreaterThanOrEqual(0);
        });

        it('should execute nodes and collect output', async () => {
            engine.registerNodeExecutor({
                type: 'assignment',
                async execute(node, variables) {
                    variables.set('result', 42);
                    return { success: true };
                },
            });

            engine.registerFlow('with_assignment', {
                name: 'with_assignment',
                label: 'With Assignment',
                type: 'autolaunched',
                variables: [
                    { name: 'result', type: 'number', isOutput: true },
                ],
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'assign', type: 'assignment', label: 'Assign', config: { result: 42 } },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'assign' },
                    { id: 'e2', source: 'assign', target: 'end' },
                ],
            });

            const result = await engine.execute('with_assignment');
            expect(result.success).toBe(true);
            expect(result.output).toEqual({ result: 42 });
        });

        it('should pass input variables from context', async () => {
            let capturedValue: unknown;

            engine.registerNodeExecutor({
                type: 'script',
                async execute(_node, variables) {
                    capturedValue = variables.get('input_val');
                    return { success: true };
                },
            });

            engine.registerFlow('input_test', {
                name: 'input_test',
                label: 'Input Test',
                type: 'autolaunched',
                variables: [
                    { name: 'input_val', type: 'text', isInput: true },
                ],
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'run', type: 'script', label: 'Run' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'run' },
                    { id: 'e2', source: 'run', target: 'end' },
                ],
            });

            await engine.execute('input_test', { params: { input_val: 'hello' } });
            expect(capturedValue).toBe('hello');
        });

        it('should inject $record from context', async () => {
            let capturedRecord: unknown;

            engine.registerNodeExecutor({
                type: 'script',
                async execute(_node, variables) {
                    capturedRecord = variables.get('$record');
                    return { success: true };
                },
            });

            engine.registerFlow('record_test', {
                name: 'record_test',
                label: 'Record Test',
                type: 'record_change',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'run', type: 'script', label: 'Run' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'run' },
                    { id: 'e2', source: 'run', target: 'end' },
                ],
            });

            await engine.execute('record_test', {
                record: { id: 'rec-1', name: 'Test' },
                object: 'account',
                event: 'on_create',
            });
            expect(capturedRecord).toEqual({ id: 'rec-1', name: 'Test' });
        });

        it('should fail when node executor is missing', async () => {
            engine.registerFlow('missing_executor', {
                name: 'missing_executor',
                label: 'Missing',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'unknown', type: 'get_record', label: 'Get' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'unknown' },
                    { id: 'e2', source: 'unknown', target: 'end' },
                ],
            });

            const result = await engine.execute('missing_executor');
            expect(result.success).toBe(false);
            expect(result.error).toContain('No executor registered');
        });

        it('should fail when flow has no start node', async () => {
            engine.registerFlow('no_start', {
                name: 'no_start',
                label: 'No Start',
                type: 'autolaunched',
                nodes: [
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [],
            });

            const result = await engine.execute('no_start');
            expect(result.success).toBe(false);
            expect(result.error).toContain('no start node');
        });

        it('should handle node execution failure', async () => {
            engine.registerNodeExecutor({
                type: 'script',
                async execute() {
                    return { success: false, error: 'Script timeout' };
                },
            });

            engine.registerFlow('failing_flow', {
                name: 'failing_flow',
                label: 'Failing',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'fail', type: 'script', label: 'Fail' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'fail' },
                    { id: 'e2', source: 'fail', target: 'end' },
                ],
            });

            const result = await engine.execute('failing_flow');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Script timeout');
        });

        it('should follow conditional edges', async () => {
            const executed: string[] = [];

            engine.registerNodeExecutor({
                type: 'assignment',
                async execute(node) {
                    executed.push(node.id);
                    return { success: true };
                },
            });

            engine.registerFlow('branching', {
                name: 'branching',
                label: 'Branching',
                type: 'autolaunched',
                nodes: [
                    { id: 'start', type: 'start', label: 'Start' },
                    { id: 'yes_branch', type: 'assignment', label: 'Yes' },
                    { id: 'no_branch', type: 'assignment', label: 'No' },
                    { id: 'end', type: 'end', label: 'End' },
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'yes_branch', condition: 'true' },
                    { id: 'e2', source: 'start', target: 'no_branch', condition: 'false' },
                    { id: 'e3', source: 'yes_branch', target: 'end' },
                    { id: 'e4', source: 'no_branch', target: 'end' },
                ],
            });

            await engine.execute('branching');
            expect(executed).toContain('yes_branch');
            expect(executed).not.toContain('no_branch');
        });
    });

    describe('IAutomationService Contract', () => {
        it('should satisfy IAutomationService interface', () => {
            const service: IAutomationService = engine;
            expect(typeof service.execute).toBe('function');
            expect(typeof service.listFlows).toBe('function');
            expect(typeof service.registerFlow).toBe('function');
            expect(typeof service.unregisterFlow).toBe('function');
        });
    });
});

// ─── Plugin Integration Tests ────────────────────────────────────────

describe('AutomationServicePlugin (Kernel Integration)', () => {
    it('should register automation service via LiteKernel', async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        await kernel.bootstrap();

        const service = kernel.getService<IAutomationService>('automation');
        expect(service).toBeDefined();
        expect(typeof service.execute).toBe('function');

        await kernel.shutdown();
    });

    it('should support full plugin assembly with node plugins', async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        kernel.use(new CrudNodesPlugin());
        kernel.use(new LogicNodesPlugin());
        kernel.use(new HttpConnectorPlugin());
        await kernel.bootstrap();

        const engine = kernel.getService<AutomationEngine>('automation');
        const nodeTypes = engine.getRegisteredNodeTypes();

        // CRUD nodes
        expect(nodeTypes).toContain('get_record');
        expect(nodeTypes).toContain('create_record');
        expect(nodeTypes).toContain('update_record');
        expect(nodeTypes).toContain('delete_record');

        // Logic nodes
        expect(nodeTypes).toContain('decision');
        expect(nodeTypes).toContain('assignment');
        expect(nodeTypes).toContain('loop');

        // HTTP/Connector nodes
        expect(nodeTypes).toContain('http_request');
        expect(nodeTypes).toContain('connector_action');

        await kernel.shutdown();
    });

    it('should execute a flow end-to-end through kernel', async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        kernel.use(new CrudNodesPlugin());
        kernel.use(new LogicNodesPlugin());
        await kernel.bootstrap();

        const automation = kernel.getService<IAutomationService>('automation');

        automation.registerFlow!('approval_flow', {
            name: 'approval_flow',
            label: 'Approval Flow',
            type: 'record_change',
            variables: [
                { name: 'status', type: 'text', isOutput: true },
            ],
            nodes: [
                { id: 'start', type: 'start', label: 'Start' },
                { id: 'assign', type: 'assignment', label: 'Set Status', config: { status: 'approved' } },
                { id: 'end', type: 'end', label: 'End' },
            ],
            edges: [
                { id: 'e1', source: 'start', target: 'assign' },
                { id: 'e2', source: 'assign', target: 'end' },
            ],
        });

        const result = await automation.execute('approval_flow', {
            record: { id: 'rec-1', amount: 50000 },
            object: 'opportunity',
            event: 'on_create',
        });

        expect(result.success).toBe(true);
        expect(result.output).toEqual({ status: 'approved' });

        await kernel.shutdown();
    });
});

// ─── Hot-plug Tests ──────────────────────────────────────────────────

describe('Hot-plug Node Executor', () => {
    it('should allow adding new node types at runtime', async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        await kernel.bootstrap();

        const engine = kernel.getService<AutomationEngine>('automation');
        expect(engine.getRegisteredNodeTypes()).toHaveLength(0);

        // Hot-plug a script node executor (valid FlowNodeAction, no built-in executor)
        engine.registerNodeExecutor({
            type: 'script',
            async execute() {
                return { success: true, output: { result: 'custom_script' } };
            },
        });

        expect(engine.getRegisteredNodeTypes()).toContain('script');

        // Use it in a flow immediately — no restart needed
        engine.registerFlow('hotplug_flow', {
            name: 'hotplug_flow',
            label: 'Hot-plug Flow',
            type: 'autolaunched',
            nodes: [
                { id: 'start', type: 'start', label: 'Start' },
                { id: 'run_script', type: 'script', label: 'Run Script' },
                { id: 'end', type: 'end', label: 'End' },
            ],
            edges: [
                { id: 'e1', source: 'start', target: 'run_script' },
                { id: 'e2', source: 'run_script', target: 'end' },
            ],
        });

        const result = await engine.execute('hotplug_flow');
        expect(result.success).toBe(true);

        await kernel.shutdown();
    });

    it('should allow removing node types at runtime', async () => {
        const engine = new AutomationEngine(createTestLogger());

        engine.registerNodeExecutor({
            type: 'temp_node',
            async execute() {
                return { success: true };
            },
        });
        expect(engine.getRegisteredNodeTypes()).toContain('temp_node');

        engine.unregisterNodeExecutor('temp_node');
        expect(engine.getRegisteredNodeTypes()).not.toContain('temp_node');
    });
});

// ─── CRUD Nodes Plugin Tests ─────────────────────────────────────────

describe('CrudNodesPlugin', () => {
    let engine: AutomationEngine;

    beforeEach(async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        kernel.use(new CrudNodesPlugin());
        await kernel.bootstrap();
        engine = kernel.getService<AutomationEngine>('automation');
    });

    it('should register all CRUD node types', () => {
        const types = engine.getRegisteredNodeTypes();
        expect(types).toContain('get_record');
        expect(types).toContain('create_record');
        expect(types).toContain('update_record');
        expect(types).toContain('delete_record');
    });

    it('should execute get_record node successfully', async () => {
        engine.registerFlow('get_test', {
            name: 'get_test',
            label: 'Get Test',
            type: 'autolaunched',
            nodes: [
                { id: 'start', type: 'start', label: 'Start' },
                { id: 'get', type: 'get_record', label: 'Get', config: { object: 'account' } },
                { id: 'end', type: 'end', label: 'End' },
            ],
            edges: [
                { id: 'e1', source: 'start', target: 'get' },
                { id: 'e2', source: 'get', target: 'end' },
            ],
        });

        const result = await engine.execute('get_test');
        expect(result.success).toBe(true);
    });
});

// ─── Logic Nodes Plugin Tests ────────────────────────────────────────

describe('LogicNodesPlugin', () => {
    let engine: AutomationEngine;

    beforeEach(async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        kernel.use(new LogicNodesPlugin());
        await kernel.bootstrap();
        engine = kernel.getService<AutomationEngine>('automation');
    });

    it('should register all logic node types', () => {
        const types = engine.getRegisteredNodeTypes();
        expect(types).toContain('decision');
        expect(types).toContain('assignment');
        expect(types).toContain('loop');
    });

    it('should execute assignment node and set variables', async () => {
        engine.registerFlow('assign_test', {
            name: 'assign_test',
            label: 'Assign Test',
            type: 'autolaunched',
            variables: [
                { name: 'greeting', type: 'text', isOutput: true },
            ],
            nodes: [
                { id: 'start', type: 'start', label: 'Start' },
                { id: 'set', type: 'assignment', label: 'Set', config: { greeting: 'Hello World' } },
                { id: 'end', type: 'end', label: 'End' },
            ],
            edges: [
                { id: 'e1', source: 'start', target: 'set' },
                { id: 'e2', source: 'set', target: 'end' },
            ],
        });

        const result = await engine.execute('assign_test');
        expect(result.success).toBe(true);
        expect(result.output).toEqual({ greeting: 'Hello World' });
    });
});

// ─── HttpConnectorPlugin Tests ───────────────────────────────────────

describe('HttpConnectorPlugin', () => {
    let engine: AutomationEngine;

    beforeEach(async () => {
        const kernel = new LiteKernel();
        kernel.use(new AutomationServicePlugin());
        kernel.use(new HttpConnectorPlugin());
        await kernel.bootstrap();
        engine = kernel.getService<AutomationEngine>('automation');
    });

    it('should register http_request and connector_action node types', () => {
        const types = engine.getRegisteredNodeTypes();
        expect(types).toContain('http_request');
        expect(types).toContain('connector_action');
    });
});
