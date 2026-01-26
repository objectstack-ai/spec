import { describe, it, expect } from 'vitest';
import {
  ExtensionValueSchema,
  ExtensionsMapSchema,
  ExtensionDefinitionSchema,
  ExtensionRegistrySchema,
  Extension,
  type ExtensionsMap,
  type ExtensionDefinition,
  type ExtensionRegistry,
} from './extension.zod';

describe('ExtensionValueSchema', () => {
  it('should accept string values', () => {
    expect(() => ExtensionValueSchema.parse('text-embedding-3-small')).not.toThrow();
  });

  it('should accept number values', () => {
    expect(() => ExtensionValueSchema.parse(512)).not.toThrow();
    expect(() => ExtensionValueSchema.parse(3.14)).not.toThrow();
  });

  it('should accept boolean values', () => {
    expect(() => ExtensionValueSchema.parse(true)).not.toThrow();
    expect(() => ExtensionValueSchema.parse(false)).not.toThrow();
  });

  it('should accept null values', () => {
    expect(() => ExtensionValueSchema.parse(null)).not.toThrow();
  });

  it('should accept array values', () => {
    expect(() => ExtensionValueSchema.parse(['onCreate', 'onUpdate'])).not.toThrow();
    expect(() => ExtensionValueSchema.parse([1, 2, 3])).not.toThrow();
  });

  it('should accept object values', () => {
    expect(() => ExtensionValueSchema.parse({ key: 'value', nested: { deep: true } })).not.toThrow();
  });
});

describe('ExtensionsMapSchema', () => {
  it('should accept valid extensions map', () => {
    const extensions: ExtensionsMap = {
      'ai_assistant.vectorIndexed': true,
      'ai_assistant.embeddingModel': 'text-embedding-3-small',
      'ai_assistant.chunkSize': 512,
      'crm_sync.salesforceId': 'Contact.Email__c',
      'workflow_engine.triggers': ['onCreate', 'onUpdate'],
    };

    expect(() => ExtensionsMapSchema.parse(extensions)).not.toThrow();
  });

  it('should accept empty extensions map', () => {
    expect(() => ExtensionsMapSchema.parse({})).not.toThrow();
  });

  it('should accept undefined', () => {
    expect(() => ExtensionsMapSchema.parse(undefined)).not.toThrow();
  });

  it('should accept nested object values', () => {
    const extensions = {
      'plugin.complexConfig': {
        enabled: true,
        settings: {
          apiKey: 'secret',
          timeout: 5000,
        },
      },
    };

    expect(() => ExtensionsMapSchema.parse(extensions)).not.toThrow();
  });
});

describe('ExtensionDefinitionSchema', () => {
  it('should accept valid extension definition', () => {
    const definition: ExtensionDefinition = {
      key: 'ai_assistant.vectorIndexed',
      pluginId: 'ai_assistant',
      label: 'Vector Indexed',
      description: 'Whether this field should be indexed for vector search',
      type: 'boolean',
      default: false,
      appliesTo: ['field'],
      fieldTypes: ['text', 'textarea', 'markdown'],
      required: false,
    };

    expect(() => ExtensionDefinitionSchema.parse(definition)).not.toThrow();
  });

  it('should accept minimal extension definition', () => {
    const definition = {
      key: 'plugin_name.propertyName',
      pluginId: 'plugin_name',
      label: 'Property Label',
      type: 'string',
      appliesTo: ['object'],
    };

    expect(() => ExtensionDefinitionSchema.parse(definition)).not.toThrow();
  });

  it('should reject invalid key format (no namespace)', () => {
    const definition = {
      key: 'invalidkey',
      pluginId: 'plugin',
      label: 'Label',
      type: 'string',
      appliesTo: ['field'],
    };

    expect(() => ExtensionDefinitionSchema.parse(definition)).toThrow();
  });

  it('should reject invalid key format (uppercase in namespace)', () => {
    const definition = {
      key: 'PluginName.property',
      pluginId: 'plugin',
      label: 'Label',
      type: 'string',
      appliesTo: ['field'],
    };

    expect(() => ExtensionDefinitionSchema.parse(definition)).toThrow();
  });

  it('should accept valid appliesTo values', () => {
    const validAppliesTo = [
      ['object'],
      ['field'],
      ['view'],
      ['app'],
      ['dashboard'],
      ['report'],
      ['action'],
      ['workflow'],
      ['object', 'field'],
      ['view', 'dashboard', 'report'],
    ];

    validAppliesTo.forEach(appliesTo => {
      const definition = {
        key: 'plugin.property',
        pluginId: 'plugin',
        label: 'Label',
        type: 'string',
        appliesTo,
      };

      expect(() => ExtensionDefinitionSchema.parse(definition)).not.toThrow();
    });
  });

  it('should accept all type values', () => {
    const types = ['string', 'number', 'boolean', 'object', 'array', 'any'];

    types.forEach(type => {
      const definition = {
        key: 'plugin.property',
        pluginId: 'plugin',
        label: 'Label',
        type,
        appliesTo: ['field'],
      };

      expect(() => ExtensionDefinitionSchema.parse(definition)).not.toThrow();
    });
  });

  it('should include schema field for advanced validation', () => {
    const definition = {
      key: 'plugin.property',
      pluginId: 'plugin',
      label: 'Label',
      type: 'object',
      appliesTo: ['field'],
      schema: {
        type: 'object',
        properties: {
          apiKey: { type: 'string' },
          timeout: { type: 'number' },
        },
        required: ['apiKey'],
      },
    };

    expect(() => ExtensionDefinitionSchema.parse(definition)).not.toThrow();
  });
});

