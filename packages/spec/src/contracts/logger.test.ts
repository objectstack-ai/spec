import { describe, it, expect } from 'vitest';
import type { Logger } from './logger';

describe('Logger Contract', () => {
  it('should allow a minimal Logger implementation with required methods', () => {
    const logger: Logger = {
      debug: (_message: string, _meta?: Record<string, any>) => {},
      info: (_message: string, _meta?: Record<string, any>) => {},
      warn: (_message: string, _meta?: Record<string, any>) => {},
      error: (_message: string, _error?: Error, _meta?: Record<string, any>) => {},
    };

    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should allow a full Logger implementation with all optional methods', () => {
    const logger: Logger = {
      debug: (_message: string) => {},
      info: (_message: string) => {},
      warn: (_message: string) => {},
      error: (_message: string) => {},
      fatal: (_message: string, _error?: Error) => {},
      child: (context: Record<string, any>) => ({
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      }),
      withTrace: (traceId: string, _spanId?: string) => ({
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      }),
      log: (_message: string, ..._args: any[]) => {},
      destroy: async () => {},
    };

    expect(logger.fatal).toBeDefined();
    expect(logger.child).toBeDefined();
    expect(logger.withTrace).toBeDefined();
    expect(logger.log).toBeDefined();
    expect(logger.destroy).toBeDefined();
  });

  it('should call debug/info/warn/error with message and meta', () => {
    const calls: string[] = [];
    const logger: Logger = {
      debug: (msg) => calls.push(`debug:${msg}`),
      info: (msg) => calls.push(`info:${msg}`),
      warn: (msg) => calls.push(`warn:${msg}`),
      error: (msg) => calls.push(`error:${msg}`),
    };

    logger.debug('debug message', { key: 'value' });
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message', new Error('test'));

    expect(calls).toEqual([
      'debug:debug message',
      'info:info message',
      'warn:warn message',
      'error:error message',
    ]);
  });

  it('should return a Logger from child()', () => {
    const logger: Logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      child: (_context) => ({
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      }),
    };

    const child = logger.child!({ service: 'auth' });
    expect(typeof child.debug).toBe('function');
    expect(typeof child.info).toBe('function');
  });

  it('should return a Logger from withTrace()', () => {
    const logger: Logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      withTrace: (_traceId, _spanId) => ({
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      }),
    };

    const traced = logger.withTrace!('trace-123', 'span-456');
    expect(typeof traced.warn).toBe('function');
  });
});
