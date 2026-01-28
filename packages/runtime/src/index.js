"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStackRuntimeProtocol = exports.DriverPlugin = exports.ObjectQLPlugin = exports.ObjectKernel = exports.ObjectStackKernel = exports.SchemaRegistry = exports.ObjectQL = void 0;
// Export core engine
var objectql_1 = require("@objectstack/objectql");
Object.defineProperty(exports, "ObjectQL", { enumerable: true, get: function () { return objectql_1.ObjectQL; } });
Object.defineProperty(exports, "SchemaRegistry", { enumerable: true, get: function () { return objectql_1.SchemaRegistry; } });
// Export Kernels
var kernel_1 = require("./kernel");
Object.defineProperty(exports, "ObjectStackKernel", { enumerable: true, get: function () { return kernel_1.ObjectStackKernel; } });
var mini_kernel_1 = require("./mini-kernel");
Object.defineProperty(exports, "ObjectKernel", { enumerable: true, get: function () { return mini_kernel_1.ObjectKernel; } });
// Export Plugins
var objectql_plugin_1 = require("./objectql-plugin");
Object.defineProperty(exports, "ObjectQLPlugin", { enumerable: true, get: function () { return objectql_plugin_1.ObjectQLPlugin; } });
var driver_plugin_1 = require("./driver-plugin");
Object.defineProperty(exports, "DriverPlugin", { enumerable: true, get: function () { return driver_plugin_1.DriverPlugin; } });
// Export Protocol
var protocol_1 = require("./protocol");
Object.defineProperty(exports, "ObjectStackRuntimeProtocol", { enumerable: true, get: function () { return protocol_1.ObjectStackRuntimeProtocol; } });
// Export Types
__exportStar(require("./types"), exports);
