import { z } from 'zod';
import { type ExtensionDefinition } from '../system/extension.zod';

/**
 * AI Object Extensions
 * 
 * Defines AI-specific extension properties for objects.
 * These extensions enable RAG, predictive analytics, and intelligent automation.
 * 
 * Usage: Add to object.extensions with 'ai_assistant.' prefix
 */

/**
 * Enable RAG Extension
 * 
 * Enables Retrieval-Augmented Generation for this object.
 * When enabled, records from this object can be used as context for AI agents.
 * 
 * @example
 * {
 *   name: 'knowledge_article',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.enableRAG': true,
 *     'ai_assistant.contextFields': ['title', 'content', 'summary'],
 *     'ai_assistant.vectorIndex': 'knowledge_base_v1',
 *     'ai_assistant.embeddingModel': 'text-embedding-3-small'
 *   }
 * }
 */
export const EnableRAGExtension: ExtensionDefinition = {
  key: 'ai_assistant.enableRAG',
  pluginId: 'ai_assistant',
  label: 'Enable RAG',
  description: 'Enable Retrieval-Augmented Generation for this object',
  type: 'boolean',
  default: false,
  appliesTo: ['object'],
  required: false,
};

/**
 * Context Fields Extension
 * 
 * Specifies which fields should be included in RAG context.
 */
export const ContextFieldsExtension: ExtensionDefinition = {
  key: 'ai_assistant.contextFields',
  pluginId: 'ai_assistant',
  label: 'Context Fields',
  description: 'Fields to include in RAG context (array of field names)',
  type: 'array',
  appliesTo: ['object'],
  required: false,
};

/**
 * Vector Index Extension
 * 
 * Specifies the vector index name for this object.
 */
export const VectorIndexExtension: ExtensionDefinition = {
  key: 'ai_assistant.vectorIndex',
  pluginId: 'ai_assistant',
  label: 'Vector Index',
  description: 'Name of the vector index for this object',
  type: 'string',
  appliesTo: ['object'],
  required: false,
};

/**
 * Object Embedding Model Extension
 * 
 * Specifies the embedding model for object-level RAG.
 */
export const ObjectEmbeddingModelExtension: ExtensionDefinition = {
  key: 'ai_assistant.embeddingModel',
  pluginId: 'ai_assistant',
  label: 'Embedding Model',
  description: 'The embedding model to use for this object',
  type: 'string',
  default: 'text-embedding-3-small',
  appliesTo: ['object'],
  required: false,
};

/**
 * AI Agent Extension
 * 
 * Associates an AI agent with this object for intelligent assistance.
 * 
 * @example
 * {
 *   name: 'support_case',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.agentEnabled': true,
 *     'ai_assistant.agentName': 'support_assistant',
 *     'ai_assistant.agentTriggers': ['onCreate', 'onUpdate']
 *   }
 * }
 */
export const AgentEnabledExtension: ExtensionDefinition = {
  key: 'ai_assistant.agentEnabled',
  pluginId: 'ai_assistant',
  label: 'Agent Enabled',
  description: 'Enable AI agent assistance for this object',
  type: 'boolean',
  default: false,
  appliesTo: ['object'],
  required: false,
};

/**
 * Agent Name Extension
 */
export const AgentNameExtension: ExtensionDefinition = {
  key: 'ai_assistant.agentName',
  pluginId: 'ai_assistant',
  label: 'Agent Name',
  description: 'The AI agent to use for this object',
  type: 'string',
  appliesTo: ['object'],
  required: false,
};

/**
 * Agent Triggers Extension
 */
export const AgentTriggersExtension: ExtensionDefinition = {
  key: 'ai_assistant.agentTriggers',
  pluginId: 'ai_assistant',
  label: 'Agent Triggers',
  description: 'Events that trigger the AI agent (e.g., onCreate, onUpdate)',
  type: 'array',
  appliesTo: ['object'],
  required: false,
};

/**
 * Predictive Analytics Extension
 * 
 * Enables predictive models for this object.
 * 
 * @example
 * {
 *   name: 'opportunity',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.predictiveEnabled': true,
 *     'ai_assistant.predictiveModels': [
 *       {
 *         name: 'win_probability',
 *         type: 'classification',
 *         targetField: 'stage',
 *         features: ['amount', 'duration', 'competitor_count']
 *       }
 *     ]
 *   }
 * }
 */
export const PredictiveEnabledExtension: ExtensionDefinition = {
  key: 'ai_assistant.predictiveEnabled',
  pluginId: 'ai_assistant',
  label: 'Predictive Enabled',
  description: 'Enable predictive analytics for this object',
  type: 'boolean',
  default: false,
  appliesTo: ['object'],
  required: false,
};

/**
 * Predictive Models Extension
 */
export const PredictiveModelsExtension: ExtensionDefinition = {
  key: 'ai_assistant.predictiveModels',
  pluginId: 'ai_assistant',
  label: 'Predictive Models',
  description: 'Configuration for predictive models',
  type: 'array',
  appliesTo: ['object'],
  required: false,
};

