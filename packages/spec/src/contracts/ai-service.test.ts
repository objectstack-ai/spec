import { describe, it, expect } from 'vitest';
import type { IAIService, AIMessage, AIResult } from './ai-service';

describe('AI Service Contract', () => {
  it('should allow a minimal IAIService implementation with required methods', () => {
    const service: IAIService = {
      chat: async (_messages, _options?) => ({ content: '' }),
      complete: async (_prompt, _options?) => ({ content: '' }),
    };

    expect(typeof service.chat).toBe('function');
    expect(typeof service.complete).toBe('function');
  });

  it('should allow a full implementation with optional methods', () => {
    const service: IAIService = {
      chat: async () => ({ content: '' }),
      complete: async () => ({ content: '' }),
      embed: async () => [[]],
      listModels: async () => [],
    };

    expect(service.embed).toBeDefined();
    expect(service.listModels).toBeDefined();
  });

  it('should generate a chat completion', async () => {
    const service: IAIService = {
      chat: async (messages): Promise<AIResult> => {
        const lastMessage = messages[messages.length - 1];
        return {
          content: `Echo: ${lastMessage.content}`,
          model: 'test-model',
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        };
      },
      complete: async () => ({ content: '' }),
    };

    const messages: AIMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ];

    const result = await service.chat(messages);
    expect(result.content).toBe('Echo: Hello');
    expect(result.model).toBe('test-model');
    expect(result.usage?.totalTokens).toBe(15);
  });

  it('should generate a text completion', async () => {
    const service: IAIService = {
      chat: async () => ({ content: '' }),
      complete: async (prompt, options?): Promise<AIResult> => ({
        content: `Completed: ${prompt}`,
        model: options?.model ?? 'default',
      }),
    };

    const result = await service.complete('The sky is', { model: 'gpt-4', maxTokens: 50 });
    expect(result.content).toContain('The sky is');
    expect(result.model).toBe('gpt-4');
  });

  it('should generate embeddings', async () => {
    const service: IAIService = {
      chat: async () => ({ content: '' }),
      complete: async () => ({ content: '' }),
      embed: async (input) => {
        const texts = Array.isArray(input) ? input : [input];
        return texts.map(() => [0.1, 0.2, 0.3]);
      },
    };

    const embeddings = await service.embed!('Hello world');
    expect(embeddings).toHaveLength(1);
    expect(embeddings[0]).toEqual([0.1, 0.2, 0.3]);

    const batch = await service.embed!(['Hello', 'World']);
    expect(batch).toHaveLength(2);
  });

  it('should list available models', async () => {
    const service: IAIService = {
      chat: async () => ({ content: '' }),
      complete: async () => ({ content: '' }),
      listModels: async () => ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet'],
    };

    const models = await service.listModels!();
    expect(models).toHaveLength(3);
    expect(models).toContain('gpt-4');
  });
});
