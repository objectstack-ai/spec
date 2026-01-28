// Export core engine
export { ObjectQL, SchemaRegistry } from '@objectstack/objectql';

// Export Kernels
export { ObjectKernel } from './mini-kernel.js';

/**
 * @deprecated Use ObjectKernel instead for better modularity and plugin architecture.
 * ObjectStackKernel is kept for backward compatibility only.
 * @see {ObjectKernel} - The recommended MiniKernel implementation
 */
export { ObjectStackKernel } from './kernel.js';

// Export Plugins
export { ObjectQLPlugin } from './objectql-plugin.js';
export { DriverPlugin } from './driver-plugin.js';
export { AppManifestPlugin } from './app-manifest-plugin.js';

// Export Protocol
export { ObjectStackRuntimeProtocol } from './protocol.js';

// Export Types
export * from './types.js';