/**
 * Auto-classification Extension
 * 
 * Enables automatic classification of records.
 * 
 * @example
 * {
 *   name: 'email',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.autoClassification': true,
 *     'ai_assistant.classificationField': 'category',
 *     'ai_assistant.classificationModel': 'gpt-4o-mini',
 *     'ai_assistant.classificationPrompt': 'Classify this email into: Support, Sales, or General'
 *   }
 * }
 */
export const AutoClassificationExtension: ExtensionDefinition = {
  key: 'ai_assistant.autoClassification',
  pluginId: 'ai_assistant',
  label: 'Auto Classification',
  description: 'Automatically classify records using AI',
  type: 'boolean',
  default: false,
  appliesTo: ['object'],
  required: false,
};

/**
 * Classification Field Extension
 */
export const ClassificationFieldExtension: ExtensionDefinition = {
  key: 'ai_assistant.classificationField',
  pluginId: 'ai_assistant',
  label: 'Classification Field',
  description: 'Field to store the classification result',
  type: 'string',
  appliesTo: ['object'],
  required: false,
};

/**
 * Classification Model Extension
 */
export const ClassificationModelExtension: ExtensionDefinition = {
  key: 'ai_assistant.classificationModel',
  pluginId: 'ai_assistant',
  label: 'Classification Model',
  description: 'The LLM model to use for classification',
  type: 'string',
  default: 'gpt-4o-mini',
  appliesTo: ['object'],
  required: false,
};

/**
 * Classification Prompt Extension
 */
export const ClassificationPromptExtension: ExtensionDefinition = {
  key: 'ai_assistant.classificationPrompt',
  pluginId: 'ai_assistant',
  label: 'Classification Prompt',
  description: 'The prompt template for classification',
  type: 'string',
  appliesTo: ['object'],
  required: false,
};

/**
 * Intelligent Data Quality Extension
 * 
 * Enables AI-powered data quality checks.
 * 
 * @example
 * {
 *   name: 'account',
 *   fields: { ... },
 *   extensions: {
 *     'ai_assistant.dataQualityEnabled': true,
 *     'ai_assistant.dataQualityRules': [
 *       {
 *         type: 'completeness',
 *         fields: ['name', 'email', 'phone'],
 *         threshold: 0.8
 *       },
 *       {
 *         type: 'consistency',
 *         checkDuplicates: true
 *       }
 *     ]
 *   }
 * }
 */
export const DataQualityEnabledExtension: ExtensionDefinition = {
  key: 'ai_assistant.dataQualityEnabled',
  pluginId: 'ai_assistant',
  label: 'Data Quality Enabled',
  description: 'Enable AI-powered data quality checks',
  type: 'boolean',
  default: false,
  appliesTo: ['object'],
  required: false,
};

/**
 * Data Quality Rules Extension
 */
export const DataQualityRulesExtension: ExtensionDefinition = {
  key: 'ai_assistant.dataQualityRules',
  pluginId: 'ai_assistant',
  label: 'Data Quality Rules',
  description: 'Configuration for data quality rules',
  type: 'array',
  appliesTo: ['object'],
  required: false,
};

/**
 * AI Object Extensions Registry
 */
export const AIObjectExtensions = {
  EnableRAGExtension,
  ContextFieldsExtension,
  VectorIndexExtension,
  ObjectEmbeddingModelExtension,
  AgentEnabledExtension,
  AgentNameExtension,
  AgentTriggersExtension,
  PredictiveEnabledExtension,
  PredictiveModelsExtension,
  AutoClassificationExtension,
  ClassificationFieldExtension,
  ClassificationModelExtension,
  ClassificationPromptExtension,
  DataQualityEnabledExtension,
  DataQualityRulesExtension,
};

/**
 * AI Object Extension Schema
 * 
 * Zod schema for AI object extensions.
 * This can be used for runtime validation.
 */
export const AIObjectExtensionSchema = z.object({
  'ai_assistant.enableRAG': z.boolean(),
  'ai_assistant.contextFields': z.array(z.string()),
  'ai_assistant.vectorIndex': z.string(),
  'ai_assistant.embeddingModel': z.string(),
  'ai_assistant.agentEnabled': z.boolean(),
  'ai_assistant.agentName': z.string(),
  'ai_assistant.agentTriggers': z.array(z.string()),
  'ai_assistant.predictiveEnabled': z.boolean(),
  'ai_assistant.predictiveModels': z.array(z.any()),
  'ai_assistant.autoClassification': z.boolean(),
  'ai_assistant.classificationField': z.string(),
  'ai_assistant.classificationModel': z.string(),
  'ai_assistant.classificationPrompt': z.string(),
  'ai_assistant.dataQualityEnabled': z.boolean(),
  'ai_assistant.dataQualityRules': z.array(z.any()),
}).partial();

export type AIObjectExtension = z.infer<typeof AIObjectExtensionSchema>;
