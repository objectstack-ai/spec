/**
 * AI-Powered Customer Service Example
 * 
 * Demonstrates ObjectStack metadata extensions for AI capabilities
 */

import { ObjectSchema, Extension } from '@objectstack/spec';

// Customer Inquiry Object with AI extensions
export const customerInquiryObject = {
  name: 'customer_inquiry',
  label: 'Customer Inquiry',
  fields: {
    title: {
      name: 'title',
      label: 'Title',
      type: 'text' as const,
      required: true,
      extensions: {
        'ai_assistant.vectorIndexed': true,
        'ai_assistant.embeddingModel': 'text-embedding-3-small',
      },
    },
    description: {
      name: 'description', 
      label: 'Description',
      type: 'textarea' as const,
      extensions: {
        'ai_assistant.vectorIndexed': true,
        'ai_assistant.autoSummarize': true,
      },
    },
  },
  extensions: {
    'ai_assistant.enableRAG': true,
    'ai_assistant.contextFields': ['title', 'description'],
    'ai_assistant.agentEnabled': true,
  },
};

// Validate
const validated = ObjectSchema.parse(customerInquiryObject);
console.log('✓ Schema validated with AI extensions');
console.log('RAG Enabled:', Extension.get(validated.extensions, 'ai_assistant.enableRAG'));
