import { describe, it, expect } from 'vitest';
import {
  ModelProviderSchema,
  ModelCapabilitySchema,
  ModelLimitsSchema,
  ModelPricingSchema,
  ModelConfigSchema,
  PromptVariableSchema,
  PromptTemplateSchema,
  ModelRegistryEntrySchema,
  ModelRegistrySchema,
  ModelSelectionCriteriaSchema,
  type ModelConfig,
  type PromptTemplate,
  type ModelRegistry,
} from './model-registry.zod';

describe('ModelProviderSchema', () => {
  it('should accept all valid providers', () => {
    const providers = ['openai', 'azure_openai', 'anthropic', 'google', 'cohere', 'huggingface', 'local', 'custom'] as const;
    
    providers.forEach(provider => {
      expect(() => ModelProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid providers', () => {
    expect(() => ModelProviderSchema.parse('invalid')).toThrow();
  });
});

describe('ModelCapabilitySchema', () => {
  it('should accept minimal capabilities', () => {
    const capabilities = {};
    const result = ModelCapabilitySchema.parse(capabilities);
    expect(result.textGeneration).toBe(true);
    expect(result.textEmbedding).toBe(false);
  });

  it('should accept full capabilities', () => {
    const capabilities = {
      textGeneration: true,
      textEmbedding: true,
      imageGeneration: true,
      imageUnderstanding: true,
      functionCalling: true,
      codeGeneration: true,
      reasoning: true,
    };
    expect(() => ModelCapabilitySchema.parse(capabilities)).not.toThrow();
  });
});

describe('ModelLimitsSchema', () => {
  it('should accept valid limits', () => {
    const limits = {
      maxTokens: 4096,
      contextWindow: 8192,
    };
    expect(() => ModelLimitsSchema.parse(limits)).not.toThrow();
  });

  it('should accept limits with rate limiting', () => {
    const limits = {
      maxTokens: 4096,
      contextWindow: 8192,
      maxOutputTokens: 2048,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 100000,
      },
    };
    expect(() => ModelLimitsSchema.parse(limits)).not.toThrow();
  });

  it('should reject negative values', () => {
    expect(() => ModelLimitsSchema.parse({
      maxTokens: -1,
      contextWindow: 8192,
    })).toThrow();
  });
});

describe('ModelPricingSchema', () => {
  it('should accept minimal pricing', () => {
    const pricing = {};
    const result = ModelPricingSchema.parse(pricing);
    expect(result.currency).toBe('USD');
  });

  it('should accept full pricing info', () => {
    const pricing = {
      currency: 'USD',
      inputCostPer1kTokens: 0.03,
      outputCostPer1kTokens: 0.06,
      embeddingCostPer1kTokens: 0.0001,
    };
    expect(() => ModelPricingSchema.parse(pricing)).not.toThrow();
  });
});

describe('ModelConfigSchema', () => {
  it('should accept minimal model config', () => {
    const model: ModelConfig = {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      version: 'gpt-4-turbo-2024-04-09',
      provider: 'openai',
      capabilities: {
        textGeneration: true,
        functionCalling: true,
      },
      limits: {
        maxTokens: 4096,
        contextWindow: 128000,
      },
    };
    expect(() => ModelConfigSchema.parse(model)).not.toThrow();
  });

  it('should accept full model config', () => {
    const model: ModelConfig = {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      version: 'claude-3-opus-20240229',
      provider: 'anthropic',
      capabilities: {
        textGeneration: true,
        imageUnderstanding: true,
        functionCalling: true,
        codeGeneration: true,
        reasoning: true,
      },
      limits: {
        maxTokens: 4096,
        contextWindow: 200000,
        maxOutputTokens: 4096,
      },
      pricing: {
        currency: 'USD',
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.075,
      },
      endpoint: 'https://api.anthropic.com/v1',
      apiKey: 'sk-ant-...',
      description: 'Most capable Claude model',
      tags: ['reasoning', 'coding', 'analysis'],
      recommendedFor: ['complex_reasoning', 'code_generation', 'long_context'],
    };
    expect(() => ModelConfigSchema.parse(model)).not.toThrow();
  });

  it('should accept embedding model', () => {
    const model: ModelConfig = {
      id: 'text-embedding-3-large',
      name: 'Text Embedding 3 Large',
      version: 'text-embedding-3-large',
      provider: 'openai',
      capabilities: {
        textGeneration: false,
        textEmbedding: true,
      },
      limits: {
        maxTokens: 8191,
        contextWindow: 8191,
      },
      pricing: {
        embeddingCostPer1kTokens: 0.00013,
      },
    };
    expect(() => ModelConfigSchema.parse(model)).not.toThrow();
  });
});

describe('PromptVariableSchema', () => {
  it('should accept minimal variable', () => {
    const variable = {
      name: 'user_name',
    };
    const result = PromptVariableSchema.parse(variable);
    expect(result.type).toBe('string');
    expect(result.required).toBe(false);
  });

  it('should accept full variable with validation', () => {
    const variable = {
      name: 'email',
      type: 'string' as const,
      required: true,
      description: 'User email address',
      validation: {
        pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
        maxLength: 100,
      },
    };
    expect(() => PromptVariableSchema.parse(variable)).not.toThrow();
  });
});

describe('PromptTemplateSchema', () => {
  it('should accept minimal prompt template', () => {
    const template: PromptTemplate = {
      id: 'template-1',
      name: 'support_response',
      label: 'Support Response',
      user: 'Customer question: {{question}}',
    };
    const result = PromptTemplateSchema.parse(template);
    expect(result.version).toBe('1.0.0');
  });

  it('should enforce snake_case for template name', () => {
    const validNames = ['support_agent', 'code_generator', 'data_analyst'];
    validNames.forEach(name => {
      expect(() => PromptTemplateSchema.parse({
        id: 'test',
        name,
        label: 'Test',
        user: 'test',
      })).not.toThrow();
    });

    const invalidNames = ['supportAgent', 'Support-Agent', '123template'];
    invalidNames.forEach(name => {
      expect(() => PromptTemplateSchema.parse({
        id: 'test',
        name,
        label: 'Test',
        user: 'test',
      })).toThrow();
    });
  });

  it('should accept full prompt template', () => {
    const template: PromptTemplate = {
      id: 'code-generator-v1',
      name: 'code_generator',
      label: 'Code Generator',
      system: 'You are an expert software engineer.',
      user: 'Generate {{language}} code for: {{description}}',
      assistant: 'Here is the code:',
      variables: [
        {
          name: 'language',
          type: 'string',
          required: true,
          validation: {
            enum: ['python', 'javascript', 'typescript', 'java'],
          },
        },
        {
          name: 'description',
          type: 'string',
          required: true,
          validation: {
            minLength: 10,
            maxLength: 500,
          },
        },
      ],
      modelId: 'gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      version: '1.0.0',
      description: 'Generate code from natural language description',
      category: 'code_generation',
      tags: ['coding', 'generation'],
      examples: [
        {
          input: {
            language: 'python',
            description: 'function to sort a list',
          },
          output: 'def sort_list(items):\n    return sorted(items)',
        },
      ],
    };
    expect(() => PromptTemplateSchema.parse(template)).not.toThrow();
  });

  it('should accept template with model parameters', () => {
    const template: PromptTemplate = {
      id: 'creative-writer',
      name: 'creative_writer',
      label: 'Creative Writer',
      user: 'Write a story about: {{topic}}',
      temperature: 1.2,
      maxTokens: 4096,
      topP: 0.95,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      stopSequences: ['THE END', '---'],
    };
    expect(() => PromptTemplateSchema.parse(template)).not.toThrow();
  });
});

describe('ModelRegistryEntrySchema', () => {
  it('should accept minimal registry entry', () => {
    const entry = {
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        version: 'gpt-4-0613',
        provider: 'openai',
        capabilities: {},
        limits: {
          maxTokens: 8192,
          contextWindow: 8192,
        },
      },
    };
    const result = ModelRegistryEntrySchema.parse(entry);
    expect(result.status).toBe('active');
    expect(result.priority).toBe(0);
  });

  it('should accept entry with fallbacks and health check', () => {
    const entry = {
      model: {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        version: 'gpt-4-turbo-2024-04-09',
        provider: 'openai',
        capabilities: {},
        limits: {
          maxTokens: 4096,
          contextWindow: 128000,
        },
      },
      status: 'active' as const,
      priority: 10,
      fallbackModels: ['gpt-4', 'gpt-3.5-turbo'],
      healthCheck: {
        enabled: true,
        intervalSeconds: 300,
        lastChecked: '2024-01-15T10:00:00Z',
        status: 'healthy' as const,
      },
    };
    expect(() => ModelRegistryEntrySchema.parse(entry)).not.toThrow();
  });
});

describe('ModelRegistrySchema', () => {
  it('should accept minimal registry', () => {
    const registry: ModelRegistry = {
      name: 'default',
      models: {
        'gpt-4': {
          model: {
            id: 'gpt-4',
            name: 'GPT-4',
            version: 'gpt-4-0613',
            provider: 'openai',
            capabilities: {},
            limits: {
              maxTokens: 8192,
              contextWindow: 8192,
            },
          },
        },
      },
    };
    const result = ModelRegistrySchema.parse(registry);
    expect(result.enableAutoFallback).toBe(true);
  });

  it('should accept full registry with templates', () => {
    const registry: ModelRegistry = {
      name: 'production',
      models: {
        'gpt-4-turbo': {
          model: {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            version: 'gpt-4-turbo-2024-04-09',
            provider: 'openai',
            capabilities: {
              textGeneration: true,
              functionCalling: true,
            },
            limits: {
              maxTokens: 4096,
              contextWindow: 128000,
            },
          },
          status: 'active',
          priority: 10,
        },
        'claude-3-opus': {
          model: {
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            version: 'claude-3-opus-20240229',
            provider: 'anthropic',
            capabilities: {
              textGeneration: true,
              reasoning: true,
            },
            limits: {
              maxTokens: 4096,
              contextWindow: 200000,
            },
          },
          status: 'active',
          priority: 5,
        },
      },
      promptTemplates: {
        support_agent: {
          id: 'support-1',
          name: 'support_agent',
          label: 'Support Agent',
          system: 'You are a helpful support agent.',
          user: 'Customer question: {{question}}',
          modelId: 'gpt-4-turbo',
        },
      },
      defaultModel: 'gpt-4-turbo',
      enableAutoFallback: true,
    };
    expect(() => ModelRegistrySchema.parse(registry)).not.toThrow();
  });
});

describe('ModelSelectionCriteriaSchema', () => {
  it('should accept minimal criteria', () => {
    const criteria = {};
    const result = ModelSelectionCriteriaSchema.parse(criteria);
    expect(result.excludeDeprecated).toBe(true);
  });

  it('should accept full criteria', () => {
    const criteria = {
      capabilities: ['textGeneration', 'functionCalling'],
      maxCostPer1kTokens: 0.05,
      minContextWindow: 32000,
      provider: 'openai' as const,
      tags: ['reasoning', 'coding'],
      excludeDeprecated: true,
    };
    expect(() => ModelSelectionCriteriaSchema.parse(criteria)).not.toThrow();
  });
});

describe('Real-World Model Registry Examples', () => {
  it('should accept enterprise model registry', () => {
    const registry: ModelRegistry = {
      name: 'enterprise-production',
      models: {
        'gpt-4-turbo': {
          model: {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            version: 'gpt-4-turbo-2024-04-09',
            provider: 'azure_openai',
            capabilities: {
              textGeneration: true,
              functionCalling: true,
              codeGeneration: true,
            },
            limits: {
              maxTokens: 4096,
              contextWindow: 128000,
              rateLimit: {
                requestsPerMinute: 100,
                tokensPerMinute: 150000,
              },
            },
            pricing: {
              inputCostPer1kTokens: 0.01,
              outputCostPer1kTokens: 0.03,
            },
            endpoint: 'https://mycompany.openai.azure.com',
            region: 'eastus',
            tags: ['production', 'general-purpose'],
          },
          status: 'active',
          priority: 10,
          fallbackModels: ['gpt-35-turbo'],
          healthCheck: {
            enabled: true,
            intervalSeconds: 180,
            status: 'healthy',
          },
        },
        'claude-3-opus': {
          model: {
            id: 'claude-3-opus',
            name: 'Claude 3 Opus',
            version: 'claude-3-opus-20240229',
            provider: 'anthropic',
            capabilities: {
              textGeneration: true,
              imageUnderstanding: true,
              reasoning: true,
            },
            limits: {
              maxTokens: 4096,
              contextWindow: 200000,
            },
            pricing: {
              inputCostPer1kTokens: 0.015,
              outputCostPer1kTokens: 0.075,
            },
            tags: ['analysis', 'reasoning'],
          },
          status: 'active',
          priority: 8,
        },
        'llama-70b': {
          model: {
            id: 'llama-70b',
            name: 'Llama 2 70B',
            version: '70b-chat-v2',
            provider: 'local',
            capabilities: {
              textGeneration: true,
            },
            limits: {
              maxTokens: 4096,
              contextWindow: 4096,
            },
            endpoint: 'http://localhost:8080/v1',
            tags: ['local', 'open-source'],
          },
          status: 'experimental',
          priority: 1,
        },
      },
      promptTemplates: {
        code_generator: {
          id: 'code-gen-v2',
          name: 'code_generator',
          label: 'Code Generator',
          system: 'You are an expert software engineer specializing in ObjectStack development.',
          user: 'Generate {{language}} code for: {{task}}\n\nRequirements:\n{{requirements}}',
          variables: [
            {
              name: 'language',
              type: 'string',
              required: true,
            },
            {
              name: 'task',
              type: 'string',
              required: true,
            },
            {
              name: 'requirements',
              type: 'string',
              required: false,
            },
          ],
          modelId: 'gpt-4-turbo',
          temperature: 0.3,
          category: 'code_generation',
        },
        support_agent: {
          id: 'support-v1',
          name: 'support_agent',
          label: 'Support Agent',
          system: 'You are a helpful customer support agent. Be empathetic and solution-oriented.',
          user: 'Customer: {{customer_name}}\nIssue: {{issue}}\nHistory: {{history}}',
          modelId: 'gpt-4-turbo',
          temperature: 0.7,
          category: 'support',
        },
        data_analyst: {
          id: 'analyst-v1',
          name: 'data_analyst',
          label: 'Data Analyst',
          system: 'You are a business intelligence analyst. Provide data-driven insights.',
          user: 'Analyze the following data and provide insights:\n{{data}}\n\nFocus on: {{focus_areas}}',
          modelId: 'claude-3-opus',
          temperature: 0.3,
          category: 'analytics',
        },
      },
      defaultModel: 'gpt-4-turbo',
      enableAutoFallback: true,
    };
    
    expect(() => ModelRegistrySchema.parse(registry)).not.toThrow();
  });
});
