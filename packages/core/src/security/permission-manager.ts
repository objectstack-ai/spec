import type { 
  Permission,
  PermissionSet,
  PermissionAction,
  ResourceType
} from '@objectstack/spec/system';
import type { ObjectLogger } from '../logger.js';

/**
 * Permission Grant
 * Represents a granted permission at runtime
 */
export interface PermissionGrant {
  permissionId: string;
  pluginId: string;
  grantedAt: Date;
  grantedBy?: string;
  expiresAt?: Date;
  conditions?: Record<string, any>;
}

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPermission?: string;
  grantedPermissions?: string[];
}

/**
 * Plugin Permission Manager
 * 
 * Manages fine-grained permissions for plugin security and access control
 */
export class PluginPermissionManager {
  private logger: ObjectLogger;
  
  // Plugin permission definitions
  private permissionSets = new Map<string, PermissionSet>();
  
  // Granted permissions (pluginId -> Set of permission IDs)
  private grants = new Map<string, Set<string>>();
  
  // Permission grant details
  private grantDetails = new Map<string, PermissionGrant>();

  constructor(logger: ObjectLogger) {
    this.logger = logger.child({ component: 'PermissionManager' });
  }

  /**
   * Register permission requirements for a plugin
   */
  registerPermissions(pluginId: string, permissionSet: PermissionSet): void {
    this.permissionSets.set(pluginId, permissionSet);
    
    this.logger.info('Permissions registered for plugin', { 
      pluginId,
      permissionCount: permissionSet.permissions.length
    });
  }

  /**
   * Grant a permission to a plugin
   */
  grantPermission(
    pluginId: string,
    permissionId: string,
    grantedBy?: string,
    expiresAt?: Date
  ): void {
    // Verify permission exists in plugin's declared permissions
    const permissionSet = this.permissionSets.get(pluginId);
    if (!permissionSet) {
      throw new Error(`No permissions registered for plugin: ${pluginId}`);
    }

    const permission = permissionSet.permissions.find(p => p.id === permissionId);
    if (!permission) {
      throw new Error(`Permission ${permissionId} not declared by plugin ${pluginId}`);
    }

    // Create grant
    if (!this.grants.has(pluginId)) {
      this.grants.set(pluginId, new Set());
    }
    this.grants.get(pluginId)!.add(permissionId);

    // Store grant details
    const grantKey = `${pluginId}:${permissionId}`;
    this.grantDetails.set(grantKey, {
      permissionId,
      pluginId,
      grantedAt: new Date(),
      grantedBy,
      expiresAt,
    });

    this.logger.info('Permission granted', { 
      pluginId, 
      permissionId,
      grantedBy 
    });
  }

  /**
   * Revoke a permission from a plugin
   */
  revokePermission(pluginId: string, permissionId: string): void {
    const grants = this.grants.get(pluginId);
    if (grants) {
      grants.delete(permissionId);
      
      const grantKey = `${pluginId}:${permissionId}`;
      this.grantDetails.delete(grantKey);

      this.logger.info('Permission revoked', { pluginId, permissionId });
    }
  }

  /**
   * Grant all permissions for a plugin
   */
  grantAllPermissions(pluginId: string, grantedBy?: string): void {
    const permissionSet = this.permissionSets.get(pluginId);
    if (!permissionSet) {
      throw new Error(`No permissions registered for plugin: ${pluginId}`);
    }

    for (const permission of permissionSet.permissions) {
      this.grantPermission(pluginId, permission.id, grantedBy);
    }

    this.logger.info('All permissions granted', { pluginId, grantedBy });
  }

  /**
   * Check if a plugin has a specific permission
   */
  hasPermission(pluginId: string, permissionId: string): boolean {
    const grants = this.grants.get(pluginId);
    if (!grants) {
      return false;
    }

    // Check if granted
    if (!grants.has(permissionId)) {
      return false;
    }

    // Check expiration
    const grantKey = `${pluginId}:${permissionId}`;
    const grantDetails = this.grantDetails.get(grantKey);
    if (grantDetails?.expiresAt && grantDetails.expiresAt < new Date()) {
      this.revokePermission(pluginId, permissionId);
      return false;
    }

    return true;
  }

