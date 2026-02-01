import { describe, it, expect } from 'vitest';
import {
  CapabilityConformanceLevelSchema,
  ProtocolVersionSchema,
  ProtocolReferenceSchema,
  PluginCapabilitySchema,
  PluginInterfaceSchema,
  PluginDependencySchema,
  ExtensionPointSchema,
  PluginCapabilityManifestSchema,
  ProtocolFeatureSchema,
} from './plugin-capability.zod';

describe('Plugin Capability Schemas', () => {
  describe('CapabilityConformanceLevelSchema', () => {
    it('should accept valid conformance levels', () => {
      expect(CapabilityConformanceLevelSchema.parse('full')).toBe('full');
      expect(CapabilityConformanceLevelSchema.parse('partial')).toBe('partial');
      expect(CapabilityConformanceLevelSchema.parse('experimental')).toBe('experimental');
      expect(CapabilityConformanceLevelSchema.parse('deprecated')).toBe('deprecated');
    });

    it('should reject invalid conformance levels', () => {
      expect(() => CapabilityConformanceLevelSchema.parse('invalid')).toThrow();
    });
  });

  describe('ProtocolVersionSchema', () => {
    it('should accept valid semantic versions', () => {
      const version = ProtocolVersionSchema.parse({ major: 1, minor: 2, patch: 3 });
      expect(version).toEqual({ major: 1, minor: 2, patch: 3 });
    });

    it('should reject negative version numbers', () => {
      expect(() => ProtocolVersionSchema.parse({ major: -1, minor: 0, patch: 0 })).toThrow();
    });

    it('should reject non-integer versions', () => {
      expect(() => ProtocolVersionSchema.parse({ major: 1.5, minor: 0, patch: 0 })).toThrow();
    });
  });

  describe('ProtocolReferenceSchema', () => {
    it('should accept valid protocol identifiers', () => {
      const protocol = ProtocolReferenceSchema.parse({
        id: 'com.objectstack.protocol.storage.v1',
        label: 'Storage Protocol',
        version: { major: 1, minor: 0, patch: 0 },
      });
      expect(protocol.id).toBe('com.objectstack.protocol.storage.v1');
    });

    it('should accept protocol with subcategories', () => {
      const protocol = ProtocolReferenceSchema.parse({
        id: 'com.objectstack.protocol.auth.oauth2.v2',
        label: 'OAuth2 Authentication Protocol',
        version: { major: 2, minor: 0, patch: 0 },
      });
      expect(protocol.id).toBe('com.objectstack.protocol.auth.oauth2.v2');
    });

    it('should reject invalid protocol format', () => {
      expect(() => ProtocolReferenceSchema.parse({
        id: 'invalid-protocol',
        label: 'Invalid',
        version: { major: 1, minor: 0, patch: 0 },
      })).toThrow();
    });

    it('should reject protocol without version suffix', () => {
      expect(() => ProtocolReferenceSchema.parse({
        id: 'com.objectstack.protocol.storage',
        label: 'Storage',
        version: { major: 1, minor: 0, patch: 0 },
      })).toThrow();
    });
  });

  describe('ProtocolFeatureSchema', () => {
    it('should accept minimal feature flag', () => {
      const feature = ProtocolFeatureSchema.parse({
        name: 'advanced_caching',
      });
      expect(feature.name).toBe('advanced_caching');
      expect(feature.enabled).toBe(true);
    });

    it('should accept feature with deprecation info', () => {
      const feature = ProtocolFeatureSchema.parse({
        name: 'legacy_api',
        enabled: false,
        deprecatedSince: '2.0.0',
      });
      expect(feature.deprecatedSince).toBe('2.0.0');
    });
  });

  describe('PluginCapabilitySchema', () => {
    it('should accept full conformance capability', () => {
      const capability = PluginCapabilitySchema.parse({
        protocol: {
          id: 'com.objectstack.protocol.storage.v1',
          label: 'Storage Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'full',
        certified: true,
      });
      expect(capability.conformance).toBe('full');
    });

    it('should accept partial conformance with features', () => {
      const capability = PluginCapabilitySchema.parse({
        protocol: {
          id: 'com.objectstack.protocol.storage.v1',
          label: 'Storage Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'partial',
        implementedFeatures: ['read', 'write', 'delete'],
      });
      expect(capability.implementedFeatures).toHaveLength(3);
    });

    it('should default to full conformance', () => {
      const capability = PluginCapabilitySchema.parse({
        protocol: {
          id: 'com.objectstack.protocol.storage.v1',
          label: 'Storage Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
      });
      expect(capability.conformance).toBe('full');
    });
  });

  describe('PluginInterfaceSchema', () => {
    it('should accept valid interface declaration', () => {
      const iface = PluginInterfaceSchema.parse({
        id: 'com.acme.crm.interface.contact_service',
        name: 'ContactService',
        version: { major: 1, minor: 0, patch: 0 },
        methods: [
          {
            name: 'getContact',
            description: 'Retrieve a contact by ID',
            parameters: [
              { name: 'id', type: 'string', required: true },
            ],
            returnType: 'Contact',
            async: true,
          },
        ],
      });
      expect(iface.methods).toHaveLength(1);
      expect(iface.stability).toBe('stable');
    });

    it('should accept interface with events', () => {
      const iface = PluginInterfaceSchema.parse({
        id: 'com.acme.crm.interface.contact_service',
        name: 'ContactService',
        version: { major: 1, minor: 0, patch: 0 },
        methods: [],
        events: [
          {
            name: 'contactCreated',
            description: 'Fired when a new contact is created',
            payload: 'Contact',
          },
        ],
      });
      expect(iface.events).toHaveLength(1);
    });

    it('should reject invalid interface id format', () => {
      expect(() => PluginInterfaceSchema.parse({
        id: 'invalid_interface',
        name: 'Invalid',
        version: { major: 1, minor: 0, patch: 0 },
        methods: [],
      })).toThrow();
    });
  });

  describe('PluginDependencySchema', () => {
    it('should accept valid plugin dependency', () => {
      const dep = PluginDependencySchema.parse({
        pluginId: 'com.objectstack.driver.postgres',
        version: '^1.0.0',
      });
      expect(dep.optional).toBe(false);
    });

    it('should accept optional dependency', () => {
      const dep = PluginDependencySchema.parse({
        pluginId: 'com.acme.analytics',
        version: '>=2.0.0',
        optional: true,
        reason: 'Enhanced analytics features',
      });
      expect(dep.optional).toBe(true);
    });

    it('should accept dependency with capability requirements', () => {
      const dep = PluginDependencySchema.parse({
        pluginId: 'com.objectstack.driver.postgres',
        version: '1.0.0',
        requiredCapabilities: [
          'com.objectstack.protocol.storage.v1',
          'com.objectstack.protocol.transactions.v1',
        ],
      });
      expect(dep.requiredCapabilities).toHaveLength(2);
    });

    it('should reject invalid plugin id', () => {
      expect(() => PluginDependencySchema.parse({
        pluginId: 'Invalid_Plugin',
        version: '1.0.0',
      })).toThrow();
    });
  });

  describe('ExtensionPointSchema', () => {
    it('should accept valid extension point', () => {
      const ext = ExtensionPointSchema.parse({
        id: 'com.acme.crm.extension.contact_validator',
        name: 'Contact Validator',
        type: 'validator',
        contract: {
          input: 'Contact',
          output: 'ValidationResult',
        },
      });
      expect(ext.type).toBe('validator');
      expect(ext.cardinality).toBe('multiple');
    });

    it('should accept single cardinality extension point', () => {
      const ext = ExtensionPointSchema.parse({
        id: 'com.acme.app.extension.theme_provider',
        name: 'Theme Provider',
        type: 'provider',
        cardinality: 'single',
      });
      expect(ext.cardinality).toBe('single');
    });

    it('should accept all extension types', () => {
      const types = ['action', 'hook', 'widget', 'provider', 'transformer', 'validator', 'decorator'];
      types.forEach(type => {
        const ext = ExtensionPointSchema.parse({
          id: `com.test.extension.${type}`,
          name: type,
          type,
        });
        expect(ext.type).toBe(type);
      });
    });
  });

  describe('PluginCapabilityManifestSchema', () => {
    it('should accept complete capability manifest', () => {
      const manifest = PluginCapabilityManifestSchema.parse({
        implements: [
          {
            protocol: {
              id: 'com.objectstack.protocol.storage.v1',
              label: 'Storage Protocol',
              version: { major: 1, minor: 0, patch: 0 },
            },
            conformance: 'full',
          },
        ],
        provides: [
          {
            id: 'com.acme.crm.interface.contact_service',
            name: 'ContactService',
            version: { major: 1, minor: 0, patch: 0 },
            methods: [
              {
                name: 'getContact',
                returnType: 'Contact',
                async: true,
              },
            ],
          },
        ],
        requires: [
          {
            pluginId: 'com.objectstack.driver.postgres',
            version: '^1.0.0',
          },
        ],
        extensionPoints: [
          {
            id: 'com.acme.crm.extension.contact_validator',
            name: 'Contact Validator',
            type: 'validator',
          },
        ],
      });
      expect(manifest.implements).toHaveLength(1);
      expect(manifest.provides).toHaveLength(1);
      expect(manifest.requires).toHaveLength(1);
      expect(manifest.extensionPoints).toHaveLength(1);
    });

    it('should accept manifest with extensions', () => {
      const manifest = PluginCapabilityManifestSchema.parse({
        extensions: [
          {
            targetPluginId: 'com.acme.crm',
            extensionPointId: 'com.acme.crm.extension.contact_validator',
            implementation: './validators/email-validator.ts',
            priority: 50,
          },
        ],
      });
      expect(manifest.extensions).toHaveLength(1);
      expect(manifest.extensions![0].priority).toBe(50);
    });

    it('should accept empty manifest', () => {
      const manifest = PluginCapabilityManifestSchema.parse({});
      expect(manifest).toBeDefined();
    });
  });
});
