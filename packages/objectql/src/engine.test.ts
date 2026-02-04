import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ObjectQL } from './engine';
import { SchemaRegistry } from './registry';
import { DriverInterface } from '@objectstack/spec/data';

// Mock the SchemaRegistry to avoid side effects between tests
vi.mock('./registry', () => {
  const mockObjects = new Map();
  return {
    SchemaRegistry: {
      getObject: vi.fn((name) => mockObjects.get(name)),
      registerObject: vi.fn((obj) => mockObjects.set(obj.name, obj)),
      registerKind: vi.fn(),
      metadata: {
        get: vi.fn(() => mockObjects) // Expose for verification if needed
      }
    }
  };
});

describe('ObjectQL Engine', () => {
    let engine: ObjectQL;
    let mockDriver: DriverInterface;
    let mockDriver2: DriverInterface;

    beforeEach(() => {
        // Clear Registry Mocks
        vi.clearAllMocks();
        
        // Setup Drivers
        mockDriver = {
            name: 'default-driver',
            connect: vi.fn().mockResolvedValue(undefined),
            disconnect: vi.fn().mockResolvedValue(undefined),
            find: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Record' }]),
            findOne: vi.fn(),
            create: vi.fn().mockResolvedValue({ id: '1', success: true }),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            capabilities: {} as any // Simplified
        } as unknown as DriverInterface;

        mockDriver2 = {
            name: 'mongo',
            connect: vi.fn().mockResolvedValue(undefined),
            disconnect: vi.fn().mockResolvedValue(undefined),
            find: vi.fn().mockResolvedValue([{ id: '2', name: 'Mongo Record' }]),
            findOne: vi.fn(),
            create: vi.fn().mockResolvedValue({ id: '2', success: true }),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            capabilities: {} as any
        } as unknown as DriverInterface;

        engine = new ObjectQL();
    });

    describe('Initialization', () => {
        it('should initialize with default logger', () => {
            expect(engine).toBeDefined();
            expect(engine.getStatus().status).toBe('running');
        });

        it('should register and connect drivers on init', async () => {
            engine.registerDriver(mockDriver, true);
            await engine.init();
            expect(mockDriver.connect).toHaveBeenCalled();
        });
    });

    describe('Metadata Registration', () => {
        it('should register objects from app manifest', () => {
            const manifest = {
                id: 'com.example.app',
                objects: [
                    { name: 'task', fields: {} }
                ]
            };
            
            engine.registerApp(manifest);
            expect(SchemaRegistry.registerObject).toHaveBeenCalledWith(expect.objectContaining({ name: 'task' }));
        });

        it('should register kinds from app manifest', () => {
            const manifest = {
                id: 'com.example.app',
                contributes: {
                    kinds: [{ id: 'test.kind', description: 'Test Kind' }]
                }
            };
            
            engine.registerApp(manifest);
            expect(SchemaRegistry.registerKind).toHaveBeenCalledWith(expect.objectContaining({ id: 'test.kind' }));
        });
    });

    describe('Driver Routing', () => {
        beforeEach(async () => {
            // Setup:
            // - Default Driver: mockDriver
            // - Specific Driver: mockDriver2 (named 'mongo')
            engine.registerDriver(mockDriver, true);
            engine.registerDriver(mockDriver2);
            await engine.init();
        });

        it('should route to default driver when no datasource is specified', async () => {
            // Mock Schema: Object uses default datasource
            vi.mocked(SchemaRegistry.getObject).mockReturnValue({ name: 'task', datasource: 'default', fields: {} });

            await engine.find('task', { filters: [] });
            
            expect(mockDriver.find).toHaveBeenCalled();
            expect(mockDriver2.find).not.toHaveBeenCalled();
        });

        it('should route to specific driver when datasource is specified', async () => {
            // Mock Schema: Object uses 'mongo' datasource
            vi.mocked(SchemaRegistry.getObject).mockReturnValue({ name: 'log', datasource: 'mongo', fields: {} });

            await engine.find('log', { filters: [] });
            
            expect(mockDriver.find).not.toHaveBeenCalled();
            expect(mockDriver2.find).toHaveBeenCalled();
        });

        it('should throw error if datasource is not found', async () => {
             // Mock Schema: Object uses unknown datasource
             vi.mocked(SchemaRegistry.getObject).mockReturnValue({ name: 'old_data', datasource: 'legacy_sql', fields: {} });

             await expect(engine.find('old_data', {})).rejects.toThrow("Datasource 'legacy_sql' configured for object 'old_data' is not registered");
        });
    });

    describe('CRUD Operations', () => {
        beforeEach(async () => {
            engine.registerDriver(mockDriver, true);
            await engine.init();
            vi.mocked(SchemaRegistry.getObject).mockReturnValue({ name: 'task', fields: {} });
        });

        it('should execute insert operation', async () => {
            const result = await engine.insert('task', { title: 'New Task' });
            expect(mockDriver.create).toHaveBeenCalledWith('task', { title: 'New Task' }, undefined);
            expect(result).toEqual({ id: '1', success: true });
        });

        it('should execute find operation', async () => {
            const result = await engine.find('task', {});
            expect(mockDriver.find).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });
});
