import { describe, it, expect } from 'vitest';
import {
  EventMetadataSchema,
  EventSchema,
  EventHandlerSchema,
  EventRouteSchema,
  EventPersistenceSchema,
  type Event,
  type EventHandler,
  type EventRoute,
  type EventPersistence,
} from './events.zod';

describe('EventMetadataSchema', () => {
  it('should accept valid metadata', () => {
    const metadata = {
      source: 'user.plugin',
      timestamp: '2024-01-15T10:30:00Z',
    };

    expect(() => EventMetadataSchema.parse(metadata)).not.toThrow();
  });

  it('should accept metadata with optional fields', () => {
    const metadata = {
      source: 'system.core',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user-123',
      tenantId: 'tenant-456',
    };

    const parsed = EventMetadataSchema.parse(metadata);
    expect(parsed.userId).toBe('user-123');
    expect(parsed.tenantId).toBe('tenant-456');
  });

  it('should validate datetime format', () => {
    expect(() => EventMetadataSchema.parse({
      source: 'plugin',
      timestamp: 'not-a-datetime',
    })).toThrow();

    expect(() => EventMetadataSchema.parse({
      source: 'plugin',
      timestamp: '2024-01-15T10:30:00Z',
    })).not.toThrow();
  });

  it('should reject metadata without required fields', () => {
    expect(() => EventMetadataSchema.parse({
      timestamp: '2024-01-15T10:30:00Z',
    })).toThrow();

    expect(() => EventMetadataSchema.parse({
      source: 'plugin',
    })).toThrow();
  });
});

