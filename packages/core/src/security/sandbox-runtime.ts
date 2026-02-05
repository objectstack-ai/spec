import type { 
  SandboxConfig
} from '@objectstack/spec/kernel';
import type { ObjectLogger } from '../logger.js';
import { getMemoryUsage } from '../utils/env.js';

/**
 * Resource Usage Statistics
 */
export interface ResourceUsage {
  memory: {
    current: number;
    peak: number;
    limit?: number;
  };
  cpu: {
    current: number;
    average: number;
    limit?: number;
  };
  connections: {
    current: number;
    limit?: number;
  };
}

/**
 * Sandbox Execution Context
 * Represents an isolated execution environment for a plugin
 */
export interface SandboxContext {
  pluginId: string;
  config: SandboxConfig;
  startTime: Date;
  resourceUsage: ResourceUsage;
}

/**
 * Plugin Sandbox Runtime
 * 
 * Provides isolated execution environments for plugins with resource limits
 * and access controls
 */
export class PluginSandboxRuntime {
  private logger: ObjectLogger;
  
  // Active sandboxes (pluginId -> context)
  private sandboxes = new Map<string, SandboxContext>();
  
  // Resource monitoring intervals
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'SandboxRuntime' });
  }

  /**
   * Create a sandbox for a plugin
   */
  createSandbox(pluginId: string, config: SandboxConfig): SandboxContext {
    if (this.sandboxes.has(pluginId)) {
      throw new Error(`Sandbox already exists for plugin: ${pluginId}`);
    }

    const context: SandboxContext = {
      pluginId,
      config,
      startTime: new Date(),
      resourceUsage: {
        memory: { current: 0, peak: 0, limit: config.memory?.maxHeap },
        cpu: { current: 0, average: 0, limit: config.cpu?.maxCpuPercent },
        connections: { current: 0, limit: config.network?.maxConnections },
      },
    };

    this.sandboxes.set(pluginId, context);

    // Start resource monitoring
    this.startResourceMonitoring(pluginId);

    this.logger.info('Sandbox created', { 
      pluginId,
      level: config.level,
      memoryLimit: config.memory?.maxHeap,
      cpuLimit: config.cpu?.maxCpuPercent
    });

    return context;
  }

  /**
   * Destroy a sandbox
   */
  destroySandbox(pluginId: string): void {
    const context = this.sandboxes.get(pluginId);
    if (!context) {
      return;
    }

    // Stop monitoring
    this.stopResourceMonitoring(pluginId);

    this.sandboxes.delete(pluginId);

    this.logger.info('Sandbox destroyed', { pluginId });
  }

  /**
   * Check if resource access is allowed
   */
  checkResourceAccess(
    pluginId: string,
    resourceType: 'file' | 'network' | 'process' | 'env',
    resourcePath?: string
  ): { allowed: boolean; reason?: string } {
    const context = this.sandboxes.get(pluginId);
    if (!context) {
      return { allowed: false, reason: 'Sandbox not found' };
    }

    const { config } = context;

    switch (resourceType) {
      case 'file':
        return this.checkFileAccess(config, resourcePath);
      
      case 'network':
        return this.checkNetworkAccess(config, resourcePath);
      
      case 'process':
        return this.checkProcessAccess(config);
      
      case 'env':
        return this.checkEnvAccess(config, resourcePath);
      
      default:
        return { allowed: false, reason: 'Unknown resource type' };
    }
  }

  /**
   * Check file system access
   * WARNING: Uses simple prefix matching. For production, use proper path
   * resolution with path.resolve() and path.normalize() to prevent traversal.
   */
  private checkFileAccess(
    config: SandboxConfig,
    path?: string
  ): { allowed: boolean; reason?: string } {
    if (config.level === 'none') {
      return { allowed: true };
    }

    if (!config.filesystem) {
      return { allowed: false, reason: 'File system access not configured' };
    }

    // If no path specified, check general access
    if (!path) {
      return { allowed: config.filesystem.mode !== 'none' };
    }

    // TODO: Use path.resolve() and path.normalize() for production
    // Check allowed paths
    const allowedPaths = config.filesystem.allowedPaths || [];
    const isAllowed = allowedPaths.some(allowed => {
      // Simple prefix matching - vulnerable to traversal attacks
      // TODO: Use proper path resolution
      return path.startsWith(allowed);
    });

    if (allowedPaths.length > 0 && !isAllowed) {
      return { 
        allowed: false, 
        reason: `Path not in allowed list: ${path}` 
      };
    }

    // Check denied paths
    const deniedPaths = config.filesystem.deniedPaths || [];
    const isDenied = deniedPaths.some(denied => {
      return path.startsWith(denied);
    });

    if (isDenied) {
      return { 
        allowed: false, 
        reason: `Path is explicitly denied: ${path}` 
      };
    }

    return { allowed: true };
  }

  /**
   * Check network access
   * WARNING: Uses simple string matching. For production, use proper URL
   * parsing with new URL() and check hostname property.
   */
  private checkNetworkAccess(
    config: SandboxConfig,
    url?: string
  ): { allowed: boolean; reason?: string } {
    if (config.level === 'none') {
      return { allowed: true };
    }

    if (!config.network) {
      return { allowed: false, reason: 'Network access not configured' };
    }

    // Check if network access is enabled
    if (config.network.mode === 'none') {
      return { allowed: false, reason: 'Network access disabled' };
    }

    // If no URL specified, check general access
    if (!url) {
      return { allowed: (config.network.mode as string) !== 'none' };
    }

    // TODO: Use new URL() and check hostname property for production
    // Check allowed hosts
    const allowedHosts = config.network.allowedHosts || [];
    if (allowedHosts.length > 0) {
      const isAllowed = allowedHosts.some(host => {
        // Simple string matching - vulnerable to bypass
        // TODO: Use proper URL parsing
        return url.includes(host);
      });

      if (!isAllowed) {
        return { 
          allowed: false, 
          reason: `Host not in allowed list: ${url}` 
        };
      }
    }

    // Check denied hosts
    const deniedHosts = config.network.deniedHosts || [];
    const isDenied = deniedHosts.some(host => {
      return url.includes(host);
    });

    if (isDenied) {
      return { 
        allowed: false, 
        reason: `Host is blocked: ${url}` 
      };
    }

    return { allowed: true };
  }

  /**
   * Check process spawning access
   */
  private checkProcessAccess(
    config: SandboxConfig
  ): { allowed: boolean; reason?: string } {
    if (config.level === 'none') {
      return { allowed: true };
    }

    if (!config.process) {
      return { allowed: false, reason: 'Process access not configured' };
    }

    if (!config.process.allowSpawn) {
      return { allowed: false, reason: 'Process spawning not allowed' };
    }

    return { allowed: true };
  }

  /**
   * Check environment variable access
   */
  private checkEnvAccess(
    config: SandboxConfig,
    varName?: string
  ): { allowed: boolean; reason?: string } {
    if (config.level === 'none') {
      return { allowed: true };
    }

    if (!config.process) {
      return { allowed: false, reason: 'Environment access not configured' };
    }

    // If no variable specified, check general access
    if (!varName) {
      return { allowed: true };
    }

    // For now, allow all env access if process is configured
    // In a real implementation, would check specific allowed vars
    return { allowed: true };
  }

  /**
   * Check resource limits
   */
  checkResourceLimits(pluginId: string): { 
    withinLimits: boolean; 
    violations: string[] 
  } {
    const context = this.sandboxes.get(pluginId);
    if (!context) {
      return { withinLimits: true, violations: [] };
    }

    const violations: string[] = [];
    const { resourceUsage, config } = context;

    // Check memory limit
    if (config.memory?.maxHeap && 
        resourceUsage.memory.current > config.memory.maxHeap) {
      violations.push(`Memory limit exceeded: ${resourceUsage.memory.current} > ${config.memory.maxHeap}`);
    }

    // Check CPU limit (would need runtime config)
    if (config.runtime?.resourceLimits?.maxCpu && 
        resourceUsage.cpu.current > config.runtime.resourceLimits.maxCpu) {
      violations.push(`CPU limit exceeded: ${resourceUsage.cpu.current}% > ${config.runtime.resourceLimits.maxCpu}%`);
    }

    // Check connection limit
    if (config.network?.maxConnections && 
        resourceUsage.connections.current > config.network.maxConnections) {
      violations.push(`Connection limit exceeded: ${resourceUsage.connections.current} > ${config.network.maxConnections}`);
    }

    return {
      withinLimits: violations.length === 0,
      violations,
    };
  }

  /**
   * Get resource usage for a plugin
   */
  getResourceUsage(pluginId: string): ResourceUsage | undefined {
    const context = this.sandboxes.get(pluginId);
    return context?.resourceUsage;
  }

  /**
   * Start monitoring resource usage
   */
  private startResourceMonitoring(pluginId: string): void {
    // Monitor every 5 seconds
    const interval = setInterval(() => {
      this.updateResourceUsage(pluginId);
    }, 5000);

    this.monitoringIntervals.set(pluginId, interval);
  }

  /**
   * Stop monitoring resource usage
   */
  private stopResourceMonitoring(pluginId: string): void {
    const interval = this.monitoringIntervals.get(pluginId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(pluginId);
    }
  }

  /**
   * Update resource usage statistics
   * 
   * NOTE: Currently uses global process.memoryUsage() which tracks the entire
   * Node.js process, not individual plugins. For production, implement proper
   * per-plugin tracking using V8 heap snapshots or allocation tracking at
   * plugin boundaries.
   */
  private updateResourceUsage(pluginId: string): void {
    const context = this.sandboxes.get(pluginId);
    if (!context) {
      return;
    }

    // In a real implementation, this would collect actual metrics
    // For now, this is a placeholder structure
    
    // Update memory usage (global process memory - not per-plugin)
    // TODO: Implement per-plugin memory tracking
    const memoryUsage = getMemoryUsage();
    context.resourceUsage.memory.current = memoryUsage.heapUsed;
    context.resourceUsage.memory.peak = Math.max(
      context.resourceUsage.memory.peak,
      memoryUsage.heapUsed
    );

    // Update CPU usage (would use process.cpuUsage() or similar)
    // This is a placeholder - real implementation would track per-plugin CPU
    // TODO: Implement per-plugin CPU tracking
    context.resourceUsage.cpu.current = 0;

    // Check for violations
    const { withinLimits, violations } = this.checkResourceLimits(pluginId);
    if (!withinLimits) {
      this.logger.warn('Resource limit violations detected', { 
        pluginId, 
        violations 
      });
    }
  }

  /**
   * Get all active sandboxes
   */
  getAllSandboxes(): Map<string, SandboxContext> {
    return new Map(this.sandboxes);
  }

  /**
   * Shutdown sandbox runtime
   */
  shutdown(): void {
    // Stop all monitoring
    for (const pluginId of this.monitoringIntervals.keys()) {
      this.stopResourceMonitoring(pluginId);
    }

    this.sandboxes.clear();
    
    this.logger.info('Sandbox runtime shutdown complete');
  }
}