describe('ExtensionRegistrySchema', () => {
  it('should accept valid extension registry', () => {
    const registry: ExtensionRegistry = {
      extensions: {
        'ai_assistant.vectorIndexed': {
          key: 'ai_assistant.vectorIndexed',
          pluginId: 'ai_assistant',
          label: 'Vector Indexed',
          type: 'boolean',
          appliesTo: ['field'],
        },
        'ai_assistant.enableRAG': {
          key: 'ai_assistant.enableRAG',
          pluginId: 'ai_assistant',
          label: 'Enable RAG',
          type: 'boolean',
          appliesTo: ['object'],
        },
      },
    };

    expect(() => ExtensionRegistrySchema.parse(registry)).not.toThrow();
  });

  it('should accept empty registry', () => {
    const registry = {
      extensions: {},
    };

    expect(() => ExtensionRegistrySchema.parse(registry)).not.toThrow();
  });
});

describe('Extension helper functions', () => {
  describe('Extension.key', () => {
    it('should create namespaced key', () => {
      expect(Extension.key('ai_assistant', 'vectorIndexed')).toBe('ai_assistant.vectorIndexed');
      expect(Extension.key('crm_sync', 'salesforceId')).toBe('crm_sync.salesforceId');
    });
  });

  describe('Extension.get', () => {
    it('should get extension value', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
        'ai_assistant.chunkSize': 512,
      };

      expect(Extension.get(extensions, 'ai_assistant.vectorIndexed')).toBe(true);
      expect(Extension.get(extensions, 'ai_assistant.embeddingModel')).toBe('text-embedding-3-small');
      expect(Extension.get(extensions, 'ai_assistant.chunkSize')).toBe(512);
    });

    it('should return default value if extension not found', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
      };

      expect(Extension.get(extensions, 'nonexistent.key', false)).toBe(false);
      expect(Extension.get(extensions, 'nonexistent.key', 'default')).toBe('default');
    });

    it('should return default value if extensions is undefined', () => {
      expect(Extension.get(undefined, 'ai_assistant.vectorIndexed', false)).toBe(false);
    });

    it('should return undefined if no default and key not found', () => {
      const extensions: ExtensionsMap = {};
      expect(Extension.get(extensions, 'nonexistent.key')).toBeUndefined();
    });
  });

  describe('Extension.set', () => {
    it('should set extension value', () => {
      const extensions: ExtensionsMap = {
        'existing.key': 'value',
      };

      const updated = Extension.set(extensions, 'ai_assistant.vectorIndexed', true);
      
      expect(updated).toEqual({
        'existing.key': 'value',
        'ai_assistant.vectorIndexed': true,
      });
    });

    it('should create extensions map if undefined', () => {
      const updated = Extension.set(undefined, 'ai_assistant.vectorIndexed', true);
      
      expect(updated).toEqual({
        'ai_assistant.vectorIndexed': true,
      });
    });

    it('should overwrite existing value', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': false,
      };

      const updated = Extension.set(extensions, 'ai_assistant.vectorIndexed', true);
      
      expect(updated['ai_assistant.vectorIndexed']).toBe(true);
    });

    it('should not mutate original extensions', () => {
      const extensions: ExtensionsMap = {
        'existing.key': 'value',
      };

      const updated = Extension.set(extensions, 'new.key', 'new value');
      
      expect(extensions).toEqual({ 'existing.key': 'value' });
      expect(updated).toEqual({
        'existing.key': 'value',
        'new.key': 'new value',
      });
    });
  });

  describe('Extension.has', () => {
    it('should return true if extension exists', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
      };

      expect(Extension.has(extensions, 'ai_assistant.vectorIndexed')).toBe(true);
    });

    it('should return false if extension does not exist', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
      };

      expect(Extension.has(extensions, 'nonexistent.key')).toBe(false);
    });

    it('should return false if extensions is undefined', () => {
      expect(Extension.has(undefined, 'ai_assistant.vectorIndexed')).toBe(false);
    });

    it('should return true even if value is falsy', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': false,
        'ai_assistant.nullValue': null,
        'ai_assistant.zeroValue': 0,
      };

      expect(Extension.has(extensions, 'ai_assistant.vectorIndexed')).toBe(true);
      expect(Extension.has(extensions, 'ai_assistant.nullValue')).toBe(true);
      expect(Extension.has(extensions, 'ai_assistant.zeroValue')).toBe(true);
    });
  });

  describe('Extension.remove', () => {
    it('should remove extension', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
      };

      const updated = Extension.remove(extensions, 'ai_assistant.vectorIndexed');
      
      expect(updated).toEqual({
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
      });
    });

    it('should return undefined if last extension removed', () => {
      const extensions: ExtensionsMap = {
        'ai_assistant.vectorIndexed': true,
      };

      const updated = Extension.remove(extensions, 'ai_assistant.vectorIndexed');
      
      expect(updated).toBeUndefined();
    });

    it('should return undefined if extensions is undefined', () => {
      const updated = Extension.remove(undefined, 'ai_assistant.vectorIndexed');
      
      expect(updated).toBeUndefined();
    });

    it('should not mutate original extensions', () => {
      const extensions: ExtensionsMap = {
        'key1': 'value1',
        'key2': 'value2',
      };

      const updated = Extension.remove(extensions, 'key1');
      
      expect(extensions).toEqual({
        'key1': 'value1',
        'key2': 'value2',
      });
      expect(updated).toEqual({
        'key2': 'value2',
      });
    });
  });
});
