import { describe, it, expect } from 'vitest';
import {
  PackageStatusEnum,
  InstalledPackageSchema,
  ListPackagesRequestSchema,
  ListPackagesResponseSchema,
  GetPackageRequestSchema,
  GetPackageResponseSchema,
  InstallPackageRequestSchema,
  InstallPackageResponseSchema,
  UninstallPackageRequestSchema,
  UninstallPackageResponseSchema,
  EnablePackageRequestSchema,
  EnablePackageResponseSchema,
  DisablePackageRequestSchema,
  DisablePackageResponseSchema,
} from './package-registry.zod';

const validManifest = {
  id: 'com.acme.crm',
  version: '1.0.0',
  type: 'app' as const,
  name: 'Acme CRM',
};

describe('PackageStatusEnum', () => {
  it('should accept valid statuses', () => {
    const statuses = ['installed', 'disabled', 'installing', 'uninstalling', 'error'];
    statuses.forEach(status => {
      expect(() => PackageStatusEnum.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid statuses', () => {
    expect(() => PackageStatusEnum.parse('active')).toThrow();
    expect(() => PackageStatusEnum.parse('')).toThrow();
  });
});

describe('InstalledPackageSchema', () => {
  it('should accept minimal installed package', () => {
    const pkg = { manifest: validManifest };
    expect(() => InstalledPackageSchema.parse(pkg)).not.toThrow();
  });

  it('should apply default values', () => {
    const parsed = InstalledPackageSchema.parse({ manifest: validManifest });
    expect(parsed.status).toBe('installed');
    expect(parsed.enabled).toBe(true);
  });

  it('should accept full installed package', () => {
    const pkg = {
      manifest: validManifest,
      status: 'disabled' as const,
      enabled: false,
      installedAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-02-01T12:00:00Z',
      statusChangedAt: '2025-02-01T12:00:00Z',
      errorMessage: 'Some error occurred',
      settings: { apiKey: 'secret', maxRetries: 3 },
    };

    const parsed = InstalledPackageSchema.parse(pkg);
    expect(parsed.status).toBe('disabled');
    expect(parsed.enabled).toBe(false);
    expect(parsed.settings?.apiKey).toBe('secret');
  });

  it('should reject invalid datetime for installedAt', () => {
    expect(() => InstalledPackageSchema.parse({
      manifest: validManifest,
      installedAt: 'not-a-date',
    })).toThrow();
  });

  it('should reject invalid manifest', () => {
    expect(() => InstalledPackageSchema.parse({
      manifest: { id: 'test' },
    })).toThrow();
  });
});

describe('ListPackagesRequestSchema', () => {
  it('should accept empty request', () => {
    expect(() => ListPackagesRequestSchema.parse({})).not.toThrow();
  });

  it('should accept request with filters', () => {
    const parsed = ListPackagesRequestSchema.parse({
      status: 'installed',
      type: 'app',
      enabled: true,
    });
    expect(parsed.status).toBe('installed');
    expect(parsed.type).toBe('app');
    expect(parsed.enabled).toBe(true);
  });
});

describe('ListPackagesResponseSchema', () => {
  it('should accept valid response', () => {
    const response = {
      packages: [{ manifest: validManifest }],
      total: 1,
    };
    const parsed = ListPackagesResponseSchema.parse(response);
    expect(parsed.packages).toHaveLength(1);
    expect(parsed.total).toBe(1);
  });

  it('should accept empty packages list', () => {
    const parsed = ListPackagesResponseSchema.parse({ packages: [], total: 0 });
    expect(parsed.packages).toHaveLength(0);
  });
});

describe('GetPackageRequestSchema', () => {
  it('should accept valid request', () => {
    const parsed = GetPackageRequestSchema.parse({ id: 'com.acme.crm' });
    expect(parsed.id).toBe('com.acme.crm');
  });

  it('should reject missing id', () => {
    expect(() => GetPackageRequestSchema.parse({})).toThrow();
  });
});

describe('GetPackageResponseSchema', () => {
  it('should accept valid response', () => {
    const response = { package: { manifest: validManifest } };
    expect(() => GetPackageResponseSchema.parse(response)).not.toThrow();
  });
});

describe('InstallPackageRequestSchema', () => {
  it('should accept minimal install request', () => {
    const request = { manifest: validManifest };
    expect(() => InstallPackageRequestSchema.parse(request)).not.toThrow();
  });

  it('should apply default enableOnInstall', () => {
    const parsed = InstallPackageRequestSchema.parse({ manifest: validManifest });
    expect(parsed.enableOnInstall).toBe(true);
  });

  it('should accept install request with settings', () => {
    const request = {
      manifest: validManifest,
      settings: { apiKey: 'abc123' },
      enableOnInstall: false,
    };
    const parsed = InstallPackageRequestSchema.parse(request);
    expect(parsed.enableOnInstall).toBe(false);
    expect(parsed.settings?.apiKey).toBe('abc123');
  });
});

describe('InstallPackageResponseSchema', () => {
  it('should accept valid response', () => {
    const response = {
      package: { manifest: validManifest },
      message: 'Installed successfully',
    };
    expect(() => InstallPackageResponseSchema.parse(response)).not.toThrow();
  });
});

describe('UninstallPackageRequestSchema', () => {
  it('should accept valid request', () => {
    const parsed = UninstallPackageRequestSchema.parse({ id: 'com.acme.crm' });
    expect(parsed.id).toBe('com.acme.crm');
  });

  it('should reject missing id', () => {
    expect(() => UninstallPackageRequestSchema.parse({})).toThrow();
  });
});

describe('UninstallPackageResponseSchema', () => {
  it('should accept valid response', () => {
    const response = {
      id: 'com.acme.crm',
      success: true,
      message: 'Uninstalled',
    };
    const parsed = UninstallPackageResponseSchema.parse(response);
    expect(parsed.success).toBe(true);
  });

  it('should accept response without message', () => {
    const response = { id: 'com.acme.crm', success: false };
    expect(() => UninstallPackageResponseSchema.parse(response)).not.toThrow();
  });
});

describe('EnablePackageRequestSchema', () => {
  it('should accept valid request', () => {
    const parsed = EnablePackageRequestSchema.parse({ id: 'com.acme.crm' });
    expect(parsed.id).toBe('com.acme.crm');
  });
});

describe('EnablePackageResponseSchema', () => {
  it('should accept valid response', () => {
    const response = {
      package: { manifest: validManifest },
      message: 'Enabled',
    };
    expect(() => EnablePackageResponseSchema.parse(response)).not.toThrow();
  });
});

describe('DisablePackageRequestSchema', () => {
  it('should accept valid request', () => {
    const parsed = DisablePackageRequestSchema.parse({ id: 'com.acme.crm' });
    expect(parsed.id).toBe('com.acme.crm');
  });
});

describe('DisablePackageResponseSchema', () => {
  it('should accept valid response', () => {
    const response = {
      package: { manifest: validManifest },
      message: 'Disabled',
    };
    expect(() => DisablePackageResponseSchema.parse(response)).not.toThrow();
  });
});
