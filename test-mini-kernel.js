"use strict";
/**
 * MiniKernel Test Suite
 *
 * Tests the new ObjectKernel (MiniKernel) architecture:
 * 1. Basic plugin registration and lifecycle
 * 2. Service registry (registerService/getService)
 * 3. Dependency resolution
 * 4. Hook/event system
 * 5. ObjectQL as a plugin
 * 6. Multiple plugins working together
 */
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
var src_1 = require("./packages/runtime/src");
// Test 1: Basic Plugin Lifecycle
function testBasicLifecycle() {
    return __awaiter(this, void 0, void 0, function () {
        var events, TestPlugin, kernel, expected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 1: Basic Plugin Lifecycle ===');
                    events = [];
                    TestPlugin = /** @class */ (function () {
                        function TestPlugin() {
                            this.name = 'test-plugin';
                        }
                        TestPlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    events.push('init');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        TestPlugin.prototype.start = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    events.push('start');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        TestPlugin.prototype.destroy = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    events.push('destroy');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return TestPlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new TestPlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    expected = ['init', 'start', 'destroy'];
                    if (JSON.stringify(events) !== JSON.stringify(expected)) {
                        throw new Error("Expected ".concat(JSON.stringify(expected), ", got ").concat(JSON.stringify(events)));
                    }
                    console.log('✅ Plugin lifecycle works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 2: Service Registry
function testServiceRegistry() {
    return __awaiter(this, void 0, void 0, function () {
        var ServicePlugin, kernel, service;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 2: Service Registry ===');
                    ServicePlugin = /** @class */ (function () {
                        function ServicePlugin() {
                            this.name = 'service-plugin';
                        }
                        ServicePlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ctx.registerService('test-service', { value: 42 });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return ServicePlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new ServicePlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    service = kernel.getService('test-service');
                    if (service.value !== 42) {
                        throw new Error('Service not registered correctly');
                    }
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    console.log('✅ Service registry works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 3: Dependency Resolution
function testDependencyResolution() {
    return __awaiter(this, void 0, void 0, function () {
        var initOrder, PluginA, PluginB, PluginC, kernel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 3: Dependency Resolution ===');
                    initOrder = [];
                    PluginA = /** @class */ (function () {
                        function PluginA() {
                            this.name = 'plugin-a';
                        }
                        PluginA.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    initOrder.push('A');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return PluginA;
                    }());
                    PluginB = /** @class */ (function () {
                        function PluginB() {
                            this.name = 'plugin-b';
                            this.dependencies = ['plugin-a'];
                        }
                        PluginB.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    initOrder.push('B');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return PluginB;
                    }());
                    PluginC = /** @class */ (function () {
                        function PluginC() {
                            this.name = 'plugin-c';
                            this.dependencies = ['plugin-b'];
                        }
                        PluginC.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    initOrder.push('C');
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return PluginC;
                    }());
                    kernel = new src_1.ObjectKernel();
                    // Register in reverse order to test dependency resolution
                    kernel.use(new PluginC());
                    kernel.use(new PluginB());
                    kernel.use(new PluginA());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    if (JSON.stringify(initOrder) !== JSON.stringify(['A', 'B', 'C'])) {
                        throw new Error("Expected ['A', 'B', 'C'], got ".concat(JSON.stringify(initOrder)));
                    }
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    console.log('✅ Dependency resolution works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 4: Hook System
function testHookSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var hookCalls, HookPlugin, kernel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 4: Hook System ===');
                    hookCalls = [];
                    HookPlugin = /** @class */ (function () {
                        function HookPlugin() {
                            this.name = 'hook-plugin';
                        }
                        HookPlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ctx.hook('test-event', function () {
                                        hookCalls.push('hook1');
                                    });
                                    ctx.hook('test-event', function () {
                                        hookCalls.push('hook2');
                                    });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        HookPlugin.prototype.start = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.trigger('test-event')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return HookPlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new HookPlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    if (JSON.stringify(hookCalls) !== JSON.stringify(['hook1', 'hook2'])) {
                        throw new Error("Expected ['hook1', 'hook2'], got ".concat(JSON.stringify(hookCalls)));
                    }
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    console.log('✅ Hook system works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 5: ObjectQL as Plugin
function testObjectQLPlugin() {
    return __awaiter(this, void 0, void 0, function () {
        var kernel, objectql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 5: ObjectQL as Plugin ===');
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new src_1.ObjectQLPlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    objectql = kernel.getService('objectql');
                    if (!objectql) {
                        throw new Error('ObjectQL service not registered');
                    }
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    console.log('✅ ObjectQL plugin works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 6: Multiple Plugins
function testMultiplePlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var mockDriver, DataPlugin, ApiPlugin, kernel, api;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 6: Multiple Plugins with Dependencies ===');
                    mockDriver = {
                        name: 'mock-driver',
                        registerDriver: function (driver) {
                            // Mock implementation
                        },
                    };
                    DataPlugin = /** @class */ (function () {
                        function DataPlugin() {
                            this.name = 'data-plugin';
                        }
                        DataPlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ctx.registerService('data', { query: function () { return 'data'; } });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return DataPlugin;
                    }());
                    ApiPlugin = /** @class */ (function () {
                        function ApiPlugin() {
                            this.name = 'api-plugin';
                            this.dependencies = ['data-plugin'];
                        }
                        ApiPlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                var data;
                                return __generator(this, function (_a) {
                                    data = ctx.getService('data');
                                    ctx.registerService('api', { getData: function () { return data.query(); } });
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return ApiPlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new ApiPlugin());
                    kernel.use(new DataPlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 1:
                    _a.sent();
                    api = kernel.getService('api');
                    if (api.getData() !== 'data') {
                        throw new Error('Plugin dependencies not working');
                    }
                    return [4 /*yield*/, kernel.shutdown()];
                case 2:
                    _a.sent();
                    console.log('✅ Multiple plugins with dependencies work correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Test 7: Error Handling
function testErrorHandling() {
    return __awaiter(this, void 0, void 0, function () {
        var DuplicatePlugin, kernel, e_1, MissingDepPlugin, kernel, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n=== Test 7: Error Handling ===');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    DuplicatePlugin = /** @class */ (function () {
                        function DuplicatePlugin() {
                            this.name = 'dup-plugin';
                        }
                        DuplicatePlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ctx.registerService('dup', {});
                                    ctx.registerService('dup', {}); // Should throw
                                    return [2 /*return*/];
                                });
                            });
                        };
                        return DuplicatePlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new DuplicatePlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 2:
                    _a.sent();
                    throw new Error('Should have thrown on duplicate service');
                case 3:
                    e_1 = _a.sent();
                    if (!e_1.message.includes('already registered')) {
                        throw new Error('Wrong error message');
                    }
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    MissingDepPlugin = /** @class */ (function () {
                        function MissingDepPlugin() {
                            this.name = 'missing-dep';
                            this.dependencies = ['non-existent'];
                        }
                        MissingDepPlugin.prototype.init = function (ctx) {
                            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/];
                            }); });
                        };
                        return MissingDepPlugin;
                    }());
                    kernel = new src_1.ObjectKernel();
                    kernel.use(new MissingDepPlugin());
                    return [4 /*yield*/, kernel.bootstrap()];
                case 5:
                    _a.sent();
                    throw new Error('Should have thrown on missing dependency');
                case 6:
                    e_2 = _a.sent();
                    if (!e_2.message.includes('not found')) {
                        throw new Error('Wrong error message');
                    }
                    return [3 /*break*/, 7];
                case 7:
                    console.log('✅ Error handling works correctly');
                    return [2 /*return*/];
            }
        });
    });
}
// Run all tests
function runAllTests() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Starting MiniKernel Test Suite...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, testBasicLifecycle()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testServiceRegistry()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testDependencyResolution()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testHookSystem()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testObjectQLPlugin()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testMultiplePlugins()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, testErrorHandling()];
                case 8:
                    _a.sent();
                    console.log('\n✅ All MiniKernel tests passed!\n');
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error('\n❌ Test failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
runAllTests();