describe('EventSchema', () => {
  it('should accept valid minimal event', () => {
    const event: Event = {
      name: 'user.created',
      payload: { id: '123', email: 'user@example.com' },
      metadata: {
        source: 'auth.plugin',
        timestamp: '2024-01-15T10:30:00Z',
      },
    };

    expect(() => EventSchema.parse(event)).not.toThrow();
  });

  it('should validate event name format (snake_case with dots)', () => {
    const validNames = [
      'user.created',
      'account.updated',
      'opportunity.stage.changed',
      'payment.webhook.received',
      'data_import.completed',
    ];

    validNames.forEach(name => {
      const event = {
        name,
        payload: {},
        metadata: {
          source: 'system',
          timestamp: '2024-01-15T10:30:00Z',
        },
      };
      expect(() => EventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid event name formats', () => {
    const invalidNames = [
      'User.Created', // PascalCase
      'user-created', // kebab-case
      'userCreated',  // camelCase
      '123.invalid',  // starts with number
      '.invalid',     // starts with dot
    ];

    invalidNames.forEach(name => {
      expect(() => EventSchema.parse({
        name,
        payload: {},
        metadata: { source: 'system', timestamp: '2024-01-15T10:30:00Z' },
      })).toThrow();
    });
  });

  it('should accept various payload types', () => {
    const payloads = [
      { id: '123', name: 'Test' },
      [1, 2, 3],
      'string payload',
      123,
      true,
      null,
    ];

    payloads.forEach(payload => {
      const event = {
        name: 'test.event',
        payload,
        metadata: { source: 'test', timestamp: '2024-01-15T10:30:00Z' },
      };
      expect(() => EventSchema.parse(event)).not.toThrow();
    });
  });

  it('should accept event with complete metadata', () => {
    const event = {
      name: 'order.completed',
      payload: { orderId: '789', total: 99.99 },
      metadata: {
        source: 'ecommerce.plugin',
        timestamp: '2024-01-15T10:30:00Z',
        userId: 'user-123',
        tenantId: 'tenant-456',
      },
    };

    const parsed = EventSchema.parse(event);
    expect(parsed.metadata.userId).toBe('user-123');
    expect(parsed.metadata.tenantId).toBe('tenant-456');
  });
});

describe('EventHandlerSchema', () => {
  it('should accept valid minimal event handler', () => {
    const handler: EventHandler = {
      eventName: 'user.created',
      handler: async () => {},
    };

    expect(() => EventHandlerSchema.parse(handler)).not.toThrow();
  });

  it('should apply default values', () => {
    const handler = EventHandlerSchema.parse({
      eventName: 'user.updated',
      handler: async () => {},
    });

    expect(handler.priority).toBe(0);
    expect(handler.async).toBe(true);
  });

  it('should accept handler with all fields', () => {
    const handler = {
      eventName: 'order.created',
      handler: async (event: Event) => {
        console.log(event.name);
      },
      priority: 10,
      async: false,
    };

    const parsed = EventHandlerSchema.parse(handler);
    expect(parsed.priority).toBe(10);
    expect(parsed.async).toBe(false);
  });

  it('should accept wildcard event patterns', () => {
    const patterns = [
      'user.*',
      '*.created',
      'account.*.*',
      '*',
    ];

    patterns.forEach(eventName => {
      const handler = {
        eventName,
        handler: async () => {},
      };
      expect(() => EventHandlerSchema.parse(handler)).not.toThrow();
    });
  });

  it('should accept different priority values', () => {
    const priorities = [-10, -1, 0, 1, 10, 100];

    priorities.forEach(priority => {
      const handler = {
        eventName: 'test.event',
        handler: async () => {},
        priority,
      };
      const parsed = EventHandlerSchema.parse(handler);
      expect(parsed.priority).toBe(priority);
    });
  });

  it('should accept async and sync handlers', () => {
    const asyncHandler = {
      eventName: 'async.event',
      handler: async () => {},
      async: true,
    };

    const syncHandler = {
      eventName: 'sync.event',
      handler: async () => {},
      async: false,
    };

    expect(() => EventHandlerSchema.parse(asyncHandler)).not.toThrow();
    expect(() => EventHandlerSchema.parse(syncHandler)).not.toThrow();
  });
});

describe('EventRouteSchema', () => {
  it('should accept valid minimal event route', () => {
    const route: EventRoute = {
      from: 'user.created',
      to: ['notification.send', 'analytics.track'],
    };

    expect(() => EventRouteSchema.parse(route)).not.toThrow();
  });

  it('should accept route with wildcard source', () => {
    const routes = [
      { from: 'user.*', to: ['audit.log'] },
      { from: '*.created', to: ['analytics.track'] },
      { from: '*', to: ['logger.log'] },
    ];

    routes.forEach(route => {
      expect(() => EventRouteSchema.parse(route)).not.toThrow();
    });
  });

  it('should accept route with transform function', () => {
    const route = {
      from: 'user.created',
      to: ['notification.send'],
      transform: (payload: any) => ({ ...payload, transformed: true }),
    };

    expect(() => EventRouteSchema.parse(route)).not.toThrow();
  });

  it('should accept multiple target events', () => {
    const route = {
      from: 'order.completed',
      to: [
        'email.send',
        'sms.send',
        'analytics.track',
        'inventory.update',
        'accounting.record',
      ],
    };

    const parsed = EventRouteSchema.parse(route);
    expect(parsed.to).toHaveLength(5);
  });

  it('should accept single target event', () => {
    const route = {
      from: 'payment.received',
      to: ['invoice.mark_paid'],
    };

    expect(() => EventRouteSchema.parse(route)).not.toThrow();
  });

  it('should reject route without required fields', () => {
    expect(() => EventRouteSchema.parse({
      to: ['target.event'],
    })).toThrow();

    expect(() => EventRouteSchema.parse({
      from: 'source.event',
    })).toThrow();
  });
});

describe('EventPersistenceSchema', () => {
  it('should accept valid minimal persistence config', () => {
    const config: EventPersistence = {
      enabled: true,
      retention: 30,
    };

    expect(() => EventPersistenceSchema.parse(config)).not.toThrow();
  });

  it('should apply default values', () => {
    const config = EventPersistenceSchema.parse({
      retention: 30,
    });

    expect(config.enabled).toBe(false);
  });

  it('should accept config with all fields', () => {
    const config = {
      enabled: true,
      retention: 90,
      filter: (event: Event) => event.name.startsWith('audit.'),
    };

    const parsed = EventPersistenceSchema.parse(config);
    expect(parsed.enabled).toBe(true);
    expect(parsed.retention).toBe(90);
    expect(parsed.filter).toBeDefined();
  });

  it('should accept different retention periods', () => {
    const retentions = [1, 7, 30, 90, 365];

    retentions.forEach(retention => {
      const config = { enabled: true, retention };
      const parsed = EventPersistenceSchema.parse(config);
      expect(parsed.retention).toBe(retention);
    });
  });

  it('should reject negative retention', () => {
    expect(() => EventPersistenceSchema.parse({
      enabled: true,
      retention: -1,
    })).toThrow();

    expect(() => EventPersistenceSchema.parse({
      enabled: true,
      retention: 0,
    })).toThrow();
  });

  it('should accept filter function', () => {
    const config = {
      enabled: true,
      retention: 60,
      filter: (event: Event) => {
        return event.name.startsWith('critical.') || 
               event.metadata.source === 'security.plugin';
      },
    };

    expect(() => EventPersistenceSchema.parse(config)).not.toThrow();
  });

  it('should handle disabled persistence', () => {
    const config = {
      enabled: false,
      retention: 30,
    };

    const parsed = EventPersistenceSchema.parse(config);
    expect(parsed.enabled).toBe(false);
  });
});

describe('Event System Integration', () => {
  it('should handle complete event lifecycle', () => {
    // Create an event
    const event: Event = {
      name: 'user.registered',
      payload: {
        userId: 'user-123',
        email: 'user@example.com',
        timestamp: Date.now(),
      },
      metadata: {
        source: 'auth.service',
        timestamp: '2024-01-15T10:30:00Z',
        userId: 'system',
      },
    };

    expect(() => EventSchema.parse(event)).not.toThrow();

    // Create handlers for the event
    const handlers: EventHandler[] = [
      {
        eventName: 'user.registered',
        handler: async () => { /* send welcome email */ },
        priority: 1,
      },
      {
        eventName: 'user.*',
        handler: async () => { /* track analytics */ },
        priority: 2,
      },
    ];

    handlers.forEach(handler => {
      expect(() => EventHandlerSchema.parse(handler)).not.toThrow();
    });

    // Create routes
    const route: EventRoute = {
      from: 'user.registered',
      to: ['email.welcome', 'analytics.track'],
    };

    expect(() => EventRouteSchema.parse(route)).not.toThrow();

    // Configure persistence
    const persistence: EventPersistence = {
      enabled: true,
      retention: 90,
      filter: (e: Event) => e.name.startsWith('user.'),
    };

    expect(() => EventPersistenceSchema.parse(persistence)).not.toThrow();
  });
});
