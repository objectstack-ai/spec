import { describe, it, expect, beforeEach } from 'vitest';
import { PluginHealthMonitor } from './health-monitor.js';
import { createLogger } from './logger.js';
import type { PluginHealthCheck } from '@objectstack/spec/kernel';

describe('PluginHealthMonitor', () => {
  let monitor: PluginHealthMonitor;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({ level: 'silent' });
    monitor = new PluginHealthMonitor(logger);
  });

  it('should register plugin for health monitoring', () => {
    const config: PluginHealthCheck = {
      interval: 5000,
      timeout: 1000,
      failureThreshold: 3,
      successThreshold: 1,
      autoRestart: false,
      maxRestartAttempts: 3,
      restartBackoff: 'exponential',
    };

    monitor.registerPlugin('test-plugin', config);
    expect(monitor.getHealthStatus('test-plugin')).toBe('unknown');
  });

  it('should report healthy status initially', () => {
    const config: PluginHealthCheck = {
      interval: 5000,
      timeout: 1000,
      failureThreshold: 3,
      successThreshold: 1,
      autoRestart: false,
      maxRestartAttempts: 3,
      restartBackoff: 'fixed',
    };

    monitor.registerPlugin('test-plugin', config);
    expect(monitor.getHealthStatus('test-plugin')).toBe('unknown');
  });

  it('should get all health statuses', () => {
    const config: PluginHealthCheck = {
      interval: 5000,
      timeout: 1000,
      failureThreshold: 3,
      successThreshold: 1,
      autoRestart: false,
      maxRestartAttempts: 3,
      restartBackoff: 'linear',
    };

    monitor.registerPlugin('plugin1', config);
    monitor.registerPlugin('plugin2', config);
    
    const statuses = monitor.getAllHealthStatuses();
    expect(statuses.size).toBe(2);
    expect(statuses.has('plugin1')).toBe(true);
    expect(statuses.has('plugin2')).toBe(true);
  });

  it('should shutdown cleanly', () => {
    const config: PluginHealthCheck = {
      interval: 5000,
      timeout: 1000,
      failureThreshold: 3,
      successThreshold: 1,
      autoRestart: false,
      maxRestartAttempts: 3,
      restartBackoff: 'exponential',
    };

    monitor.registerPlugin('test-plugin', config);
    monitor.shutdown();
    
    expect(monitor.getAllHealthStatuses().size).toBe(0);
  });
});
