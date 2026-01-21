"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@objectstack/runtime");
const driver_memory_1 = require("@objectstack/driver-memory");
const plugin_hono_server_1 = require("@objectstack/plugin-hono-server");
const objectstack_config_1 = __importDefault(require("@objectstack/example-crm/objectstack.config"));
const objectstack_config_2 = __importDefault(require("@objectstack/example-todo/objectstack.config"));
const objectstack_config_3 = __importDefault(require("@objectstack/plugin-bi/objectstack.config"));
(async () => {
    console.log('🚀 Booting Kernel...');
    const kernel = new runtime_1.ObjectStackKernel([
        objectstack_config_1.default,
        objectstack_config_2.default,
        objectstack_config_3.default,
        new driver_memory_1.InMemoryDriver(),
        // Load the Hono Server Plugin
        new plugin_hono_server_1.HonoServerPlugin({
            port: 3004,
            staticRoot: './public'
        })
    ]);
    await kernel.start();
})();
