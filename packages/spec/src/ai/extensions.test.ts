import { describe, it, expect } from 'vitest';
import {
  AIFieldExtensions,
  AIFieldExtensionSchema,
  type AIFieldExtension,
} from './field-extensions.zod';
import {
  AIObjectExtensions,
  AIObjectExtensionSchema,
  type AIObjectExtension,
} from './object-extensions.zod';
import { FieldSchema, type Field } from '../data/field.zod';
import { ObjectSchema, type ServiceObject } from '../data/object.zod';
import { Extension } from '../system/extension.zod';

describe('AI Field Extensions', () => {
  describe('Extension Definitions', () => {
    it('should have valid vector indexed extension', () => {
      const ext = AIFieldExtensions.VectorIndexedExtension;
      expect(ext.key).toBe('ai_assistant.vectorIndexed');
      expect(ext.pluginId).toBe('ai_assistant');
      expect(ext.type).toBe('boolean');
      expect(ext.appliesTo).toContain('field');
    });

    it('should have valid embedding model extension', () => {
      const ext = AIFieldExtensions.EmbeddingModelExtension;
      expect(ext.key).toBe('ai_assistant.embeddingModel');
      expect(ext.default).toBe('text-embedding-3-small');
    });

    it('should have valid auto-summarize extension', () => {
      const ext = AIFieldExtensions.AutoSummarizeExtension;
      expect(ext.key).toBe('ai_assistant.autoSummarize');
      expect(ext.fieldTypes).toContain('textarea');
    });
  });

  describe('Field with AI Extensions', () => {
    it('should accept field with vector indexing enabled', () => {
      const field: Field = {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        extensions: {
          'ai_assistant.vectorIndexed': true,
          'ai_assistant.embeddingModel': 'text-embedding-3-small',
          'ai_assistant.chunkSize': 512,
          'ai_assistant.chunkOverlap': 50,
        },
      };

      expect(() => FieldSchema.parse(field)).not.toThrow();
      
      const vectorIndexed = Extension.get(field.extensions, 'ai_assistant.vectorIndexed');
      expect(vectorIndexed).toBe(true);
      
      const embeddingModel = Extension.get(field.extensions, 'ai_assistant.embeddingModel');
      expect(embeddingModel).toBe('text-embedding-3-small');
    });

    it('should accept field with auto-summarization', () => {
      const field: Field = {
        name: 'case_notes',
        label: 'Case Notes',
        type: 'textarea',
        extensions: {
          'ai_assistant.autoSummarize': true,
          'ai_assistant.summaryModel': 'gpt-4o-mini',
          'ai_assistant.summaryMaxLength': 200,
        },
      };

      expect(() => FieldSchema.parse(field)).not.toThrow();
      
      const autoSummarize = Extension.get(field.extensions, 'ai_assistant.autoSummarize');
      expect(autoSummarize).toBe(true);
    });

    it('should accept field with sentiment analysis', () => {
      const field: Field = {
        name: 'customer_feedback',
        label: 'Customer Feedback',
        type: 'textarea',
        extensions: {
          'ai_assistant.sentimentAnalysis': true,
          'ai_assistant.sentimentField': 'sentiment_score',
        },
      };

      expect(() => FieldSchema.parse(field)).not.toThrow();
    });

    it('should work with Extension helper functions', () => {
      let extensions = Extension.set(undefined, 'ai_assistant.vectorIndexed', true);
      extensions = Extension.set(extensions, 'ai_assistant.embeddingModel', 'text-embedding-3-small');
      extensions = Extension.set(extensions, 'ai_assistant.chunkSize', 512);

      expect(Extension.has(extensions, 'ai_assistant.vectorIndexed')).toBe(true);
      expect(Extension.get(extensions, 'ai_assistant.chunkSize')).toBe(512);
    });
  });

  describe('AI Field Extension Schema', () => {
    it('should validate AI field extensions', () => {
      const extensions: AIFieldExtension = {
        'ai_assistant.vectorIndexed': true,
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
        'ai_assistant.chunkSize': 512,
      };

      expect(() => AIFieldExtensionSchema.parse(extensions)).not.toThrow();
    });

    it('should accept partial extensions', () => {
      const extensions: AIFieldExtension = {
        'ai_assistant.vectorIndexed': true,
      };

      expect(() => AIFieldExtensionSchema.parse(extensions)).not.toThrow();
    });

    it('should accept empty extensions', () => {
      expect(() => AIFieldExtensionSchema.parse({})).not.toThrow();
    });
  });
});

