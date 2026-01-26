import { z } from 'zod';

/**
 * Metadata Extension Schema
 * 
 * Defines the protocol for extending standard metadata definitions.
 * This allows plugins and extensions to add custom properties to Objects, Fields, and other metadata.
 * 
 * Best Practice: Extension Namespacing
 * - Use dot notation for namespace: `plugin_id.property_name`
 * - Example: `ai_assistant.vectorIndexed`, `crm_sync.salesforceField`
 * 
 * @example
 * // Field with AI extensions
 * const field = {
 *   name: 'description',
 *   type: 'textarea',
 *   extensions: {
 *     'ai_assistant.vectorIndexed': true,
 *     'ai_assistant.embeddingModel': 'text-embedding-3-small',
 *     'ai_assistant.chunkSize': 512
 *   }
 * };
 * 
 * @example
 * // Object with AI extensions
 * const object = {
 *   name: 'customer',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.enableRAG': true,
 *     'ai_assistant.contextFields': ['name', 'description', 'notes'],
 *     'workflow_engine.autoApprovalRules': [...]
 *   }
 * };
 */

/**
 * Extension Value Schema
 * 
 * Represents a single extension property.
 * Can be any valid JSON value: primitive, object, or array.
 */
export const ExtensionValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.any()),
  z.record(z.any()),
]);

export type ExtensionValue = z.infer<typeof ExtensionValueSchema>;

/**
 * Extensions Map Schema
 * 
 * A record of extension properties keyed by namespaced identifiers.
 * 
 * Convention:
 * - Keys should use dot notation: `namespace.property`
 * - Namespace should typically be the plugin/module ID
 * - Property should be camelCase
 * 
 * @example
 * {
 *   'ai_assistant.vectorIndexed': true,
 *   'ai_assistant.embeddingModel': 'text-embedding-3-small',
 *   'crm_sync.salesforceId': 'Contact.Email__c',
 *   'workflow_engine.triggers': ['onCreate', 'onUpdate']
 * }
 */
export const ExtensionsMapSchema = z.record(
  z.string().describe('Namespaced extension key (e.g., "plugin_id.property_name")'),
  z.any().describe('Extension value (string, number, boolean, object, or array)')
).optional().describe('Custom extension properties from plugins and modules');

export type ExtensionsMap = z.infer<typeof ExtensionsMapSchema>;

/**
 * Extension Definition Schema
 * 
 * Defines metadata about an extension field.
 * Plugins can register these definitions to document their extensions.
 * 
 * @example
 * const aiVectorExtension: ExtensionDefinition = {
 *   key: 'ai_assistant.vectorIndexed',
 *   pluginId: 'ai_assistant',
 *   label: 'Vector Indexed',
 *   description: 'Whether this field should be indexed for vector search',
 *   type: 'boolean',
 *   default: false,
 *   appliesTo: ['field'],
 *   fieldTypes: ['text', 'textarea', 'markdown']
 * };
 */
