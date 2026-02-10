// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { createHash } from 'node:crypto';

import type { 
  HotReloadConfig, 
  PluginStateSnapshot 
} from '@objectstack/spec/kernel';
import type { ObjectLogger } from './logger.js';
import type { Plugin } from './types.js';

// Polyfill for UUID generation to support both Node.js and Browser
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Basic UUID v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Plugin State Manager
 * 
 * Handles state persistence and restoration during hot reloads
 */
class PluginStateManager {
  private logger: ObjectLogger;
  private stateSnapshots = new Map<string, PluginStateSnapshot>();
  private memoryStore = new Map<string, any>();

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'StateManager' });
  }

  /**
   * Save plugin state before reload
   */
  async saveState(
    pluginId: string,
    version: string,
    state: Record<string, any>,
    config: HotReloadConfig
  ): Promise<string> {
    const snapshot: PluginStateSnapshot = {
      pluginId,
      version,
      timestamp: new Date().toISOString(),
      state,
      metadata: {
        checksum: this.calculateChecksum(state),
        compressed: false,
      },
    };

    const snapshotId = generateUUID();

    switch (config.stateStrategy) {
      case 'memory':
        this.memoryStore.set(snapshotId, snapshot);
        this.logger.debug('State saved to memory', { pluginId, snapshotId });
        break;

      case 'disk':
        // For disk storage, we would write to file system
        // For now, store in memory as fallback
        this.memoryStore.set(snapshotId, snapshot);
        this.logger.debug('State saved to disk (memory fallback)', { pluginId, snapshotId });
        break;

      case 'distributed':
        // For distributed storage, would use Redis/etcd
        // For now, store in memory as fallback
        this.memoryStore.set(snapshotId, snapshot);
        this.logger.debug('State saved to distributed store (memory fallback)', { 
          pluginId, 
          snapshotId 
        });
        break;

      case 'none':
        this.logger.debug('State persistence disabled', { pluginId });
        break;
    }

    this.stateSnapshots.set(pluginId, snapshot);
    return snapshotId;
  }

  /**
   * Restore plugin state after reload
   */
  async restoreState(
    pluginId: string,
    snapshotId?: string
  ): Promise<Record<string, any> | undefined> {
    // Try to get from snapshot ID first, otherwise use latest for plugin
    let snapshot: PluginStateSnapshot | undefined;

    if (snapshotId) {
      snapshot = this.memoryStore.get(snapshotId);
    } else {
      snapshot = this.stateSnapshots.get(pluginId);
    }

    if (!snapshot) {
      this.logger.warn('No state snapshot found', { pluginId, snapshotId });
      return undefined;
    }

    // Verify checksum if available
    if (snapshot.metadata?.checksum) {
      const currentChecksum = this.calculateChecksum(snapshot.state);
      if (currentChecksum !== snapshot.metadata.checksum) {
        this.logger.error('State checksum mismatch - data may be corrupted', { 
          pluginId,
          expected: snapshot.metadata.checksum,
          actual: currentChecksum
        });
        return undefined;
      }
    }

    this.logger.debug('State restored', { pluginId, version: snapshot.version });
    return snapshot.state;
  }

  /**
   * Clear state for a plugin
   */
  clearState(pluginId: string): void {
    this.stateSnapshots.delete(pluginId);
    // Note: We don't clear memory store as it might have multiple snapshots
    this.logger.debug('State cleared', { pluginId });
  }

  /**
   * Calculate checksum for state verification using SHA-256.
   */
  private calculateChecksum(state: Record<string, any>): string {
    const stateStr = JSON.stringify(state);
    return createHash('sha256').update(stateStr).digest('hex');
  }

  /**
   * Shutdown state manager
   */
  shutdown(): void {
    this.stateSnapshots.clear();
    this.memoryStore.clear();
    this.logger.info('State manager shutdown complete');
  }
}

/**
 * Hot Reload Manager
 * 
 * Manages hot reloading of plugins with state preservation
 */
