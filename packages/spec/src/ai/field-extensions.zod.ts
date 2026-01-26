import { z } from 'zod';
import { type ExtensionDefinition } from '../system/extension.zod';

/**
 * AI Field Extensions
 * 
 * Defines AI-specific extension properties for fields.
 * These extensions enable vector indexing, semantic search, and RAG capabilities.
 * 
 * Usage: Add to field.extensions with 'ai_assistant.' prefix
 */

/**
 * Vector Indexing Extension
 * 
 * Enables this field to be indexed for vector/semantic search.
 * 
 * @example
 * {
 *   name: 'description',
 *   type: 'textarea',
 *   extensions: {
 *     'ai_assistant.vectorIndexed': true,
 *     'ai_assistant.embeddingModel': 'text-embedding-3-small',
 *     'ai_assistant.chunkSize': 512,
 *     'ai_assistant.chunkOverlap': 50
 *   }
 * }
 */
export const VectorIndexedExtension: ExtensionDefinition = {
  key: 'ai_assistant.vectorIndexed',
  pluginId: 'ai_assistant',
  label: 'Vector Indexed',
  description: 'Enable vector indexing for semantic search on this field',
  type: 'boolean',
  default: false,
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Embedding Model Extension
 * 
 * Specifies which embedding model to use for this field.
 */
export const EmbeddingModelExtension: ExtensionDefinition = {
  key: 'ai_assistant.embeddingModel',
  pluginId: 'ai_assistant',
  label: 'Embedding Model',
  description: 'The embedding model to use for vector indexing',
  type: 'string',
  default: 'text-embedding-3-small',
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Chunk Size Extension
 * 
 * Specifies the chunk size for text splitting during vector indexing.
 */
export const ChunkSizeExtension: ExtensionDefinition = {
  key: 'ai_assistant.chunkSize',
  pluginId: 'ai_assistant',
  label: 'Chunk Size',
  description: 'Maximum chunk size for text splitting (in tokens)',
  type: 'number',
  default: 512,
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Chunk Overlap Extension
 * 
 * Specifies the overlap between chunks for better context preservation.
 */
export const ChunkOverlapExtension: ExtensionDefinition = {
  key: 'ai_assistant.chunkOverlap',
  pluginId: 'ai_assistant',
  label: 'Chunk Overlap',
  description: 'Overlap size between consecutive chunks (in tokens)',
  type: 'number',
  default: 50,
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Auto-summarization Extension
 * 
 * Enables automatic summarization of long text fields.
 * 
 * @example
 * {
 *   name: 'case_notes',
 *   type: 'textarea',
 *   extensions: {
 *     'ai_assistant.autoSummarize': true,
 *     'ai_assistant.summaryModel': 'gpt-4o-mini',
 *     'ai_assistant.summaryMaxLength': 200
 *   }
 * }
 */
export const AutoSummarizeExtension: ExtensionDefinition = {
  key: 'ai_assistant.autoSummarize',
  pluginId: 'ai_assistant',
  label: 'Auto Summarize',
  description: 'Automatically generate summaries of long text content',
  type: 'boolean',
  default: false,
  appliesTo: ['field'],
  fieldTypes: ['textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Summary Model Extension
 */
export const SummaryModelExtension: ExtensionDefinition = {
  key: 'ai_assistant.summaryModel',
  pluginId: 'ai_assistant',
  label: 'Summary Model',
  description: 'The LLM model to use for summarization',
  type: 'string',
  default: 'gpt-4o-mini',
  appliesTo: ['field'],
  fieldTypes: ['textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Summary Max Length Extension
 */
export const SummaryMaxLengthExtension: ExtensionDefinition = {
  key: 'ai_assistant.summaryMaxLength',
  pluginId: 'ai_assistant',
  label: 'Summary Max Length',
  description: 'Maximum length of generated summary (in characters)',
  type: 'number',
  default: 200,
  appliesTo: ['field'],
  fieldTypes: ['textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Sentiment Analysis Extension
 * 
 * Enables sentiment analysis on text fields.
 * 
 * @example
 * {
 *   name: 'customer_feedback',
 *   type: 'textarea',
 *   extensions: {
 *     'ai_assistant.sentimentAnalysis': true,
 *     'ai_assistant.sentimentField': 'sentiment_score'
 *   }
 * }
 */
export const SentimentAnalysisExtension: ExtensionDefinition = {
  key: 'ai_assistant.sentimentAnalysis',
  pluginId: 'ai_assistant',
  label: 'Sentiment Analysis',
  description: 'Analyze sentiment of text content',
  type: 'boolean',
  default: false,
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * Sentiment Field Extension
 * 
 * Specifies the field where sentiment score should be stored.
 */
export const SentimentFieldExtension: ExtensionDefinition = {
  key: 'ai_assistant.sentimentField',
  pluginId: 'ai_assistant',
  label: 'Sentiment Field',
  description: 'Field name to store computed sentiment score',
  type: 'string',
  appliesTo: ['field'],
  fieldTypes: ['text', 'textarea', 'markdown', 'html', 'richtext'],
  required: false,
};

/**
 * AI Field Extensions Registry
 */
export const AIFieldExtensions = {
  VectorIndexedExtension,
  EmbeddingModelExtension,
  ChunkSizeExtension,
  ChunkOverlapExtension,
  AutoSummarizeExtension,
  SummaryModelExtension,
  SummaryMaxLengthExtension,
  SentimentAnalysisExtension,
  SentimentFieldExtension,
};

/**
 * AI Field Extension Schema
 * 
 * Zod schema for AI field extensions.
 * This can be used for runtime validation.
 */
export const AIFieldExtensionSchema = z.object({
  'ai_assistant.vectorIndexed': z.boolean().optional(),
  'ai_assistant.embeddingModel': z.string().optional(),
  'ai_assistant.chunkSize': z.number().optional(),
  'ai_assistant.chunkOverlap': z.number().optional(),
  'ai_assistant.autoSummarize': z.boolean().optional(),
  'ai_assistant.summaryModel': z.string().optional(),
  'ai_assistant.summaryMaxLength': z.number().optional(),
  'ai_assistant.sentimentAnalysis': z.boolean().optional(),
  'ai_assistant.sentimentField': z.string().optional(),
}).partial();

export type AIFieldExtension = z.infer<typeof AIFieldExtensionSchema>;
