import { describe, it, expect, beforeEach } from 'vitest';
import { PluginPermissionEnforcer, SecurePluginContext } from './plugin-permission-enforcer.js';
import { createLogger } from '../logger.js';
import type { PluginCapability } from '@objectstack/spec/kernel';
import type { PluginContext } from '../types.js';

describe('PluginPermissionEnforcer', () => {
  let enforcer: PluginPermissionEnforcer;
  let logger: ReturnType<typeof createLogger>;
  
  beforeEach(() => {
    logger = createLogger({ level: 'error' });
    enforcer = new PluginPermissionEnforcer(logger);
  });
  
  describe('registerPluginPermissions', () => {
    it('should register plugin capabilities', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.database.v1',
            label: 'Database Service',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      const registeredCapabilities = enforcer.getPluginCapabilities('com.test.plugin');
      expect(registeredCapabilities).toEqual(capabilities);
    });
  });
  
  describe('enforceServiceAccess', () => {
    it('should allow access to declared services', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.database.v1',
            label: 'Database Service',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      // Should not throw
      expect(() => {
        enforcer.enforceServiceAccess('com.test.plugin', 'database');
      }).not.toThrow();
    });
    
    it('should deny access to undeclared services', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.database.v1',
            label: 'Database Service',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      expect(() => {
        enforcer.enforceServiceAccess('com.test.plugin', 'network');
      }).toThrow(/Permission denied/);
    });
    
    it('should allow wildcard service access', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.all.v1',
            label: 'All Services',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      // Should allow any service
      expect(() => {
        enforcer.enforceServiceAccess('com.test.plugin', 'database');
        enforcer.enforceServiceAccess('com.test.plugin', 'network');
        enforcer.enforceServiceAccess('com.test.plugin', 'filesystem');
      }).not.toThrow();
    });
  });
  
  describe('enforceHookTrigger', () => {
    it('should allow triggering declared hooks', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.hook.data.v1',
            label: 'Data Hooks',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      expect(() => {
        enforcer.enforceHookTrigger('com.test.plugin', 'data:beforeCreate');
      }).not.toThrow();
    });
    
    it('should deny triggering undeclared hooks', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.hook.data.v1',
            label: 'Data Hooks',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      expect(() => {
        enforcer.enforceHookTrigger('com.test.plugin', 'kernel:shutdown');
      }).toThrow(/Permission denied/);
    });
  });
  
  describe('revokePermissions', () => {
    it('should revoke plugin permissions', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.database.v1',
            label: 'Database Service',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      enforcer.revokePermissions('com.test.plugin');
      
      expect(() => {
        enforcer.enforceServiceAccess('com.test.plugin', 'database');
      }).toThrow(/Permission denied/);
    });
  });
});

describe('SecurePluginContext', () => {
  let enforcer: PluginPermissionEnforcer;
  let logger: ReturnType<typeof createLogger>;
  let mockBaseContext: PluginContext;
  
  beforeEach(() => {
    logger = createLogger({ level: 'error' });
    enforcer = new PluginPermissionEnforcer(logger);
    
    mockBaseContext = {
      registerService: () => {},
      getService: <T>(name: string): T => ({ name } as any),
      getServices: () => new Map(),
      hook: () => {},
      trigger: async () => {},
      logger,
      getKernel: () => ({} as any),
    };
  });
  
  describe('getService', () => {
    it('should check permission before accessing service', () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.service.database.v1',
            label: 'Database Service',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      const secureContext = new SecurePluginContext(
        'com.test.plugin',
        enforcer,
        mockBaseContext
      );
      
      // Should succeed with permission
      const service = secureContext.getService('database');
      expect(service).toBeDefined();
      
      // Should fail without permission
      expect(() => {
        secureContext.getService('network');
      }).toThrow(/Permission denied/);
    });
  });
  
  describe('trigger', () => {
    it('should check permission before triggering hook', async () => {
      const capabilities: PluginCapability[] = [
        {
          protocol: {
            id: 'com.objectstack.protocol.hook.data.v1',
            label: 'Data Hooks',
            version: { major: 1, minor: 0, patch: 0 },
          },
          conformance: 'full',
          certified: false,
        },
      ];
      
      enforcer.registerPluginPermissions('com.test.plugin', capabilities);
      
      const secureContext = new SecurePluginContext(
        'com.test.plugin',
        enforcer,
        mockBaseContext
      );
      
      // Should succeed with permission
      await expect(secureContext.trigger('data:beforeCreate')).resolves.not.toThrow();
      
      // Should fail without permission
      await expect(secureContext.trigger('kernel:shutdown')).rejects.toThrow(/Permission denied/);
    });
  });
});
