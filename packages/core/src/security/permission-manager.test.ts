import { describe, it, expect, beforeEach } from 'vitest';
import { PluginPermissionManager } from './permission-manager.js';
import { createLogger } from '../logger.js';
import type { PermissionSet } from '@objectstack/spec/kernel';

describe('PluginPermissionManager', () => {
  let manager: PluginPermissionManager;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({ level: 'silent' });
    manager = new PluginPermissionManager(logger);
  });

  describe('registerPermissions', () => {
    it('should register permissions for a plugin', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      
      const permissions = manager.getPluginPermissions('test-plugin');
      expect(permissions).toHaveLength(1);
      expect(permissions[0].id).toBe('read-data');
    });
  });

  describe('grantPermission', () => {
    it('should grant a permission to a plugin', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      
      expect(manager.hasPermission('test-plugin', 'read-data')).toBe(true);
    });

    it('should throw error for non-existent permission', () => {
      const permissionSet: PermissionSet = {
        permissions: [],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      
      expect(() => {
        manager.grantPermission('test-plugin', 'invalid-permission');
      }).toThrow();
    });
  });

  describe('revokePermission', () => {
    it('should revoke a permission from a plugin', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      manager.revokePermission('test-plugin', 'read-data');
      
      expect(manager.hasPermission('test-plugin', 'read-data')).toBe(false);
    });
  });

  describe('checkAccess', () => {
    it('should allow access when permission is granted', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      
      const result = manager.checkAccess('test-plugin', 'data.object', 'read');
      expect(result.allowed).toBe(true);
    });

    it('should deny access when permission is not granted', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      
      const result = manager.checkAccess('test-plugin', 'data.object', 'read');
      expect(result.allowed).toBe(false);
    });

    it('should deny access when permission does not exist', () => {
      const permissionSet: PermissionSet = {
        permissions: [],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      
      const result = manager.checkAccess('test-plugin', 'data.object', 'read');
      expect(result.allowed).toBe(false);
    });
  });

  describe('getMissingPermissions', () => {
    it('should return missing required permissions', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
          {
            id: 'write-data',
            resource: 'data.object',
            actions: ['create', 'update'],
            scope: 'plugin',
            description: 'Write object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      
      const missing = manager.getMissingPermissions('test-plugin');
      expect(missing).toHaveLength(1);
      expect(missing[0].id).toBe('write-data');
    });
  });

  describe('hasAllRequiredPermissions', () => {
    it('should return true when all required permissions are granted', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      
      expect(manager.hasAllRequiredPermissions('test-plugin')).toBe(true);
    });

    it('should return false when required permissions are missing', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      
      expect(manager.hasAllRequiredPermissions('test-plugin')).toBe(false);
    });
  });

  describe('clearPluginPermissions', () => {
    it('should clear all permissions for a plugin', () => {
      const permissionSet: PermissionSet = {
        permissions: [
          {
            id: 'read-data',
            resource: 'data.object',
            actions: ['read'],
            scope: 'plugin',
            description: 'Read object data',
            required: true,
          },
        ],
        defaultGrant: 'prompt',
      };

      manager.registerPermissions('test-plugin', permissionSet);
      manager.grantPermission('test-plugin', 'read-data');
      manager.clearPluginPermissions('test-plugin');
      
      expect(manager.getPluginPermissions('test-plugin')).toHaveLength(0);
      expect(manager.getGrantedPermissions('test-plugin')).toHaveLength(0);
    });
  });
});
