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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStackKernel = void 0;
var objectql_1 = require("@objectstack/objectql");
/**
 * ObjectStack Kernel (Microkernel)
 *
 * The central container orchestrating the application lifecycle,
 * plugins, and the core ObjectQL engine.
 */
var ObjectStackKernel = /** @class */ (function () {
    function ObjectStackKernel(plugins) {
        if (plugins === void 0) { plugins = []; }
        this.plugins = plugins;
        // Check if any plugin provides ObjectQL via type: 'objectql'
        // This aligns with the manifest schema that supports objectql as a package type
        var hasObjectQLPlugin = plugins.some(function (p) {
            return p && typeof p === 'object' && p.type === 'objectql';
        });
        if (!hasObjectQLPlugin) {
            // Backward compatibility: Initialize ObjectQL directly if no plugin provides it
            console.warn('[Kernel] No ObjectQL plugin found, using default initialization. Consider using ObjectQLPlugin.');
            this.ql = new objectql_1.ObjectQL({
                env: process.env.NODE_ENV || 'development'
            });
        }
    }
    /**
     * Ensure ObjectQL engine is initialized
     * @throws Error if ObjectQL is not available
     */
    ObjectStackKernel.prototype.ensureObjectQL = function () {
        if (!this.ql) {
            throw new Error('[Kernel] ObjectQL engine not initialized. Ensure ObjectQLPlugin is registered or kernel is properly initialized.');
        }
        return this.ql;
    };
    ObjectStackKernel.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, p, _b, _c, obj, InMemoryDriver, driver, e_1, _d, _e, p;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        console.log('[Kernel] Starting...');
                        _i = 0, _a = this.plugins;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        p = _a[_i];
                        if (!('onStart' in p || 'install' in p)) return [3 /*break*/, 4];
                        console.log("[Kernel] Loading Runtime Plugin: ".concat(p.name));
                        if (!p.install) return [3 /*break*/, 3];
                        return [4 /*yield*/, p.install({ engine: this })];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        // Otherwise treat as App Manifest
                        console.log("[Kernel] Loading App Manifest: ".concat(p.id || p.name));
                        objectql_1.SchemaRegistry.registerPlugin(p);
                        // Register Objects from App/Plugin
                        if (p.objects) {
                            for (_b = 0, _c = p.objects; _b < _c.length; _b++) {
                                obj = _c[_b];
                                objectql_1.SchemaRegistry.registerObject(obj);
                                console.log("[Kernel] Registered Object: ".concat(obj.name));
                            }
                        }
                        _f.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        _f.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('@objectstack/driver-memory')); })];
                    case 7:
                        InMemoryDriver = (_f.sent()).InMemoryDriver;
                        driver = new InMemoryDriver();
                        this.ensureObjectQL().registerDriver(driver);
                        return [3 /*break*/, 9];
                    case 8:
                        e_1 = _f.sent();
                        return [3 /*break*/, 9];
                    case 9: 
                    // 2. Initialize Engine
                    return [4 /*yield*/, this.ensureObjectQL().init()];
                    case 10:
                        // 2. Initialize Engine
                        _f.sent();
                        // 3. Seed Data
                        return [4 /*yield*/, this.seed()];
                    case 11:
                        // 3. Seed Data
                        _f.sent();
                        _d = 0, _e = this.plugins;
                        _f.label = 12;
                    case 12:
                        if (!(_d < _e.length)) return [3 /*break*/, 15];
                        p = _e[_d];
                        if (!(('onStart' in p) && typeof p.onStart === 'function')) return [3 /*break*/, 14];
                        console.log("[Kernel] Starting Plugin: ".concat(p.name));
                        return [4 /*yield*/, p.onStart({ engine: this })];
                    case 13:
                        _f.sent();
                        _f.label = 14;
                    case 14:
                        _d++;
                        return [3 /*break*/, 12];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    ObjectStackKernel.prototype.seed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plugins, apps, _i, apps_1, appItem, app, _a, _b, seed, existing, _c, _d, record, e_2, e_3;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 13, , 14]);
                        // Mock System Table
                        try {
                            // We don't have SystemStatus defined in schema usually, skipping for general engine
                            // await this.ql.insert('SystemStatus', { status: 'OK', uptime: 0 });
                        }
                        catch (_f) { }
                        plugins = objectql_1.SchemaRegistry.getRegisteredTypes();
                        apps = __spreadArray(__spreadArray([], objectql_1.SchemaRegistry.listItems('app'), true), objectql_1.SchemaRegistry.listItems('plugin'), true);
                        _i = 0, apps_1 = apps;
                        _e.label = 1;
                    case 1:
                        if (!(_i < apps_1.length)) return [3 /*break*/, 12];
                        appItem = apps_1[_i];
                        app = appItem;
                        if (!(app.data && Array.isArray(app.data))) return [3 /*break*/, 11];
                        console.log("[Kernel] Seeding data for ".concat(app.name || app.id, "..."));
                        _a = 0, _b = app.data;
                        _e.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 11];
                        seed = _b[_a];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, this.ensureObjectQL().find(seed.object, { top: 1 })];
                    case 4:
                        existing = _e.sent();
                        if (!(existing.length === 0)) return [3 /*break*/, 8];
                        console.log("[Kernel] Inserting ".concat(seed.records.length, " records into ").concat(seed.object));
                        _c = 0, _d = seed.records;
                        _e.label = 5;
                    case 5:
                        if (!(_c < _d.length)) return [3 /*break*/, 8];
                        record = _d[_c];
                        return [4 /*yield*/, this.ensureObjectQL().insert(seed.object, record)];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _c++;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_2 = _e.sent();
                        console.warn("[Kernel] Failed to seed ".concat(seed.object), e_2);
                        return [3 /*break*/, 10];
                    case 10:
                        _a++;
                        return [3 /*break*/, 2];
                    case 11:
                        _i++;
                        return [3 /*break*/, 1];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        e_3 = _e.sent();
                        console.warn('Seed failed (driver might not be ready):', e_3);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // Forward methods to ObjectQL
    ObjectStackKernel.prototype.find = function (objectName, query) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSchema(objectName);
                        return [4 /*yield*/, this.ensureObjectQL().find(objectName, { top: 100 })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, { value: results, count: results.length }];
                }
            });
        });
    };
    ObjectStackKernel.prototype.get = function (objectName, id) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSchema(objectName);
                        return [4 /*yield*/, this.ensureObjectQL().find(objectName, { top: 1 })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results[0]];
                }
            });
        });
    };
    ObjectStackKernel.prototype.create = function (objectName, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureSchema(objectName);
                return [2 /*return*/, this.ensureObjectQL().insert(objectName, data)];
            });
        });
    };
    ObjectStackKernel.prototype.update = function (objectName, id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureSchema(objectName);
                return [2 /*return*/, this.ensureObjectQL().update(objectName, id, data)];
            });
        });
    };
    ObjectStackKernel.prototype.delete = function (objectName, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureSchema(objectName);
                return [2 /*return*/, this.ensureObjectQL().delete(objectName, id)];
            });
        });
    };
    // [New Methods for ObjectUI]
    ObjectStackKernel.prototype.getMetadata = function (objectName) {
        return this.ensureSchema(objectName);
    };
    ObjectStackKernel.prototype.getView = function (objectName, viewType) {
        if (viewType === void 0) { viewType = 'list'; }
        var schema = this.ensureSchema(objectName);
        // Auto-Scaffold Default View
        if (viewType === 'list') {
            return {
                type: 'datagrid',
                title: "".concat(schema.label || objectName, " List"),
                columns: Object.keys(schema.fields || {}).map(function (key) {
                    var _a, _b;
                    return ({
                        field: key,
                        label: ((_b = (_a = schema.fields) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.label) || key,
                        width: 150
                    });
                }),
                actions: ['create', 'edit', 'delete']
            };
        }
        return null;
    };
    ObjectStackKernel.prototype.ensureSchema = function (name) {
        var schema = objectql_1.SchemaRegistry.getObject(name);
        if (!schema)
            throw new Error("Unknown object: ".concat(name));
        return schema;
    };
    return ObjectStackKernel;
}());
exports.ObjectStackKernel = ObjectStackKernel;
