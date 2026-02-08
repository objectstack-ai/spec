import { describe, it, expect } from 'vitest';
import {
  HrisConnectorSchema,
  HrisProviderSchema,
  HrisEnvironmentSchema,
  HrisWebhookEventSchema,
  HrisObjectTypeSchema,
  EmployeeSyncConfigSchema,
  PayrollConfigSchema,
  OrgStructureConfigSchema,
  PiiProtectionConfigSchema,
  bamboohrConnectorExample,
  workdayConnectorExample,
  type HrisConnector,
} from './hris.zod';

describe('HrisProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['bamboohr', 'workday', 'adp', 'gusto', 'rippling', 'custom'] as const;

    providers.forEach(provider => {
      expect(() => HrisProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid provider', () => {
    expect(() => HrisProviderSchema.parse('zenefits')).toThrow();
  });
});

describe('HrisEnvironmentSchema', () => {
  it('should accept production and sandbox environments', () => {
    expect(() => HrisEnvironmentSchema.parse('production')).not.toThrow();
    expect(() => HrisEnvironmentSchema.parse('sandbox')).not.toThrow();
  });

  it('should reject invalid environment', () => {
    expect(() => HrisEnvironmentSchema.parse('staging')).toThrow();
  });
});

describe('HrisWebhookEventSchema', () => {
  it('should accept all valid webhook events', () => {
    const events = [
      'employee.created', 'employee.updated', 'employee.terminated',
      'leave.requested', 'leave.approved', 'leave.denied',
      'payroll.processed', 'payroll.approved',
      'position.created', 'position.filled',
    ] as const;

    events.forEach(event => {
      expect(() => HrisWebhookEventSchema.parse(event)).not.toThrow();
    });
  });

  it('should reject invalid webhook event', () => {
    expect(() => HrisWebhookEventSchema.parse('employee.promoted')).toThrow();
  });
});

describe('HrisObjectTypeSchema', () => {
  it('should accept valid object type with CRUD flags', () => {
    const objectType = {
      name: 'employees',
      label: 'Employees',
      apiName: 'employees',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: false,
    };

    expect(() => HrisObjectTypeSchema.parse(objectType)).not.toThrow();
  });

  it('should enforce snake_case for object type name', () => {
    expect(() => HrisObjectTypeSchema.parse({
      name: 'leave_requests',
      label: 'Leave Requests',
      apiName: 'timeOffRequests',
    })).not.toThrow();

    expect(() => HrisObjectTypeSchema.parse({
      name: 'LeaveRequests',
      label: 'Leave Requests',
      apiName: 'timeOffRequests',
    })).toThrow();
  });

  it('should apply defaults for CRUD flags', () => {
    const result = HrisObjectTypeSchema.parse({
      name: 'departments',
      label: 'Departments',
      apiName: 'departments',
    });

    expect(result.enabled).toBe(true);
    expect(result.supportsCreate).toBe(true);
    expect(result.supportsUpdate).toBe(true);
    expect(result.supportsDelete).toBe(true);
  });
});

describe('EmployeeSyncConfigSchema', () => {
  it('should apply sensible defaults', () => {
    const result = EmployeeSyncConfigSchema.parse({});
    expect(result.syncPersonalInfo).toBe(true);
    expect(result.syncEmploymentInfo).toBe(true);
    expect(result.syncCompensation).toBe(false);
    expect(result.syncBenefits).toBe(false);
    expect(result.includeTerminated).toBe(false);
  });

  it('should accept full employee sync config', () => {
    const config = {
      syncPersonalInfo: true,
      syncEmploymentInfo: true,
      syncCompensation: true,
      syncBenefits: true,
      includeTerminated: true,
    };

    expect(() => EmployeeSyncConfigSchema.parse(config)).not.toThrow();
  });
});

describe('PayrollConfigSchema', () => {
  it('should apply defaults', () => {
    const result = PayrollConfigSchema.parse({});
    expect(result.enabled).toBe(false);
    expect(result.syncFrequency).toBe('per_pay_period');
    expect(result.autoApprove).toBe(false);
  });

  it('should accept full payroll config', () => {
    const config = {
      enabled: true,
      syncFrequency: 'monthly',
      autoApprove: false,
      defaultPaySchedule: 'bi_weekly_us',
    };

    expect(() => PayrollConfigSchema.parse(config)).not.toThrow();
  });
});

describe('OrgStructureConfigSchema', () => {
  it('should apply defaults', () => {
    const result = OrgStructureConfigSchema.parse({});
    expect(result.syncDepartments).toBe(true);
    expect(result.syncLocations).toBe(true);
    expect(result.syncCostCenters).toBe(false);
  });

  it('should accept hierarchy depth', () => {
    const config = {
      syncDepartments: true,
      syncLocations: true,
      syncCostCenters: true,
      hierarchyDepth: 5,
    };

    const result = OrgStructureConfigSchema.parse(config);
    expect(result.hierarchyDepth).toBe(5);
  });
});

