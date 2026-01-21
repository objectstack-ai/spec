"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@objectstack/runtime");
const objectql_1 = require("@objectstack/objectql");
const driver_memory_1 = require("@objectstack/driver-memory");
const objectstack_config_1 = __importDefault(require("@objectstack/example-todo/objectstack.config"));
(async () => {
    console.log('--- Debug Registry ---');
    console.log('Apps:', [objectstack_config_1.default.name]);
    console.log('Objects inside App:', objectstack_config_1.default.objects?.map((o) => o.name));
    const kernel = new runtime_1.ObjectStackKernel([
        objectstack_config_1.default,
        new driver_memory_1.InMemoryDriver()
    ]);
    await kernel.start();
    console.log('--- Post Start ---');
    // Check Registry directly
    const obj = objectql_1.SchemaRegistry.getObject('todo_task');
    console.log('Registry "todo_task":', obj ? 'FOUND' : 'MISSING');
    // Check Registry via Engine
    try {
        // Access private engine map if possible or simulate query
        // The engine doesn't expose a 'hasObject' method easily, but we can inspect internal logic
        // Actually SchemaRegistry is static, so if it's there, it's there.
    }
    catch (e) {
        console.error(e);
    }
})();