  /**
   * Check if plugin can perform an action on a resource
   */
  checkAccess(
    pluginId: string,
    resource: ResourceType,
    action: PermissionAction,
    resourceId?: string
  ): PermissionCheckResult {
    const permissionSet = this.permissionSets.get(pluginId);
    if (!permissionSet) {
      return {
        allowed: false,
        reason: 'No permissions registered for plugin',
      };
    }

    // Find matching permissions
    const matchingPermissions = permissionSet.permissions.filter(p => {
      // Check resource type
      if (p.resource !== resource) {
        return false;
      }

      // Check action
      if (!p.actions.includes(action)) {
        return false;
      }

      // Check resource filter if specified
      if (resourceId && p.filter?.resourceIds) {
        if (!p.filter.resourceIds.includes(resourceId)) {
          return false;
        }
      }

      return true;
    });

    if (matchingPermissions.length === 0) {
      return {
        allowed: false,
        reason: `No permission found for ${action} on ${resource}`,
      };
    }

    // Check if any matching permission is granted
    const grantedPermissions = matchingPermissions.filter(p => 
      this.hasPermission(pluginId, p.id)
    );

    if (grantedPermissions.length === 0) {
      return {
        allowed: false,
        reason: 'Required permissions not granted',
        requiredPermission: matchingPermissions[0].id,
      };
    }

    return {
      allowed: true,
      grantedPermissions: grantedPermissions.map(p => p.id),
    };
  }

  /**
   * Get all permissions for a plugin
   */
  getPluginPermissions(pluginId: string): Permission[] {
    const permissionSet = this.permissionSets.get(pluginId);
    return permissionSet?.permissions || [];
  }

  /**
   * Get granted permissions for a plugin
   */
  getGrantedPermissions(pluginId: string): string[] {
    const grants = this.grants.get(pluginId);
    return grants ? Array.from(grants) : [];
  }

  /**
   * Get required but not granted permissions
   */
  getMissingPermissions(pluginId: string): Permission[] {
    const permissionSet = this.permissionSets.get(pluginId);
    if (!permissionSet) {
      return [];
    }

    const granted = this.grants.get(pluginId) || new Set();
    
    return permissionSet.permissions.filter(p => 
      p.required && !granted.has(p.id)
    );
  }

  /**
   * Check if all required permissions are granted
   */
  hasAllRequiredPermissions(pluginId: string): boolean {
    return this.getMissingPermissions(pluginId).length === 0;
  }

  /**
   * Get permission grant details
   */
  getGrantDetails(pluginId: string, permissionId: string): PermissionGrant | undefined {
    const grantKey = `${pluginId}:${permissionId}`;
    return this.grantDetails.get(grantKey);
  }

  /**
   * Validate permission against scope constraints
   */
  validatePermissionScope(
    permission: Permission,
    context: {
      tenantId?: string;
      userId?: string;
      resourceId?: string;
    }
  ): boolean {
    switch (permission.scope) {
      case 'global':
        return true;

      case 'tenant':
        return !!context.tenantId;

      case 'user':
        return !!context.userId;

      case 'resource':
        return !!context.resourceId;

      case 'plugin':
        return true;

      default:
        return false;
    }
  }

  /**
   * Clear all permissions for a plugin
   */
  clearPluginPermissions(pluginId: string): void {
    this.permissionSets.delete(pluginId);
    
    const grants = this.grants.get(pluginId);
    if (grants) {
      for (const permissionId of grants) {
        const grantKey = `${pluginId}:${permissionId}`;
        this.grantDetails.delete(grantKey);
      }
      this.grants.delete(pluginId);
    }

    this.logger.info('All permissions cleared', { pluginId });
  }

  /**
   * Shutdown permission manager
   */
  shutdown(): void {
    this.permissionSets.clear();
    this.grants.clear();
    this.grantDetails.clear();
    
    this.logger.info('Permission manager shutdown complete');
  }
}