describe('PiiProtectionConfigSchema', () => {
  it('should apply secure defaults', () => {
    const result = PiiProtectionConfigSchema.parse({});
    expect(result.maskSsn).toBe(true);
    expect(result.maskBankAccount).toBe(true);
    expect(result.encryptionRequired).toBe(true);
  });

  it('should accept data retention config', () => {
    const config = {
      maskSsn: true,
      maskBankAccount: true,
      encryptionRequired: true,
      dataRetentionDays: 365,
    };

    const result = PiiProtectionConfigSchema.parse(config);
    expect(result.dataRetentionDays).toBe(365);
  });
});

describe('HrisConnectorSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal HRIS connector', () => {
      const connector: HrisConnector = {
        name: 'bamboohr_test',
        label: 'BambooHR Test',
        type: 'saas',
        provider: 'bamboohr',
        baseUrl: 'https://api.bamboohr.com/api/gateway.php',
        companyId: 'test-company',
        environment: 'sandbox',
        authentication: {
          type: 'api-key',
          key: 'test-key',
          headerName: 'Authorization',
        },
        objectTypes: [
          {
            name: 'employees',
            label: 'Employees',
            apiName: 'employees',
          },
        ],
      };

      expect(() => HrisConnectorSchema.parse(connector)).not.toThrow();
    });

    it('should enforce snake_case for connector name', () => {
      const validNames = ['bamboohr_test', 'workday_production', '_internal'];
      validNames.forEach(name => {
        expect(() => HrisConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'bamboohr',
          baseUrl: 'https://api.bamboohr.com/api/gateway.php',
          companyId: 'test',
          environment: 'production',
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'employees', label: 'Employees', apiName: 'employees' }],
        })).not.toThrow();
      });

      const invalidNames = ['bamboohrTest', 'BambooHR-Test', '123bamboo'];
      invalidNames.forEach(name => {
        expect(() => HrisConnectorSchema.parse({
          name,
          label: 'Test',
          type: 'saas',
          provider: 'bamboohr',
          baseUrl: 'https://api.bamboohr.com/api/gateway.php',
          companyId: 'test',
          environment: 'production',
          authentication: { type: 'api-key', key: 'key', headerName: 'Authorization' },
          objectTypes: [{ name: 'employees', label: 'Employees', apiName: 'employees' }],
        })).toThrow();
      });
    });
  });

  describe('Complete Configuration', () => {
    it('should accept full HRIS connector with all features', () => {
      const connector: HrisConnector = {
        name: 'workday_full',
        label: 'Workday Full Config',
        type: 'saas',
        provider: 'workday',
        baseUrl: 'https://wd5-impl-services1.workday.com/ccx/api/v1',
        companyId: 'acme_tenant',
        environment: 'production',

        authentication: {
          type: 'oauth2',
          clientId: '${WORKDAY_CLIENT_ID}',
          clientSecret: '${WORKDAY_CLIENT_SECRET}',
          authorizationUrl: 'https://wd5-impl-services1.workday.com/authorize',
          tokenUrl: 'https://wd5-impl-services1.workday.com/token',
          grantType: 'authorization_code',
          scopes: ['r_worker', 'w_worker'],
        },

        objectTypes: [
          {
            name: 'employees',
            label: 'Workers',
            apiName: 'workers',
            enabled: true,
            supportsCreate: true,
            supportsUpdate: true,
            supportsDelete: false,
          },
          {
            name: 'departments',
            label: 'Supervisory Organizations',
            apiName: 'supervisoryOrganizations',
            enabled: true,
            supportsCreate: false,
            supportsUpdate: true,
            supportsDelete: false,
          },
        ],

        webhookEvents: ['employee.created', 'employee.updated', 'payroll.processed'],

        employeeSyncConfig: {
          syncPersonalInfo: true,
          syncEmploymentInfo: true,
          syncCompensation: true,
          syncBenefits: true,
          includeTerminated: true,
        },

        payrollConfig: {
          enabled: true,
          syncFrequency: 'per_pay_period',
          autoApprove: false,
          defaultPaySchedule: 'bi_weekly_us',
        },

        orgStructureConfig: {
          syncDepartments: true,
          syncLocations: true,
          syncCostCenters: true,
          hierarchyDepth: 5,
        },

        piiProtectionConfig: {
          maskSsn: true,
          maskBankAccount: true,
          encryptionRequired: true,
          dataRetentionDays: 730,
        },

        oauthSettings: {
          scopes: ['r_worker', 'w_worker'],
          refreshTokenUrl: 'https://wd5-impl-services1.workday.com/token',
          autoRefresh: true,
        },

        status: 'active',
        enabled: true,
      };

      expect(() => HrisConnectorSchema.parse(connector)).not.toThrow();
    });
  });

  describe('Example Configurations', () => {
    it('should accept BambooHR connector example', () => {
      expect(() => HrisConnectorSchema.parse(bamboohrConnectorExample)).not.toThrow();
    });

    it('should accept Workday connector example', () => {
      expect(() => HrisConnectorSchema.parse(workdayConnectorExample)).not.toThrow();
    });
  });
});