describe('AI Object Extensions', () => {
  describe('Extension Definitions', () => {
    it('should have valid enable RAG extension', () => {
      const ext = AIObjectExtensions.EnableRAGExtension;
      expect(ext.key).toBe('ai_assistant.enableRAG');
      expect(ext.pluginId).toBe('ai_assistant');
      expect(ext.type).toBe('boolean');
      expect(ext.appliesTo).toContain('object');
    });

    it('should have valid agent enabled extension', () => {
      const ext = AIObjectExtensions.AgentEnabledExtension;
      expect(ext.key).toBe('ai_assistant.agentEnabled');
      expect(ext.default).toBe(false);
    });

    it('should have valid predictive enabled extension', () => {
      const ext = AIObjectExtensions.PredictiveEnabledExtension;
      expect(ext.key).toBe('ai_assistant.predictiveEnabled');
    });
  });

  describe('Object with AI Extensions', () => {
    it('should accept object with RAG enabled', () => {
      const object: ServiceObject = {
        name: 'knowledge_article',
        label: 'Knowledge Article',
        fields: {
          title: { type: 'text', label: 'Title' },
          content: { type: 'textarea', label: 'Content' },
        },
        extensions: {
          'ai_assistant.enableRAG': true,
          'ai_assistant.contextFields': ['title', 'content'],
          'ai_assistant.vectorIndex': 'knowledge_base_v1',
          'ai_assistant.embeddingModel': 'text-embedding-3-small',
        },
      };

      expect(() => ObjectSchema.parse(object)).not.toThrow();
      
      const enableRAG = Extension.get(object.extensions, 'ai_assistant.enableRAG');
      expect(enableRAG).toBe(true);
      
      const contextFields = Extension.get<string[]>(object.extensions, 'ai_assistant.contextFields');
      expect(contextFields).toEqual(['title', 'content']);
    });

    it('should accept object with AI agent', () => {
      const object: ServiceObject = {
        name: 'support_case',
        label: 'Support Case',
        fields: {},
        extensions: {
          'ai_assistant.agentEnabled': true,
          'ai_assistant.agentName': 'support_assistant',
          'ai_assistant.agentTriggers': ['onCreate', 'onUpdate'],
        },
      };

      expect(() => ObjectSchema.parse(object)).not.toThrow();
    });

    it('should accept object with predictive analytics', () => {
      const object: ServiceObject = {
        name: 'opportunity',
        label: 'Opportunity',
        fields: {},
        extensions: {
          'ai_assistant.predictiveEnabled': true,
          'ai_assistant.predictiveModels': [
            {
              name: 'win_probability',
              type: 'classification',
              targetField: 'stage',
              features: ['amount', 'duration', 'competitor_count'],
            },
          ],
        },
      };

      expect(() => ObjectSchema.parse(object)).not.toThrow();
    });

    it('should accept object with auto-classification', () => {
      const object: ServiceObject = {
        name: 'email',
        label: 'Email',
        fields: {},
        extensions: {
          'ai_assistant.autoClassification': true,
          'ai_assistant.classificationField': 'category',
          'ai_assistant.classificationModel': 'gpt-4o-mini',
          'ai_assistant.classificationPrompt': 'Classify this email into: Support, Sales, or General',
        },
      };

      expect(() => ObjectSchema.parse(object)).not.toThrow();
    });

    it('should accept object with data quality checks', () => {
      const object: ServiceObject = {
        name: 'account',
        label: 'Account',
        fields: {},
        extensions: {
          'ai_assistant.dataQualityEnabled': true,
          'ai_assistant.dataQualityRules': [
            {
              type: 'completeness',
              fields: ['name', 'email', 'phone'],
              threshold: 0.8,
            },
            {
              type: 'consistency',
              checkDuplicates: true,
            },
          ],
        },
      };

      expect(() => ObjectSchema.parse(object)).not.toThrow();
    });

    it('should work with Extension helper functions', () => {
      let extensions = Extension.set(undefined, 'ai_assistant.enableRAG', true);
      extensions = Extension.set(extensions, 'ai_assistant.contextFields', ['title', 'content']);
      extensions = Extension.set(extensions, 'ai_assistant.vectorIndex', 'knowledge_v1');

      expect(Extension.has(extensions, 'ai_assistant.enableRAG')).toBe(true);
      expect(Extension.get(extensions, 'ai_assistant.vectorIndex')).toBe('knowledge_v1');
    });
  });

  describe('AI Object Extension Schema', () => {
    it('should validate AI object extensions', () => {
      const extensions: AIObjectExtension = {
        'ai_assistant.enableRAG': true,
        'ai_assistant.contextFields': ['title', 'content'],
        'ai_assistant.vectorIndex': 'knowledge_v1',
      };

      expect(() => AIObjectExtensionSchema.parse(extensions)).not.toThrow();
    });

    it('should accept partial extensions', () => {
      const extensions: AIObjectExtension = {
        'ai_assistant.enableRAG': true,
      };

      expect(() => AIObjectExtensionSchema.parse(extensions)).not.toThrow();
    });

    it('should accept empty extensions', () => {
      expect(() => AIObjectExtensionSchema.parse({})).not.toThrow();
    });
  });
});

