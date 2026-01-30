import { describe, it, expect } from 'vitest';
import {
  LogLevel,
  ExtendedLogLevel,
  LogDestinationType,
  ConsoleDestinationConfigSchema,
  FileDestinationConfigSchema,
  HttpDestinationConfigSchema,
  ExternalServiceDestinationConfigSchema,
  LogDestinationSchema,
  LogEnrichmentConfigSchema,
  StructuredLogEntrySchema,
  LoggingConfigSchema,
  type LogDestination,
  type StructuredLogEntry,
  type LoggingConfig,
} from './logging.zod';

describe('ExtendedLogLevel', () => {
  it('should accept valid log levels', () => {
    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    
    levels.forEach((level) => {
      expect(() => ExtendedLogLevel.parse(level)).not.toThrow();
    });
  });

  it('should reject invalid log levels', () => {
    expect(() => ExtendedLogLevel.parse('invalid')).toThrow();
  });
});

describe('LogDestinationType', () => {
  it('should accept valid destination types', () => {
    const types = [
      'console', 'file', 'syslog', 'elasticsearch', 'cloudwatch',
      'stackdriver', 'azure_monitor', 'datadog', 'splunk', 'loki',
      'http', 'kafka', 'redis', 'custom',
    ];
    
    types.forEach((type) => {
      expect(() => LogDestinationType.parse(type)).not.toThrow();
    });
  });
});

describe('ConsoleDestinationConfigSchema', () => {
  it('should apply defaults', () => {
    const config = ConsoleDestinationConfigSchema.parse({});
    
    expect(config.stream).toBe('stdout');
    expect(config.colors).toBe(true);
    expect(config.prettyPrint).toBe(false);
  });

  it('should accept custom values', () => {
    const config = ConsoleDestinationConfigSchema.parse({
      stream: 'stderr',
      colors: false,
      prettyPrint: true,
    });
    
    expect(config.stream).toBe('stderr');
    expect(config.colors).toBe(false);
    expect(config.prettyPrint).toBe(true);
  });
});

describe('FileDestinationConfigSchema', () => {
  it('should accept valid file configuration', () => {
    const config = FileDestinationConfigSchema.parse({
      path: '/var/log/app.log',
    });
    
    expect(config.path).toBe('/var/log/app.log');
    expect(config.encoding).toBe('utf8');
    expect(config.append).toBe(true);
  });

  it('should accept rotation configuration', () => {
    const config = FileDestinationConfigSchema.parse({
      path: '/var/log/app.log',
      rotation: {
        maxSize: '50m',
        maxFiles: 10,
        compress: true,
        interval: 'daily',
      },
    });
    
    expect(config.rotation?.maxSize).toBe('50m');
    expect(config.rotation?.maxFiles).toBe(10);
    expect(config.rotation?.compress).toBe(true);
  });
});

describe('HttpDestinationConfigSchema', () => {
  it('should accept valid HTTP configuration', () => {
    const config = HttpDestinationConfigSchema.parse({
      url: 'https://logs.example.com/v1/logs',
    });
    
    expect(config.url).toBe('https://logs.example.com/v1/logs');
    expect(config.method).toBe('POST');
    expect(config.timeout).toBe(30000);
  });

  it('should accept authentication', () => {
    const config = HttpDestinationConfigSchema.parse({
      url: 'https://logs.example.com/v1/logs',
      auth: {
        type: 'bearer',
        token: 'secret-token',
      },
    });
    
    expect(config.auth?.type).toBe('bearer');
    expect(config.auth?.token).toBe('secret-token');
  });

  it('should accept batch configuration', () => {
    const config = HttpDestinationConfigSchema.parse({
      url: 'https://logs.example.com/v1/logs',
      batch: {
        maxSize: 500,
        flushInterval: 10000,
      },
    });
    
    expect(config.batch?.maxSize).toBe(500);
    expect(config.batch?.flushInterval).toBe(10000);
  });
});

