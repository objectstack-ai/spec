import { describe, it, expect } from 'vitest';
import {
  ObjectQLCapabilitiesSchema,
  ObjectUICapabilitiesSchema,
  ObjectOSCapabilitiesSchema,
  ObjectStackCapabilitiesSchema,
  ObjectStackDefinitionSchema,
  type ObjectQLCapabilities,
  type ObjectUICapabilities,
  type ObjectOSCapabilities,
  type ObjectStackCapabilities,
} from './stack.zod';

describe('ObjectQLCapabilitiesSchema', () => {
  it('should accept valid ObjectQL capabilities with all features enabled', () => {
    const capabilities: ObjectQLCapabilities = {
      queryFilters: true,
      queryAggregations: true,
      querySorting: true,
      queryPagination: true,
      queryWindowFunctions: true,
      querySubqueries: true,
      queryDistinct: true,
      queryHaving: true,
      queryJoins: true,
      fullTextSearch: true,
      vectorSearch: true,
      geoSpatial: true,
      jsonFields: true,
      arrayFields: true,
      validationRules: true,
      workflows: true,
      triggers: true,
      formulas: true,
      transactions: true,
      bulkOperations: true,
      supportedDrivers: ['postgresql', 'mongodb', 'mysql'],
    };

    expect(() => ObjectQLCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should accept minimal ObjectQL capabilities', () => {
    const capabilities: ObjectQLCapabilities = {
      queryFilters: false,
      queryAggregations: false,
      querySorting: false,
      queryPagination: false,
      queryWindowFunctions: false,
      querySubqueries: false,
      queryDistinct: false,
      queryHaving: false,
      queryJoins: false,
      fullTextSearch: false,
      vectorSearch: false,
      geoSpatial: false,
      jsonFields: false,
      arrayFields: false,
      validationRules: false,
      workflows: false,
      triggers: false,
      formulas: false,
      transactions: false,
      bulkOperations: false,
    };

    expect(() => ObjectQLCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should use default values for boolean fields', () => {
    const result = ObjectQLCapabilitiesSchema.parse({});

    expect(result.queryFilters).toBe(true);
    expect(result.queryAggregations).toBe(true);
    expect(result.querySorting).toBe(true);
    expect(result.queryPagination).toBe(true);
    expect(result.queryWindowFunctions).toBe(false);
    expect(result.vectorSearch).toBe(false);
  });

  it('should accept optional supportedDrivers array', () => {
    const withDrivers = ObjectQLCapabilitiesSchema.parse({
      supportedDrivers: ['postgresql', 'sqlite', 'excel'],
    });

    expect(withDrivers.supportedDrivers).toEqual(['postgresql', 'sqlite', 'excel']);

    const withoutDrivers = ObjectQLCapabilitiesSchema.parse({});
    expect(withoutDrivers.supportedDrivers).toBeUndefined();
  });
});

describe('ObjectUICapabilitiesSchema', () => {
  it('should accept valid ObjectUI capabilities with all features enabled', () => {
    const capabilities: ObjectUICapabilities = {
      listView: true,
      formView: true,
      kanbanView: true,
      calendarView: true,
      ganttView: true,
      dashboards: true,
      reports: true,
      charts: true,
      customPages: true,
      customThemes: true,
      customComponents: true,
      customActions: true,
      screenFlows: true,
      mobileOptimized: true,
      accessibility: true,
    };

    expect(() => ObjectUICapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should accept minimal ObjectUI capabilities', () => {
    const capabilities: ObjectUICapabilities = {
      listView: false,
      formView: false,
      kanbanView: false,
      calendarView: false,
      ganttView: false,
      dashboards: false,
      reports: false,
      charts: false,
      customPages: false,
      customThemes: false,
      customComponents: false,
      customActions: false,
      screenFlows: false,
      mobileOptimized: false,
      accessibility: false,
    };

    expect(() => ObjectUICapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should use default values for boolean fields', () => {
    const result = ObjectUICapabilitiesSchema.parse({});

    expect(result.listView).toBe(true);
    expect(result.formView).toBe(true);
    expect(result.dashboards).toBe(true);
    expect(result.kanbanView).toBe(false);
    expect(result.customThemes).toBe(false);
  });
});

describe('ObjectOSCapabilitiesSchema', () => {
  it('should accept valid ObjectOS capabilities with all features enabled', () => {
    const capabilities: ObjectOSCapabilities = {
      version: '1.0.0',
      environment: 'production',
      restApi: true,
      graphqlApi: true,
      odataApi: true,
      websockets: true,
      serverSentEvents: true,
      eventBus: true,
      webhooks: true,
      apiContracts: true,
      authentication: true,
      rbac: true,
      fieldLevelSecurity: true,
      rowLevelSecurity: true,
      multiTenant: true,
      backgroundJobs: true,
      auditLogging: true,
      fileStorage: true,
      i18n: true,
      pluginSystem: true,
      features: [],
      apis: [],
      systemObjects: ['user', 'role', 'permission'],
      limits: {
        maxObjects: 1000,
        maxFieldsPerObject: 500,
        maxRecordsPerQuery: 10000,
        apiRateLimit: 1000,
        fileUploadSizeLimit: 10485760,
      },
    };

    expect(() => ObjectOSCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should require version and environment fields', () => {
    expect(() => ObjectOSCapabilitiesSchema.parse({})).toThrow();

    expect(() =>
      ObjectOSCapabilitiesSchema.parse({
        version: '1.0.0',
      })
    ).toThrow();

    expect(() =>
      ObjectOSCapabilitiesSchema.parse({
        version: '1.0.0',
        environment: 'development',
      })
    ).not.toThrow();
  });

  it('should validate environment enum values', () => {
    expect(() =>
      ObjectOSCapabilitiesSchema.parse({
        version: '1.0.0',
        environment: 'invalid',
      })
    ).toThrow();

    const validEnvironments = ['development', 'test', 'staging', 'production'];
    validEnvironments.forEach((env) => {
      expect(() =>
        ObjectOSCapabilitiesSchema.parse({
          version: '1.0.0',
          environment: env,
        })
      ).not.toThrow();
    });
  });

  it('should use default values for boolean fields', () => {
    const result = ObjectOSCapabilitiesSchema.parse({
      version: '1.0.0',
      environment: 'development',
    });

    expect(result.restApi).toBe(true);
    expect(result.authentication).toBe(true);
    expect(result.fileStorage).toBe(true);
    expect(result.graphqlApi).toBe(false);
    expect(result.multiTenant).toBe(false);
  });

  it('should accept optional limits object', () => {
    const withLimits = ObjectOSCapabilitiesSchema.parse({
      version: '1.0.0',
      environment: 'production',
      limits: {
        maxObjects: 500,
        apiRateLimit: 100,
      },
    });

    expect(withLimits.limits?.maxObjects).toBe(500);
    expect(withLimits.limits?.apiRateLimit).toBe(100);

    const withoutLimits = ObjectOSCapabilitiesSchema.parse({
      version: '1.0.0',
      environment: 'development',
    });

    expect(withoutLimits.limits).toBeUndefined();
  });
});

describe('ObjectStackCapabilitiesSchema', () => {
  it('should accept complete ObjectStack capabilities with all subsystems', () => {
    const capabilities: ObjectStackCapabilities = {
      objectql: {
        queryFilters: true,
        queryAggregations: true,
        querySorting: true,
        queryPagination: true,
        queryWindowFunctions: true,
        querySubqueries: true,
        queryDistinct: true,
        queryHaving: true,
        queryJoins: true,
        fullTextSearch: true,
        vectorSearch: true,
        geoSpatial: true,
        jsonFields: true,
        arrayFields: true,
        validationRules: true,
        workflows: true,
        triggers: true,
        formulas: true,
        transactions: true,
        bulkOperations: true,
        supportedDrivers: ['postgresql', 'mongodb'],
      },
      objectui: {
        listView: true,
        formView: true,
        kanbanView: true,
        calendarView: true,
        ganttView: false,
        dashboards: true,
        reports: true,
        charts: true,
        customPages: true,
        customThemes: false,
        customComponents: false,
        customActions: true,
        screenFlows: true,
        mobileOptimized: true,
        accessibility: false,
      },
      objectos: {
        version: '1.0.0',
        environment: 'production',
        restApi: true,
        graphqlApi: true,
        odataApi: false,
        websockets: true,
        serverSentEvents: false,
        eventBus: true,
        webhooks: true,
        apiContracts: false,
        authentication: true,
        rbac: true,
        fieldLevelSecurity: true,
        rowLevelSecurity: true,
        multiTenant: true,
        backgroundJobs: true,
        auditLogging: true,
        fileStorage: true,
        i18n: true,
        pluginSystem: false,
        systemObjects: ['user', 'role', 'permission', 'object'],
        limits: {
          maxObjects: 1000,
          maxFieldsPerObject: 500,
          apiRateLimit: 1000,
        },
      },
    };

    expect(() => ObjectStackCapabilitiesSchema.parse(capabilities)).not.toThrow();
  });

  it('should require all three subsystem capability objects', () => {
    expect(() => ObjectStackCapabilitiesSchema.parse({})).toThrow();

    expect(() =>
      ObjectStackCapabilitiesSchema.parse({
        objectql: {},
        objectui: {},
      })
    ).toThrow();

    expect(() =>
      ObjectStackCapabilitiesSchema.parse({
        objectql: {},
        objectui: {},
        objectos: {
          version: '1.0.0',
          environment: 'development',
        },
      })
    ).not.toThrow();
  });

  it('should allow minimal valid configuration', () => {
    const minimal: ObjectStackCapabilities = {
      objectql: {},
      objectui: {},
      objectos: {
        version: '0.1.0',
        environment: 'development',
      },
    };

    const result = ObjectStackCapabilitiesSchema.parse(minimal);

    // Check that defaults are applied
    expect(result.objectql.queryFilters).toBe(true);
    expect(result.objectui.listView).toBe(true);
    expect(result.objectos.restApi).toBe(true);
  });

  it('should preserve subsystem-specific optional fields', () => {
    const capabilities = ObjectStackCapabilitiesSchema.parse({
      objectql: {
        supportedDrivers: ['postgresql', 'sqlite'],
      },
      objectui: {},
      objectos: {
        version: '1.0.0',
        environment: 'production',
        systemObjects: ['user', 'role'],
        limits: {
          maxObjects: 100,
        },
      },
    });

    expect(capabilities.objectql.supportedDrivers).toEqual(['postgresql', 'sqlite']);
    expect(capabilities.objectos.systemObjects).toEqual(['user', 'role']);
    expect(capabilities.objectos.limits?.maxObjects).toBe(100);
  });
});

describe('ObjectStackDefinitionSchema', () => {
  it('should accept a complete ObjectStack definition', () => {
    const definition = {
      manifest: {
        id: 'com.example.test',
        name: 'test-project',
        version: '1.0.0',
        type: 'app',
        description: 'A test project',
      },
      objects: [],
      apps: [],
    };

    expect(() => ObjectStackDefinitionSchema.parse(definition)).not.toThrow();
  });

  it('should require manifest field', () => {
    expect(() => ObjectStackDefinitionSchema.parse({})).toThrow();
  });
});
