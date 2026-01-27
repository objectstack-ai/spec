import { describe, it, expect } from 'vitest';
import { ManifestSchema, type ObjectStackManifest } from './manifest.zod';

describe('ManifestSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal manifest', () => {
      const manifest: ObjectStackManifest = {
        id: 'com.example.app',
        version: '1.0.0',
        type: 'app',
        name: 'Example App',
      };

      expect(() => ManifestSchema.parse(manifest)).not.toThrow();
    });

    it('should enforce semantic versioning', () => {
      const validVersions = ['0.0.1', '1.0.0', '1.2.3', '10.20.30'];
      validVersions.forEach(version => {
        const manifest = {
          id: 'com.test.app',
          version,
          type: 'app' as const,
          name: 'Test',
        };
        expect(() => ManifestSchema.parse(manifest)).not.toThrow();
      });

      const invalidVersions = ['1.0', '1', 'v1.0.0', '1.0.0-beta'];
      invalidVersions.forEach(version => {
        const manifest = {
          id: 'com.test.app',
          version,
          type: 'app' as const,
          name: 'Test',
        };
        expect(() => ManifestSchema.parse(manifest)).toThrow();
      });
    });

    it('should accept all package types', () => {
      const types = ['app', 'plugin', 'driver', 'module'] as const;
      
      types.forEach(type => {
        const manifest = {
          id: 'com.test.package',
          version: '1.0.0',
          type,
          name: 'Test Package',
        };
        expect(() => ManifestSchema.parse(manifest)).not.toThrow();
      });
    });
  });

  describe('Optional Properties', () => {
    it('should accept manifest with description', () => {
      const manifest: ObjectStackManifest = {
        id: 'com.example.crm',
        version: '2.1.0',
        type: 'app',
        name: 'CRM Application',
        description: 'Customer relationship management system',
      };

      expect(() => ManifestSchema.parse(manifest)).not.toThrow();
    });

    it('should accept manifest with permissions', () => {
      const manifest: ObjectStackManifest = {
        id: 'com.example.admin',
        version: '1.0.0',
        type: 'plugin',
        name: 'Admin Tools',
        permissions: [
          'system.user.read',
          'system.user.write',
          'system.data.read',
          'system.data.write',
        ],
      };

      expect(() => ManifestSchema.parse(manifest)).not.toThrow();
    });

    it('should accept manifest with object patterns', () => {
      const manifest: ObjectStackManifest = {
        id: 'com.example.sales',
        version: '3.0.0',
        type: 'app',
        name: 'Sales Module',
        objects: [
          './src/objects/*.object.yml',
          './src/objects/**/*.object.ts',
        ],
      };

      expect(() => ManifestSchema.parse(manifest)).not.toThrow();
    });

    it('should accept manifest with extensions', () => {
      const manifest: ObjectStackManifest = {
        id: 'com.example.custom',
        version: '1.0.0',
        type: 'plugin',
        name: 'Custom Extensions',
        extensions: {
          'ui.components': [
            {
              id: 'custom-widget',
              component: 'CustomWidget',
            },
          ],
          'api.hooks': {
            'before_save': 'validateData',
          },
        },
      };

      expect(() => ManifestSchema.parse(manifest)).not.toThrow();
    });
  });

  describe('Real-World Manifest Examples', () => {
    it('should accept complete CRM application manifest', () => {
      const crmManifest: ObjectStackManifest = {
        id: 'com.objectstack.crm',
        version: '2.5.0',
        type: 'app',
        name: 'ObjectStack CRM',
        description: 'Complete customer relationship management solution with sales, marketing, and service modules',
        permissions: [
          'app.access.crm',
          'crm.lead.read',
          'crm.lead.write',
          'crm.opportunity.read',
          'crm.opportunity.write',
          'crm.account.read',
          'crm.account.write',
          'crm.contact.read',
          'crm.contact.write',
        ],
        objects: [
          './objects/lead.object.ts',
          './objects/opportunity.object.ts',
          './objects/account.object.ts',
          './objects/contact.object.ts',
          './objects/campaign.object.ts',
        ],
        extensions: {
          'dashboard.widgets': [
            {
              id: 'sales-pipeline',
              name: 'Sales Pipeline',
              component: 'SalesPipelineWidget',
            },
            {
              id: 'revenue-forecast',
              name: 'Revenue Forecast',
              component: 'RevenueForecastWidget',
            },
          ],
          'workflows': {
            'lead_conversion': './workflows/lead-conversion.yml',
            'opportunity_close': './workflows/opportunity-close.yml',
          },
        },
      };

      expect(() => ManifestSchema.parse(crmManifest)).not.toThrow();
    });

    it('should accept bi plugin with custom kinds', () => {
      const biPlugin: ObjectStackManifest = {
        id: 'com.objectstack.bi',
        version: '1.0.0',
        type: 'plugin',
        name: 'Business Intelligence',
        contributes: {
            kinds: [
                {
                    id: 'bi.dataset',
                    globs: ['**/*.dataset.json']
                },
                {
                    id: 'bi.dashboard',
                    globs: ['**/*.bi-dash.json']
                }
            ]
        }
      };
      
      expect(() => ManifestSchema.parse(biPlugin)).not.toThrow();
    });

    it('should accept authentication plugin manifest', () => {
      const authPlugin: ObjectStackManifest = {
        id: 'com.objectstack.auth.saml',
        version: '1.2.1',
        type: 'plugin',
        name: 'SAML Authentication Plugin',
        description: 'Enables SAML 2.0 single sign-on authentication',
        permissions: [
          'system.auth.configure',
          'system.user.create',
        ],
        extensions: {
          'auth.providers': {
            id: 'saml',
            name: 'SAML 2.0',
            configSchema: 'saml-config.schema.json',
            handler: 'SAMLAuthHandler',
          },
          'admin.settings': [
            {
              page: 'saml-settings',
              label: 'SAML Configuration',
              component: 'SAMLSettingsPage',
            },
          ],
        },
      };

      expect(() => ManifestSchema.parse(authPlugin)).not.toThrow();
    });

    it('should accept database driver manifest', () => {
      const dbDriver: ObjectStackManifest = {
        id: 'com.objectstack.driver.postgres',
        version: '5.0.0',
        type: 'driver',
        name: 'PostgreSQL Driver',
        description: 'PostgreSQL database driver with advanced features',
        permissions: [
          'system.datasource.manage',
        ],
        extensions: {
          'datasource.types': {
            id: 'postgresql',
            name: 'PostgreSQL',
            driver: 'PostgreSQLDriver',
            features: ['transactions', 'jsonb', 'full-text-search'],
          },
        },
      };

      expect(() => ManifestSchema.parse(dbDriver)).not.toThrow();
    });

    it('should accept utility module manifest', () => {
      const utilModule: ObjectStackManifest = {
        id: 'com.objectstack.module.utils',
        version: '1.0.0',
        type: 'module',
        name: 'Utility Functions',
        description: 'Common utility functions for ObjectStack applications',
      };

      expect(() => ManifestSchema.parse(utilModule)).not.toThrow();
    });
  });

  describe('Reverse Domain Notation', () => {
    it('should accept various reverse domain notation formats', () => {
      const validIds = [
        'com.example.app',
        'com.company.product.module',
        'org.opensource.project',
        'io.github.username.repo',
        'net.example.service',
      ];

      validIds.forEach(id => {
        const manifest = {
          id,
          version: '1.0.0',
          type: 'app' as const,
          name: 'Test',
        };
        expect(() => ManifestSchema.parse(manifest)).not.toThrow();
      });
    });
  });
});
