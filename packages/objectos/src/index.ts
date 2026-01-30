/**
 * @objectstack/objectos
 * 
 * Operating System Layer for ObjectStack
 * 
 * Provides the kernel, runtime, client SDK, CLI, and AI bridge
 * for the ObjectStack platform.
 */

// Re-export all submodules
export * as Kernel from './kernel';
export * as Runtime from './runtime';
export * as Client from './client';
export * as CLI from './cli';
export * as AIBridge from './ai-bridge';

export const version = '0.6.1';
