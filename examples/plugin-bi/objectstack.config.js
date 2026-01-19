"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BiPlugin = {
    id: 'com.objectstack.bi',
    name: 'Business Intelligence Plugin',
    version: '1.0.0',
    type: 'plugin',
    description: 'Provides BI capabilities, dataset definitions, and chart rendering.',
    // Register Capabilities
    contributes: {
        kinds: [
            {
                id: 'bi.dataset',
                globs: ['**/*.dataset.json', '**/*.dataset.ts'],
                description: 'BI Dataset Definition'
            },
            {
                id: 'bi.dashboard',
                globs: ['**/*.bi-dash.json'],
                description: 'Advanced BI Dashboard'
            }
        ]
    },
    // Lifecycle Entry Point
    // in a real scenario, this would be a path or module name
    extensions: {
        runtime: {
            entry: './src/index.ts'
        }
    }
};
exports.default = BiPlugin;
