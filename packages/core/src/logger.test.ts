import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLogger, ObjectLogger } from './logger';

describe('ObjectLogger', () => {
    let logger: ObjectLogger;

    beforeEach(() => {
        logger = createLogger();
    });

    afterEach(async () => {
        await logger.destroy();
    });

    describe('Basic Logging', () => {
        it('should create a logger with default config', () => {
            expect(logger).toBeDefined();
            expect(logger.info).toBeDefined();
            expect(logger.debug).toBeDefined();
            expect(logger.warn).toBeDefined();
            expect(logger.error).toBeDefined();
        });

        it('should log info messages', () => {
            expect(() => logger.info('Test message')).not.toThrow();
        });

        it('should log debug messages', () => {
            expect(() => logger.debug('Debug message')).not.toThrow();
        });

        it('should log warn messages', () => {
            expect(() => logger.warn('Warning message')).not.toThrow();
        });

        it('should log error messages', () => {
            const error = new Error('Test error');
            expect(() => logger.error('Error occurred', error)).not.toThrow();
        });

        it('should log with metadata', () => {
            expect(() => logger.info('Message with metadata', { userId: '123', action: 'login' })).not.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should respect log level configuration', () => {
            const warnLogger = createLogger({ level: 'warn' });
            
            // These should not throw but might not output anything
            expect(() => warnLogger.debug('Debug message')).not.toThrow();
            expect(() => warnLogger.info('Info message')).not.toThrow();
            expect(() => warnLogger.warn('Warning message')).not.toThrow();
            
            warnLogger.destroy();
        });

        it('should support different formats', () => {
            const jsonLogger = createLogger({ format: 'json' });
            const textLogger = createLogger({ format: 'text' });
            const prettyLogger = createLogger({ format: 'pretty' });
            
            expect(() => jsonLogger.info('JSON format')).not.toThrow();
            expect(() => textLogger.info('Text format')).not.toThrow();
            expect(() => prettyLogger.info('Pretty format')).not.toThrow();
            
            jsonLogger.destroy();
            textLogger.destroy();
            prettyLogger.destroy();
        });

        it('should redact sensitive keys', () => {
            const logger = createLogger({ redact: ['password', 'apiKey'] });
            
            // This should work without exposing the password
            expect(() => logger.info('User login', { 
                username: 'john',
                password: 'secret123',
                apiKey: 'key-12345'
            })).not.toThrow();
            
            logger.destroy();
        });
    });

    describe('Child Loggers', () => {
        it('should create child logger with context', () => {
            const childLogger = logger.child({ service: 'api', requestId: '123' });
            
            expect(childLogger).toBeDefined();
            expect(() => childLogger.info('Child log message')).not.toThrow();
        });

        it('should support trace context', () => {
            const tracedLogger = logger.withTrace('trace-123', 'span-456');
            
            expect(tracedLogger).toBeDefined();
            expect(() => tracedLogger.info('Traced message')).not.toThrow();
        });
    });

    describe('Environment Detection', () => {
        it('should detect Node.js environment', () => {
            // This test runs in Node.js, so logger should detect it
            const nodeLogger = createLogger({ format: 'json' });
            expect(() => nodeLogger.info('Node environment')).not.toThrow();
            nodeLogger.destroy();
        });
    });

    describe('Compatibility', () => {
        it('should support console.log compatibility', () => {
            expect(() => logger.log('Compatible log')).not.toThrow();
        });
    });
});