describe('LogDestinationSchema', () => {
  it('should accept valid console destination', () => {
    const destination: LogDestination = {
      name: 'console_output',
      type: 'console',
      console: {
        stream: 'stdout',
      },
    };
    
    expect(() => LogDestinationSchema.parse(destination)).not.toThrow();
  });

  it('should accept valid file destination', () => {
    const destination: LogDestination = {
      name: 'file_output',
      type: 'file',
      file: {
        path: '/var/log/app.log',
      },
    };
    
    expect(() => LogDestinationSchema.parse(destination)).not.toThrow();
  });

  it('should apply defaults', () => {
    const destination = LogDestinationSchema.parse({
      name: 'test_dest',
      type: 'console',
    });
    
    expect(destination.level).toBe('info');
    expect(destination.enabled).toBe(true);
    expect(destination.format).toBe('json');
  });

  it('should enforce snake_case naming', () => {
    expect(() => LogDestinationSchema.parse({
      name: 'camelCase',
      type: 'console',
    })).toThrow();

    expect(() => LogDestinationSchema.parse({
      name: 'kebab-case',
      type: 'console',
    })).toThrow();
  });
});

describe('LogEnrichmentConfigSchema', () => {
  it('should apply defaults', () => {
    const config = LogEnrichmentConfigSchema.parse({});
    
    expect(config.addHostname).toBe(true);
    expect(config.addProcessId).toBe(true);
    expect(config.addEnvironment).toBe(true);
    expect(config.addCaller).toBe(false);
    expect(config.addCorrelationIds).toBe(true);
  });

  it('should accept static fields', () => {
    const config = LogEnrichmentConfigSchema.parse({
      staticFields: {
        application: 'my-app',
        version: '1.0.0',
      },
    });
    
    expect(config.staticFields?.application).toBe('my-app');
    expect(config.staticFields?.version).toBe('1.0.0');
  });
});

describe('StructuredLogEntrySchema', () => {
  it('should accept minimal log entry', () => {
    const entry: StructuredLogEntry = {
      timestamp: '2024-01-15T10:30:00.000Z',
      level: 'info',
      message: 'Application started',
    };
    
    expect(() => StructuredLogEntrySchema.parse(entry)).not.toThrow();
  });

  it('should accept full log entry with all fields', () => {
    const entry: StructuredLogEntry = {
      timestamp: '2024-01-15T10:30:00.000Z',
      level: 'error',
      message: 'Database connection failed',
      context: { database: 'postgres', attempt: 3 },
      error: {
        name: 'ConnectionError',
        message: 'Connection timeout',
        stack: 'Error: ...',
      },
      trace: {
        traceId: 'abc123',
        spanId: 'def456',
      },
      source: {
        service: 'api-server',
        component: 'database-pool',
        file: 'db.ts',
        line: 42,
      },
      host: {
        hostname: 'server-01',
        pid: 1234,
      },
      environment: 'production',
      user: {
        id: 'user-123',
        username: 'john',
      },
    };
    
    expect(() => StructuredLogEntrySchema.parse(entry)).not.toThrow();
  });
});

describe('LoggingConfigSchema', () => {
  it('should accept minimal configuration', () => {
    const config: LoggingConfig = {
      name: 'default_logging',
      label: 'Default Logging',
      destinations: [
        {
          name: 'console',
          type: 'console',
        },
      ],
    };
    
    expect(() => LoggingConfigSchema.parse(config)).not.toThrow();
  });

  it('should apply defaults', () => {
    const config = LoggingConfigSchema.parse({
      name: 'test_logging',
      label: 'Test Logging',
      destinations: [],
    });
    
    expect(config.enabled).toBe(true);
    expect(config.level).toBe('info');
    expect(config.redact).toContain('password');
    expect(config.redact).toContain('apiKey');
  });

  it('should accept full configuration', () => {
    const config: LoggingConfig = {
      name: 'production_logging',
      label: 'Production Logging',
      enabled: true,
      level: 'warn',
      destinations: [
        {
          name: 'console_dest',
          type: 'console',
          level: 'info',
        },
        {
          name: 'file_dest',
          type: 'file',
          file: {
            path: '/var/log/app.log',
            rotation: {
              maxSize: '100m',
              maxFiles: 7,
            },
          },
        },
      ],
      enrichment: {
        staticFields: { app: 'my-app' },
        addHostname: true,
      },
      sampling: {
        enabled: true,
        rate: 0.8,
      },
      buffer: {
        enabled: true,
        size: 5000,
        flushInterval: 2000,
      },
    };
    
    expect(() => LoggingConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce snake_case naming', () => {
    expect(() => LoggingConfigSchema.parse({
      name: 'CamelCase',
      label: 'Test',
      destinations: [],
    })).toThrow();
  });

  it('should enforce max length for name', () => {
    const longName = 'a'.repeat(65);
    expect(() => LoggingConfigSchema.parse({
      name: longName,
      label: 'Test',
      destinations: [],
    })).toThrow();
  });
});
