"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectKernel = void 0;
var objectql_1 = require("@objectstack/objectql");
/**
 * ObjectKernel - MiniKernel Architecture
 *
 * A highly modular, plugin-based microkernel that:
 * - Manages plugin lifecycle (init, start, destroy)
 * - Provides dependency injection via service registry
 * - Implements event/hook system for inter-plugin communication
 * - Handles dependency resolution (topological sort)
 *
 * Core philosophy:
 * - Business logic is completely separated into plugins
 * - Kernel only manages lifecycle, DI, and hooks
 * - Plugins are loaded as equal building blocks
 */
var ObjectKernel = /** @class */ (function () {
    function ObjectKernel() {
        var _this = this;
        this.plugins = new Map();
        this.services = new Map();
        this.hooks = new Map();
        this.state = 'idle';
        /**
         * Plugin context - shared across all plugins
         */
        this.context = {
            registerService: function (name, service) {
                if (_this.services.has(name)) {
                    throw new Error("[Kernel] Service '".concat(name, "' already registered"));
                }
                _this.services.set(name, service);
                _this.context.logger.log("[Kernel] Service '".concat(name, "' registered"));
            },
            getService: function (name) {
                var service = _this.services.get(name);
                if (!service) {
                    throw new Error("[Kernel] Service '".concat(name, "' not found"));
                }
                return service;
            },
            hook: function (name, handler) {
                if (!_this.hooks.has(name)) {
                    _this.hooks.set(name, []);
                }
                _this.hooks.get(name).push(handler);
            },
            trigger: function (name) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return __awaiter(_this, void 0, void 0, function () {
                    var handlers, _a, handlers_1, handler;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                handlers = this.hooks.get(name) || [];
                                _a = 0, handlers_1 = handlers;
                                _b.label = 1;
                            case 1:
                                if (!(_a < handlers_1.length)) return [3 /*break*/, 4];
                                handler = handlers_1[_a];
                                return [4 /*yield*/, handler.apply(void 0, args)];
                            case 2:
                                _b.sent();
                                _b.label = 3;
                            case 3:
                                _a++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            },
            logger: console,
        };
    }
    /**
     * Register a plugin
     * @param plugin - Plugin instance
     */
    ObjectKernel.prototype.use = function (plugin) {
        if (this.state !== 'idle') {
            throw new Error('[Kernel] Cannot register plugins after bootstrap has started');
        }
        var pluginName = plugin.name;
        if (this.plugins.has(pluginName)) {
            throw new Error("[Kernel] Plugin '".concat(pluginName, "' already registered"));
        }
        this.plugins.set(pluginName, plugin);
        return this;
    };
    /**
     * Resolve plugin dependencies using topological sort
     * @returns Ordered list of plugins
     */
    ObjectKernel.prototype.resolveDependencies = function () {
        var _this = this;
        var resolved = [];
        var visited = new Set();
        var visiting = new Set();
        var visit = function (pluginName) {
            if (visited.has(pluginName))
                return;
            if (visiting.has(pluginName)) {
                throw new Error("[Kernel] Circular dependency detected: ".concat(pluginName));
            }
            var plugin = _this.plugins.get(pluginName);
            if (!plugin) {
                throw new Error("[Kernel] Plugin '".concat(pluginName, "' not found"));
            }
            visiting.add(pluginName);
            // Visit dependencies first (for new Plugin interface)
            var deps = _this.isNewPlugin(plugin) ? plugin.dependencies || [] : [];
            for (var _i = 0, deps_1 = deps; _i < deps_1.length; _i++) {
                var dep = deps_1[_i];
                if (!_this.plugins.has(dep)) {
                    throw new Error("[Kernel] Dependency '".concat(dep, "' not found for plugin '").concat(pluginName, "'"));
                }
                visit(dep);
            }
            visiting.delete(pluginName);
            visited.add(pluginName);
            resolved.push(plugin);
        };
        // Visit all plugins
        for (var _i = 0, _a = this.plugins.keys(); _i < _a.length; _i++) {
            var pluginName = _a[_i];
            visit(pluginName);
        }
        return resolved;
    };
    /**
     * Type guard to check if plugin uses new interface
     */
    ObjectKernel.prototype.isNewPlugin = function (plugin) {
        return 'init' in plugin;
    };
    /**
     * Bootstrap the kernel
     * 1. Resolve dependencies (topological sort)
     * 2. Init phase - plugins register services
     * 3. Start phase - plugins execute business logic
     * 4. Trigger 'kernel:ready' hook
     */
    ObjectKernel.prototype.bootstrap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var orderedPlugins, _i, orderedPlugins_1, plugin, objects, _a, objects_1, obj, _b, orderedPlugins_2, plugin;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.state !== 'idle') {
                            throw new Error('[Kernel] Kernel already bootstrapped');
                        }
                        this.state = 'initializing';
                        this.context.logger.log('[Kernel] Bootstrap started...');
                        orderedPlugins = this.resolveDependencies();
                        // Phase 1: Init - Plugins register services
                        this.context.logger.log('[Kernel] Phase 1: Init plugins...');
                        _i = 0, orderedPlugins_1 = orderedPlugins;
                        _c.label = 1;
                    case 1:
                        if (!(_i < orderedPlugins_1.length)) return [3 /*break*/, 7];
                        plugin = orderedPlugins_1[_i];
                        if (!this.isNewPlugin(plugin)) return [3 /*break*/, 3];
                        this.context.logger.log("[Kernel] Init: ".concat(plugin.name));
                        return [4 /*yield*/, plugin.init(this.context)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        // Legacy RuntimePlugin support
                        this.context.logger.log("[Kernel] Init (legacy): ".concat(plugin.name));
                        if (!plugin.install) return [3 /*break*/, 5];
                        return [4 /*yield*/, plugin.install({ engine: this })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        // Also handle old manifest-style plugins
                        if ('objects' in plugin) {
                            objectql_1.SchemaRegistry.registerPlugin(plugin);
                            objects = plugin.objects;
                            if (objects) {
                                for (_a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
                                    obj = objects_1[_a];
                                    objectql_1.SchemaRegistry.registerObject(obj);
                                    this.context.logger.log("[Kernel] Registered Object: ".concat(obj.name));
                                }
                            }
                        }
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // Phase 2: Start - Plugins execute business logic
                        this.context.logger.log('[Kernel] Phase 2: Start plugins...');
                        this.state = 'running';
                        _b = 0, orderedPlugins_2 = orderedPlugins;
                        _c.label = 8;
                    case 8:
                        if (!(_b < orderedPlugins_2.length)) return [3 /*break*/, 14];
                        plugin = orderedPlugins_2[_b];
                        if (!this.isNewPlugin(plugin)) return [3 /*break*/, 11];
                        if (!plugin.start) return [3 /*break*/, 10];
                        this.context.logger.log("[Kernel] Start: ".concat(plugin.name));
                        return [4 /*yield*/, plugin.start(this.context)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        if (!plugin.onStart) return [3 /*break*/, 13];
                        this.context.logger.log("[Kernel] Start (legacy): ".concat(plugin.name));
                        return [4 /*yield*/, plugin.onStart({ engine: this })];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        _b++;
                        return [3 /*break*/, 8];
                    case 14:
                        // Phase 3: Trigger kernel:ready hook
                        this.context.logger.log('[Kernel] Triggering kernel:ready hook...');
                        return [4 /*yield*/, this.context.trigger('kernel:ready')];
                    case 15:
                        _c.sent();
                        this.context.logger.log('[Kernel] ✅ Bootstrap complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Shutdown the kernel
     * Calls destroy on all plugins in reverse order
     */
    ObjectKernel.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var orderedPlugins, _i, orderedPlugins_3, plugin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state !== 'running') {
                            throw new Error('[Kernel] Kernel not running');
                        }
                        this.context.logger.log('[Kernel] Shutdown started...');
                        this.state = 'stopped';
                        orderedPlugins = Array.from(this.plugins.values()).reverse();
                        _i = 0, orderedPlugins_3 = orderedPlugins;
                        _a.label = 1;
                    case 1:
                        if (!(_i < orderedPlugins_3.length)) return [3 /*break*/, 4];
                        plugin = orderedPlugins_3[_i];
                        if (!(this.isNewPlugin(plugin) && plugin.destroy)) return [3 /*break*/, 3];
                        this.context.logger.log("[Kernel] Destroy: ".concat(plugin.name));
                        return [4 /*yield*/, plugin.destroy()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.context.logger.log('[Kernel] ✅ Shutdown complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a service from the registry
     * Convenience method for external access
     */
    ObjectKernel.prototype.getService = function (name) {
        return this.context.getService(name);
    };
    /**
     * Check if kernel is running
     */
    ObjectKernel.prototype.isRunning = function () {
        return this.state === 'running';
    };
    /**
     * Get kernel state
     */
    ObjectKernel.prototype.getState = function () {
        return this.state;
    };
    return ObjectKernel;
}());
exports.ObjectKernel = ObjectKernel;
