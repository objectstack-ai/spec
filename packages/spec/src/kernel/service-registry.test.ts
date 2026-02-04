import { describe, it, expect } from 'vitest';
import {
  ServiceScopeType,
  ServiceMetadataSchema,
  ServiceRegistryConfigSchema,
  ServiceFactoryRegistrationSchema,
  ScopeConfigSchema,
  ScopeInfoSchema,
} from './service-registry.zod';

describe('Service Registry Protocol', () => {
  describe('ServiceScopeType', () => {
    it('should validate valid scope types', () => {
      expect(ServiceScopeType.safeParse('singleton').success).toBe(true);
      expect(ServiceScopeType.safeParse('transient').success).toBe(true);
      expect(ServiceScopeType.safeParse('scoped').success).toBe(true);
    });

    it('should reject invalid scope types', () => {
      expect(ServiceScopeType.safeParse('invalid').success).toBe(false);
    });
  });

  describe('ServiceMetadataSchema', () => {
    it('should validate minimal service metadata', () => {
      const metadata = {
        name: 'database',
      };

      const result = ServiceMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.scope).toBe('singleton'); // default value
      }
    });

    it('should validate full service metadata', () => {
      const metadata = {
        name: 'database',
        scope: 'singleton' as const,
        type: 'IDataEngine',
        registeredAt: Date.now(),
        metadata: {
          driver: 'postgres',
          version: '14.1',
        },
      };

      const result = ServiceMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const metadata = {
        name: '',
      };

      const result = ServiceMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });

  describe('ServiceRegistryConfigSchema', () => {
    it('should apply default values', () => {
      const config = {};

      const result = ServiceRegistryConfigSchema.parse(config);
      expect(result.strictMode).toBe(true);
      expect(result.allowOverwrite).toBe(false);
      expect(result.enableLogging).toBe(false);
    });

    it('should validate custom configuration', () => {
      const config = {
        strictMode: false,
        allowOverwrite: true,
        enableLogging: true,
        scopeTypes: ['singleton', 'transient', 'request', 'session'],
        maxServices: 1000,
      };

      const result = ServiceRegistryConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid maxServices', () => {
      const config = {
        maxServices: 0,
      };

      const result = ServiceRegistryConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('ServiceFactoryRegistrationSchema', () => {
    it('should validate minimal factory registration', () => {
      const registration = {
        name: 'logger',
      };

      const result = ServiceFactoryRegistrationSchema.safeParse(registration);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.scope).toBe('singleton');
        expect(result.data.factoryType).toBe('sync');
        expect(result.data.singleton).toBe(true);
      }
    });

    it('should validate full factory registration', () => {
      const registration = {
        name: 'logger',
        scope: 'transient' as const,
        factoryType: 'async' as const,
        singleton: false,
      };

      const result = ServiceFactoryRegistrationSchema.safeParse(registration);
      expect(result.success).toBe(true);
    });
  });

  describe('ScopeConfigSchema', () => {
    it('should validate scope configuration', () => {
      const config = {
        scopeType: 'request',
        scopeId: 'req-12345',
        metadata: {
          userId: 'user-123',
          requestId: 'req-12345',
        },
      };

      const result = ScopeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate minimal scope config', () => {
      const config = {
        scopeType: 'session',
      };

      const result = ScopeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('ScopeInfoSchema', () => {
    it('should validate scope info', () => {
      const info = {
        scopeId: 'req-12345',
        scopeType: 'request',
        createdAt: Date.now(),
        serviceCount: 5,
        metadata: {
          userId: 'user-123',
        },
      };

      const result = ScopeInfoSchema.safeParse(info);
      expect(result.success).toBe(true);
    });

    it('should validate minimal scope info', () => {
      const info = {
        scopeId: 'req-12345',
        scopeType: 'request',
        createdAt: Date.now(),
      };

      const result = ScopeInfoSchema.safeParse(info);
      expect(result.success).toBe(true);
    });

    it('should reject negative service count', () => {
      const info = {
        scopeId: 'req-12345',
        scopeType: 'request',
        createdAt: Date.now(),
        serviceCount: -1,
      };

      const result = ScopeInfoSchema.safeParse(info);
      expect(result.success).toBe(false);
    });
  });
});