export class HotReloadManager {
  private logger: ObjectLogger;
  private stateManager: PluginStateManager;
  private reloadConfigs = new Map<string, HotReloadConfig>();
  private watchHandles = new Map<string, any>();
  private reloadTimers = new Map<string, NodeJS.Timeout>();

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'HotReload' });
    this.stateManager = new PluginStateManager(logger);
  }

  /**
   * Register a plugin for hot reload
   */
  registerPlugin(pluginName: string, config: HotReloadConfig): void {
    if (!config.enabled) {
      this.logger.debug('Hot reload disabled for plugin', { plugin: pluginName });
      return;
    }

    this.reloadConfigs.set(pluginName, config);
    this.logger.info('Plugin registered for hot reload', { 
      plugin: pluginName,
      watchPatterns: config.watchPatterns,
      stateStrategy: config.stateStrategy
    });
  }

  /**
   * Start watching for changes (requires file system integration)
   */
  startWatching(pluginName: string): void {
    const config = this.reloadConfigs.get(pluginName);
    if (!config || !config.enabled) {
      return;
    }

    // Note: Actual file watching would require chokidar or similar
    // This is a placeholder for the integration point
    this.logger.info('File watching started', { 
      plugin: pluginName,
      patterns: config.watchPatterns 
    });
  }

  /**
   * Stop watching for changes
   */
  stopWatching(pluginName: string): void {
    const handle = this.watchHandles.get(pluginName);
    if (handle) {
      // Stop watching (would call chokidar close())
      this.watchHandles.delete(pluginName);
      this.logger.info('File watching stopped', { plugin: pluginName });
    }

    // Clear any pending reload timers
    const timer = this.reloadTimers.get(pluginName);
    if (timer) {
      clearTimeout(timer);
      this.reloadTimers.delete(pluginName);
    }
  }

  /**
   * Trigger hot reload for a plugin
   */
  async reloadPlugin(
    pluginName: string,
    plugin: Plugin,
    version: string,
    getPluginState: () => Record<string, any>,
    restorePluginState: (state: Record<string, any>) => void
  ): Promise<boolean> {
    const config = this.reloadConfigs.get(pluginName);
    if (!config) {
      this.logger.warn('Cannot reload - plugin not registered', { plugin: pluginName });
      return false;
    }

    this.logger.info('Starting hot reload', { plugin: pluginName });

    try {
      // Call before reload hooks
      if (config.beforeReload) {
        this.logger.debug('Executing before reload hooks', { 
          plugin: pluginName,
          hooks: config.beforeReload 
        });
        // Hook execution would be done through kernel's hook system
      }

      // Save state if configured
      let snapshotId: string | undefined;
      if (config.preserveState && config.stateStrategy !== 'none') {
        const state = getPluginState();
        snapshotId = await this.stateManager.saveState(
          pluginName,
          version,
          state,
          config
        );
        this.logger.debug('Plugin state saved', { plugin: pluginName, snapshotId });
      }

      // Gracefully shutdown the plugin
      if (plugin.destroy) {
        this.logger.debug('Destroying plugin', { plugin: pluginName });
        
        const shutdownPromise = plugin.destroy();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Shutdown timeout')), config.shutdownTimeout);
        });

        await Promise.race([shutdownPromise, timeoutPromise]);
        this.logger.debug('Plugin destroyed successfully', { plugin: pluginName });
      }

      // At this point, the kernel would reload the plugin module
      // This would be handled by the plugin loader
      this.logger.debug('Plugin module would be reloaded here', { plugin: pluginName });

      // Restore state if we saved it
      if (snapshotId && config.preserveState) {
        const restoredState = await this.stateManager.restoreState(pluginName, snapshotId);
        if (restoredState) {
          restorePluginState(restoredState);
          this.logger.debug('Plugin state restored', { plugin: pluginName });
        }
      }

      // Call after reload hooks
      if (config.afterReload) {
        this.logger.debug('Executing after reload hooks', { 
          plugin: pluginName,
          hooks: config.afterReload 
        });
        // Hook execution would be done through kernel's hook system
      }

      this.logger.info('Hot reload completed successfully', { plugin: pluginName });
      return true;
    } catch (error) {
      this.logger.error('Hot reload failed', { 
        plugin: pluginName, 
        error 
      });
      return false;
    }
  }

  /**
   * Schedule a reload with debouncing
   */
  scheduleReload(
    pluginName: string,
    reloadFn: () => Promise<void>
  ): void {
    const config = this.reloadConfigs.get(pluginName);
    if (!config) {
      return;
    }

    // Clear existing timer
    const existingTimer = this.reloadTimers.get(pluginName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new reload with debounce
    const timer = setTimeout(() => {
      this.logger.debug('Debounce period elapsed, executing reload', { 
        plugin: pluginName 
      });
      reloadFn().catch(error => {
        this.logger.error('Scheduled reload failed', { 
          plugin: pluginName, 
          error 
        });
      });
      this.reloadTimers.delete(pluginName);
    }, config.debounceDelay);

    this.reloadTimers.set(pluginName, timer);
    this.logger.debug('Reload scheduled with debounce', { 
      plugin: pluginName,
      delay: config.debounceDelay 
    });
  }

  /**
   * Get state manager for direct access
   */
  getStateManager(): PluginStateManager {
    return this.stateManager;
  }

  /**
   * Shutdown hot reload manager
   */
  shutdown(): void {
    // Stop all watching
    for (const pluginName of this.watchHandles.keys()) {
      this.stopWatching(pluginName);
    }

    // Clear all timers
    for (const timer of this.reloadTimers.values()) {
      clearTimeout(timer);
    }

    this.reloadConfigs.clear();
    this.watchHandles.clear();
    this.reloadTimers.clear();
    this.stateManager.shutdown();
    
    this.logger.info('Hot reload manager shutdown complete');
  }
}
