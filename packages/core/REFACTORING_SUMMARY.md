# Kernel Refactoring Summary

This document summarizes the critical architectural improvements made to the `packages/core` module to address stability, performance, and correctness issues.

## 1. Dependency Injection Context Fix
**Problem:** Service factories were receiving an empty object `{}` instead of the real `PluginContext`.
**Fix:**
- Updated `PluginLoader.createServiceInstance` to ensure `this.context` is passed to factories.
- Added `PluginLoader.setContext` method to inject the context from the Kernel.
- Kernel now properly injects itself and the loader into the context before initialization.

## 2. Sync/Async Gap (Service Availability)
**Problem:** Services created asynchronously (via `awaitFactory`) were not accessible synchronously immediately after initialization, breaking code that expected `getService` to return an instance if the plugin was loaded.
**Fix:**
- Implemented L2 caching via `PluginLoader.getServiceInstance<T>(name: string)`.
- Kernel's `getService` now checks this synchronous cache first before falling back to the async path.
- Ensured singleton instances are stored in `serviceInstances` immediately upon creation.

## 3. Runtime Circular Dependency Detection
**Problem:** Complex service graphs could deadlock or crash the stack if factories recursively requested each other. Static analysis was insufficient for dynamic factories.
**Fix:**
- Added a `creating` Set to `PluginLoader`.
- `createServiceInstance` now tracks which services are currently being built.
- Throws a descriptive error if a loop is detected (e.g., `Circular dependency detected: serviceA -> serviceB -> serviceA`).

## 4. Enhanced Error Handling
**Problem:** The Kernel swallowed errors from service factories (like database connection failures) and threw a generic "Service not found" error, making debugging impossible.
**Fix:**
- Refined `Kernel.getService` to distinguish between "service registration missing" and "factory execution failed".
- Factory errors are now re-thrown with their original stack trace and message.

## 5. Configuration Validation
**Problem:** Configuration validation was a scaffold without implementation.
**Fix:**
- Integrated `PluginConfigValidator` (Zod-based) into `PluginLoader`.
- `validatePluginConfig` now performs actual schema validation against `plugin.configSchema`.

## Verification
- **Build:** Clean build of `dist` artifacts.
- **Tests:** 100% Pass rate (380/380 tests) across 22 test suites.
