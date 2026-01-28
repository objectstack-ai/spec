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
exports.ObjectQLPlugin = void 0;
var objectql_1 = require("@objectstack/objectql");
/**
 * ObjectQL Engine Plugin
 *
 * Registers the ObjectQL engine instance with the kernel as a service.
 * This allows other plugins to access ObjectQL via context.getService('objectql').
 *
 * Usage:
 * - new ObjectQLPlugin() - Creates new ObjectQL with default settings
 * - new ObjectQLPlugin(existingQL) - Uses existing ObjectQL instance
 * - new ObjectQLPlugin(undefined, { custom: 'context' }) - Creates new ObjectQL with custom context
 *
 * Services registered:
 * - 'objectql': ObjectQL engine instance
 */
var ObjectQLPlugin = /** @class */ (function () {
    /**
     * @param ql - Existing ObjectQL instance to use (optional)
     * @param hostContext - Host context for new ObjectQL instance (ignored if ql is provided)
     */
    function ObjectQLPlugin(ql, hostContext) {
        this.name = 'com.objectstack.engine.objectql';
        this.type = 'objectql';
        this.version = '1.0.0';
        if (ql && hostContext) {
            console.warn('[ObjectQLPlugin] Both ql and hostContext provided. hostContext will be ignored.');
        }
        if (ql) {
            this.ql = ql;
        }
        else {
            this.ql = new objectql_1.ObjectQL(hostContext || {
                env: process.env.NODE_ENV || 'development'
            });
        }
    }
    /**
     * Init phase - Register ObjectQL as a service
     */
    ObjectQLPlugin.prototype.init = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Register ObjectQL engine as a service
                ctx.registerService('objectql', this.ql);
                ctx.logger.log('[ObjectQLPlugin] ObjectQL engine registered as service');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Start phase - Initialize ObjectQL engine
     */
    ObjectQLPlugin.prototype.start = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Initialize the ObjectQL engine
                    return [4 /*yield*/, this.ql.init()];
                    case 1:
                        // Initialize the ObjectQL engine
                        _a.sent();
                        ctx.logger.log('[ObjectQLPlugin] ObjectQL engine initialized');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Destroy phase - Cleanup
     */
    ObjectQLPlugin.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // ObjectQL doesn't have cleanup yet, but we provide the hook
                console.log('[ObjectQLPlugin] ObjectQL engine destroyed');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Legacy install method for backward compatibility
     * @deprecated Use init/start lifecycle hooks instead
     */
    ObjectQLPlugin.prototype.install = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Attach the ObjectQL engine to the kernel for backward compatibility
                ctx.engine.ql = this.ql;
                console.log('[ObjectQLPlugin] ObjectQL engine registered (legacy mode)');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the ObjectQL instance
     * @returns ObjectQL instance
     */
    ObjectQLPlugin.prototype.getQL = function () {
        return this.ql;
    };
    return ObjectQLPlugin;
}());
exports.ObjectQLPlugin = ObjectQLPlugin;
