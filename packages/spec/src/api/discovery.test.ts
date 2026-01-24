import { describe, it, expect } from 'vitest';
import {
  DiscoverySchema,
  ApiRoutesSchema,
  ApiCapabilitiesSchema,
  type DiscoveryResponse,
  type ApiRoutes,
  type ApiCapabilities,
} from './discovery.zod';

describe('ApiCapabilitiesSchema', () => {
  it('should accept valid capabilities', () => {
    const capabilities: ApiCapabilities = {
      graphql: false,
      search: false,
      websockets: false,
      files: true,
    };

    expect(() => ApiCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should apply default values', () => {
    const capabilities = ApiCapabilitiesSchema.parse({});

    expect(capabilities.graphql).toBe(false);
    expect(capabilities.search).toBe(false);
    expect(capabilities.websockets).toBe(false);
    expect(capabilities.files).toBe(true);
  });

  it('should accept enabled features', () => {
    const capabilities = ApiCapabilitiesSchema.parse({
      graphql: true,
      search: true,
      websockets: true,
      files: true,
    });

    expect(capabilities.graphql).toBe(true);
    expect(capabilities.search).toBe(true);
  });

  it('should handle minimal capabilities', () => {
    const capabilities = ApiCapabilitiesSchema.parse({
      graphql: false,
      search: false,
      websockets: false,
      files: false,
    });

    expect(capabilities.files).toBe(false);
  });
});

describe('ApiRoutesSchema', () => {
  it('should accept valid minimal routes', () => {
    const routes: ApiRoutes = {
      data: '/api/v1/data',
      metadata: '/api/v1/meta',
      auth: '/api/v1/auth',
    };

    expect(() => ApiRoutesSchema.parse(routes)).not.toThrow();
  });

  it('should accept routes with all fields', () => {
    const routes = ApiRoutesSchema.parse({
      data: '/api/v1/data',
      metadata: '/api/v1/meta',
      auth: '/api/v1/auth',
      actions: '/api/v1/p',
      storage: '/api/v1/storage',
      graphql: '/api/v1/graphql',
    });

    expect(routes.data).toBe('/api/v1/data');
    expect(routes.graphql).toBe('/api/v1/graphql');
  });

  it('should accept custom route paths', () => {
    const routes = ApiRoutesSchema.parse({
      data: '/data',
      metadata: '/metadata',
      auth: '/auth',
    });

    expect(routes.data).toBe('/data');
  });

  it('should accept versioned routes', () => {
    const routes = ApiRoutesSchema.parse({
      data: '/api/v2/data',
      metadata: '/api/v2/meta',
      auth: '/api/v2/auth',
    });

    expect(routes.data).toBe('/api/v2/data');
  });

  it('should reject routes without required fields', () => {
    expect(() => ApiRoutesSchema.parse({
      metadata: '/api/v1/meta',
      auth: '/api/v1/auth',
    })).toThrow();

    expect(() => ApiRoutesSchema.parse({
      data: '/api/v1/data',
      auth: '/api/v1/auth',
    })).toThrow();

    expect(() => ApiRoutesSchema.parse({
      data: '/api/v1/data',
      metadata: '/api/v1/meta',
    })).toThrow();
  });
});

describe('DiscoverySchema', () => {
  it('should accept valid minimal discovery response', () => {
    const discovery: DiscoveryResponse = {
      name: 'ObjectStack',
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {
        graphql: false,
        search: false,
        websockets: false,
        files: true,
      },
      locale: {
        default: 'en-US',
        supported: ['en-US', 'zh-CN'],
        timezone: 'UTC',
      },
    };

    expect(() => DiscoverySchema.parse(discovery)).not.toThrow();
  });

  it('should accept discovery with all fields', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack Platform',
      version: '2.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
        actions: '/api/v1/p',
        storage: '/api/v1/storage',
        graphql: '/api/v1/graphql',
      },
      features: {
        graphql: true,
        search: true,
        websockets: true,
        files: true,
      },
      locale: {
        default: 'en-US',
        supported: ['en-US', 'zh-CN', 'es-ES', 'fr-FR'],
        timezone: 'America/Los_Angeles',
      },
    });

    expect(discovery.name).toBe('ObjectStack Platform');
    expect(discovery.version).toBe('2.0.0');
  });

  it('should accept different environment values', () => {
    const environments: Array<DiscoveryResponse['environment']> = ['production', 'sandbox', 'development'];

    environments.forEach(environment => {
      const discovery = DiscoverySchema.parse({
        name: 'ObjectStack',
        version: '1.0.0',
        environment,
        routes: {
          data: '/api/v1/data',
          metadata: '/api/v1/meta',
          auth: '/api/v1/auth',
        },
        features: {},
        locale: {
          default: 'en-US',
          supported: ['en-US'],
          timezone: 'UTC',
        },
      });
      expect(discovery.environment).toBe(environment);
    });
  });

  it('should reject invalid environment', () => {
    expect(() => DiscoverySchema.parse({
      name: 'ObjectStack',
      version: '1.0.0',
      environment: 'staging',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'UTC',
      },
    })).toThrow();
  });

  it('should handle production environment', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack Production',
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {
        graphql: true,
        search: true,
        websockets: true,
        files: true,
      },
      locale: {
        default: 'en-US',
        supported: ['en-US', 'zh-CN', 'es-ES'],
        timezone: 'UTC',
      },
    });

    expect(discovery.environment).toBe('production');
  });

  it('should handle sandbox environment', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack Sandbox',
      version: '1.0.0-sandbox',
      environment: 'sandbox',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'UTC',
      },
    });

    expect(discovery.environment).toBe('sandbox');
  });

  it('should handle development environment', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack Dev',
      version: '0.1.0-dev',
      environment: 'development',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'America/Los_Angeles',
      },
    });

    expect(discovery.environment).toBe('development');
  });

  it('should handle locale configuration', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack',
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'zh-CN',
        supported: ['en-US', 'zh-CN', 'ja-JP'],
        timezone: 'Asia/Shanghai',
      },
    });

    expect(discovery.locale.default).toBe('zh-CN');
    expect(discovery.locale.supported).toHaveLength(3);
    expect(discovery.locale.timezone).toBe('Asia/Shanghai');
  });

  it('should handle timezone configuration', () => {
    const timezones = [
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
    ];

    timezones.forEach(timezone => {
      const discovery = DiscoverySchema.parse({
        name: 'ObjectStack',
        version: '1.0.0',
        environment: 'production',
        routes: {
          data: '/api/v1/data',
          metadata: '/api/v1/meta',
          auth: '/api/v1/auth',
        },
        features: {},
        locale: {
          default: 'en-US',
          supported: ['en-US'],
          timezone,
        },
      });
      expect(discovery.locale.timezone).toBe(timezone);
    });
  });

  it('should handle multiple supported locales', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack',
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: [
          'en-US',
          'en-GB',
          'zh-CN',
          'zh-TW',
          'es-ES',
          'es-MX',
          'fr-FR',
          'de-DE',
          'ja-JP',
          'ko-KR',
        ],
        timezone: 'UTC',
      },
    });

    expect(discovery.locale.supported).toHaveLength(10);
  });

  it('should handle GraphQL-enabled instance', () => {
    const discovery = DiscoverySchema.parse({
      name: 'ObjectStack',
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
        graphql: '/api/v1/graphql',
      },
      features: {
        graphql: true,
        search: true,
        websockets: false,
        files: true,
      },
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'UTC',
      },
    });

    expect(discovery.features.graphql).toBe(true);
    expect(discovery.routes.graphql).toBe('/api/v1/graphql');
  });

  it('should reject discovery without required fields', () => {
    expect(() => DiscoverySchema.parse({
      version: '1.0.0',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'UTC',
      },
    })).toThrow();

    expect(() => DiscoverySchema.parse({
      name: 'ObjectStack',
      environment: 'production',
      routes: {
        data: '/api/v1/data',
        metadata: '/api/v1/meta',
        auth: '/api/v1/auth',
      },
      features: {},
      locale: {
        default: 'en-US',
        supported: ['en-US'],
        timezone: 'UTC',
      },
    })).toThrow();
  });
});
