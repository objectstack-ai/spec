"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ObjectStackRuntimeProtocol = void 0;
var objectql_1 = require("@objectstack/objectql");
var ObjectStackRuntimeProtocol = /** @class */ (function () {
    function ObjectStackRuntimeProtocol(engine) {
        this.engine = engine;
    }
    // 1. Discovery
    ObjectStackRuntimeProtocol.prototype.getDiscovery = function () {
        return {
            name: 'ObjectOS Server',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            routes: {
                discovery: '/api/v1',
                metadata: '/api/v1/meta',
                data: '/api/v1/data',
                auth: '/api/v1/auth',
                ui: '/api/v1/ui'
            },
            capabilities: {
                search: true,
                files: true
            }
        };
    };
    // 2. Metadata: List Types
    ObjectStackRuntimeProtocol.prototype.getMetaTypes = function () {
        var types = objectql_1.SchemaRegistry.getRegisteredTypes();
        return {
            data: types.map(function (type) { return ({
                type: type,
                href: "/api/v1/meta/".concat(type, "s"),
                count: objectql_1.SchemaRegistry.listItems(type).length
            }); })
        };
    };
    // 3. Metadata: List Items by Type
    ObjectStackRuntimeProtocol.prototype.getMetaItems = function (typePlural) {
        // Simple Singularization Mapping
        var typeMap = {
            'objects': 'object',
            'apps': 'app',
            'flows': 'flow',
            'reports': 'report',
            'plugins': 'plugin',
            'kinds': 'kind'
        };
        var type = typeMap[typePlural] || typePlural;
        var items = objectql_1.SchemaRegistry.listItems(type);
        var summaries = items.map(function (item) { return (__assign(__assign({ id: item.id, name: item.name, label: item.label, type: item.type, icon: item.icon, description: item.description }, (type === 'object' ? { path: "/api/v1/data/".concat(item.name) } : {})), { self: "/api/v1/meta/".concat(typePlural, "/").concat(item.name || item.id) })); });
        return { data: summaries };
    };
    // 4. Metadata: Get Single Item
    ObjectStackRuntimeProtocol.prototype.getMetaItem = function (typePlural, name) {
        var typeMap = {
            'objects': 'object',
            'apps': 'app',
            'flows': 'flow',
            'reports': 'report',
            'plugins': 'plugin',
            'kinds': 'kind'
        };
        var type = typeMap[typePlural] || typePlural;
        var item = objectql_1.SchemaRegistry.getItem(type, name);
        if (!item)
            throw new Error("Metadata not found: ".concat(type, "/").concat(name));
        return item;
    };
    // 5. UI: View Definition
    ObjectStackRuntimeProtocol.prototype.getUiView = function (objectName, type) {
        var view = this.engine.getView(objectName, type);
        if (!view)
            throw new Error('View not generated');
        return view;
    };
    // 6. Data: Find
    ObjectStackRuntimeProtocol.prototype.findData = function (objectName, query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.find(objectName, query)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 7. Data: Query (Advanced AST)
    ObjectStackRuntimeProtocol.prototype.queryData = function (objectName, body) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.find(objectName, body)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 8. Data: Get
    ObjectStackRuntimeProtocol.prototype.getData = function (objectName, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.get(objectName, id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 9. Data: Create
    ObjectStackRuntimeProtocol.prototype.createData = function (objectName, body) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.create(objectName, body)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 10. Data: Update
    ObjectStackRuntimeProtocol.prototype.updateData = function (objectName, id, body) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.update(objectName, id, body)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 11. Data: Delete
    ObjectStackRuntimeProtocol.prototype.deleteData = function (objectName, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.engine.delete(objectName, id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ObjectStackRuntimeProtocol;
}());
exports.ObjectStackRuntimeProtocol = ObjectStackRuntimeProtocol;