describe('Complete Integration Example', () => {
  it('should create a complete AI-powered object with field extensions', () => {
    const object: ServiceObject = {
      name: 'customer_inquiry',
      label: 'Customer Inquiry',
      pluralLabel: 'Customer Inquiries',
      description: 'Customer support inquiries with AI assistance',
      icon: 'message-square',
      fields: {
        title: {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          extensions: {
            'ai_assistant.vectorIndexed': true,
            'ai_assistant.embeddingModel': 'text-embedding-3-small',
          },
        },
        description: {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          extensions: {
            'ai_assistant.vectorIndexed': true,
            'ai_assistant.embeddingModel': 'text-embedding-3-small',
            'ai_assistant.chunkSize': 512,
            'ai_assistant.autoSummarize': true,
            'ai_assistant.summaryModel': 'gpt-4o-mini',
          },
        },
        customer_feedback: {
          name: 'customer_feedback',
          label: 'Customer Feedback',
          type: 'textarea',
          extensions: {
            'ai_assistant.sentimentAnalysis': true,
            'ai_assistant.sentimentField': 'sentiment_score',
          },
        },
        sentiment_score: {
          name: 'sentiment_score',
          label: 'Sentiment Score',
          type: 'number',
          readonly: true,
        },
      },
      extensions: {
        'ai_assistant.enableRAG': true,
        'ai_assistant.contextFields': ['title', 'description'],
        'ai_assistant.vectorIndex': 'customer_inquiries_v1',
        'ai_assistant.agentEnabled': true,
        'ai_assistant.agentName': 'support_assistant',
        'ai_assistant.agentTriggers': ['onCreate', 'onUpdate'],
        'ai_assistant.autoClassification': true,
        'ai_assistant.classificationField': 'category',
        'ai_assistant.classificationModel': 'gpt-4o-mini',
      },
    };

    expect(() => ObjectSchema.parse(object)).not.toThrow();
    
    const parsed = ObjectSchema.parse(object);
    
    // Verify object-level extensions
    expect(Extension.get(parsed.extensions, 'ai_assistant.enableRAG')).toBe(true);
    expect(Extension.get(parsed.extensions, 'ai_assistant.agentEnabled')).toBe(true);
    
    // Verify field-level extensions
    const titleField = parsed.fields.title;
    expect(Extension.get(titleField.extensions, 'ai_assistant.vectorIndexed')).toBe(true);
    
    const descField = parsed.fields.description;
    expect(Extension.get(descField.extensions, 'ai_assistant.autoSummarize')).toBe(true);
    
    const feedbackField = parsed.fields.customer_feedback;
    expect(Extension.get(feedbackField.extensions, 'ai_assistant.sentimentAnalysis')).toBe(true);
  });
});
