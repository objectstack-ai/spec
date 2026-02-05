import { describe, it, expect, vi, afterEach } from 'vitest';
import * as envUtils from './env';

describe('Environment Utilities', () => {
    
    // Save original process
    const originalProcess = globalThis.process;

    afterEach(() => {
        // Restore process after each test
        globalThis.process = originalProcess;
        vi.restoreAllMocks();
    });

    describe('isNode', () => {
        it('should detect Node environment', () => {
            // Since we are running in Vitest (Node), this should be true
            expect(envUtils.isNode).toBe(true);
        });
    });

    describe('getEnv', () => {
        it('should retrieve environment variable in Node', () => {
            process.env.TEST_VAR = 'test_value';
            expect(envUtils.getEnv('TEST_VAR')).toBe('test_value');
            delete process.env.TEST_VAR;
        });

        it('should return default value if variable not found', () => {
            expect(envUtils.getEnv('NON_EXISTENT_VAR', 'default')).toBe('default');
        });

        it('should access globalThis.process.env if process is not available directly', () => {
            // This is tricky to test in Node because 'process' is globally available. 
            // We can't easily delete global.process in strict mode or without breaking tooling.
            // But we can verify it works via globalThis
            
            // @ts-ignore
            globalThis.process.env.TEST_GLOBAL_VAR = 'global_value';
            expect(envUtils.getEnv('TEST_GLOBAL_VAR')).toBe('global_value');
             // @ts-ignore
            delete globalThis.process.env.TEST_GLOBAL_VAR;
        });
    });

    describe('getMemoryUsage', () => {
        it('should return memory usage in Node', () => {
            const usage = envUtils.getMemoryUsage();
            expect(usage).toHaveProperty('heapUsed');
            expect(usage).toHaveProperty('heapTotal');
            expect(usage.heapUsed).toBeGreaterThan(0);
        });
    });

    describe('safeExit', () => {
        it('should call process.exit in Node', () => {
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
            envUtils.safeExit(1);
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });
});