export const ExtensionDefinitionSchema = z.object({
  /** 
   * Full namespaced key for this extension.
   * Convention: `plugin_id.property_name`
   */
  key: z.string()
    .regex(/^[a-z_][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$/)
    .describe('Fully qualified extension key (e.g., "ai_assistant.vectorIndexed")'),

  /**
   * Plugin or module that provides this extension
   */
  pluginId: z.string().describe('ID of the plugin providing this extension'),

  /**
   * Human-readable label
   */
  label: z.string().describe('Display label for the extension property'),

  /**
   * Description of what this extension does
   */
  description: z.string().optional().describe('Detailed description of the extension'),

  /**
   * Expected data type for the extension value
   */
  type: z.enum([
    'string', 'number', 'boolean', 'object', 'array', 'any'
  ]).describe('Expected data type for this extension'),

  /**
   * Default value if not specified
   */
  default: z.any().optional().describe('Default value for this extension'),

  /**
   * Which metadata types this extension can be applied to
   */
  appliesTo: z.array(z.enum([
    'object', 'field', 'view', 'app', 'dashboard', 'report', 'action', 'workflow'
  ])).describe('Metadata types this extension can be applied to'),

  /**
   * For field extensions: which field types support this extension
   */
  fieldTypes: z.array(z.string()).optional().describe('Applicable field types (for field extensions)'),

  /**
   * Whether this extension is required
   */
  required: z.boolean().default(false).describe('Whether this extension is required'),

  /**
   * JSON Schema for validating the extension value
   */
  schema: z.any().optional().describe('JSON Schema for advanced validation'),
});

export type ExtensionDefinition = z.infer<typeof ExtensionDefinitionSchema>;

/**
 * Extension Registry Schema
 * 
 * A registry of all available extensions in the system.
 * Plugins register their extension definitions here.
 * 
 * @example
 * const registry: ExtensionRegistry = {
 *   extensions: {
 *     'ai_assistant.vectorIndexed': {
 *       key: 'ai_assistant.vectorIndexed',
 *       pluginId: 'ai_assistant',
 *       label: 'Vector Indexed',
 *       type: 'boolean',
 *       appliesTo: ['field']
 *     },
 *     'ai_assistant.enableRAG': {
 *       key: 'ai_assistant.enableRAG',
 *       pluginId: 'ai_assistant',
 *       label: 'Enable RAG',
 *       type: 'boolean',
 *       appliesTo: ['object']
 *     }
 *   }
 * };
 */
export const ExtensionRegistrySchema = z.object({
  /**
   * Map of extension definitions keyed by their full key
   */
  extensions: z.record(
    z.string(),
    ExtensionDefinitionSchema
  ).describe('Registry of available extension definitions'),
});

export type ExtensionRegistry = z.infer<typeof ExtensionRegistrySchema>;

/**
 * Extension Helper Functions
 */
export const Extension = {
  /**
   * Create a namespaced extension key
   * 
   * @param pluginId - Plugin identifier (snake_case)
   * @param property - Property name (camelCase)
   * @returns Namespaced key
   * 
   * @example
   * Extension.key('ai_assistant', 'vectorIndexed') // 'ai_assistant.vectorIndexed'
   */
  key: (pluginId: string, property: string): string => `${pluginId}.${property}`,

  /**
   * Get extension value with type safety
   * 
   * @param extensions - Extensions map
   * @param key - Extension key
   * @param defaultValue - Default value if not found
   * @returns Extension value or default
   * 
   * @example
   * Extension.get(field.extensions, 'ai_assistant.vectorIndexed', false)
   */
  get: <T = any>(extensions: ExtensionsMap | undefined, key: string, defaultValue?: T): T | undefined => {
    if (!extensions) return defaultValue;
    return (extensions[key] as T) ?? defaultValue;
  },

  /**
   * Set extension value
   * 
   * @param extensions - Extensions map (or undefined)
   * @param key - Extension key
   * @param value - Extension value
   * @returns Updated extensions map
   * 
   * @example
   * field.extensions = Extension.set(field.extensions, 'ai_assistant.vectorIndexed', true)
   */
  set: (extensions: ExtensionsMap | undefined, key: string, value: any): ExtensionsMap => {
    return { ...extensions, [key]: value };
  },

  /**
   * Check if extension exists
   * 
   * @param extensions - Extensions map
   * @param key - Extension key
   * @returns Whether the extension exists
   * 
   * @example
   * Extension.has(field.extensions, 'ai_assistant.vectorIndexed')
   */
  has: (extensions: ExtensionsMap | undefined, key: string): boolean => {
    return extensions ? key in extensions : false;
  },

  /**
   * Remove extension
   * 
   * @param extensions - Extensions map
   * @param key - Extension key
   * @returns Updated extensions map
   * 
   * @example
   * field.extensions = Extension.remove(field.extensions, 'ai_assistant.vectorIndexed')
   */
  remove: (extensions: ExtensionsMap | undefined, key: string): ExtensionsMap | undefined => {
    if (!extensions) return undefined;
    const { [key]: _, ...rest } = extensions;
    return Object.keys(rest).length > 0 ? rest : undefined;
  },
};
