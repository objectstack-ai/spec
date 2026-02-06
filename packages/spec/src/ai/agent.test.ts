import { describe, it, expect } from 'vitest';
import {
  AgentSchema,
  AIModelConfigSchema,
  AIToolSchema,
  AIKnowledgeSchema,
  type Agent,
} from './agent.zod';

describe('AIModelConfigSchema', () => {
  it('should accept minimal model config', () => {
    const config = {
      model: 'gpt-4',
    };

    const result = AIModelConfigSchema.parse(config);
    expect(result.provider).toBe('openai');
    expect(result.temperature).toBe(0.7);
  });

  it('should accept all providers', () => {
    const providers = ['openai', 'azure_openai', 'anthropic', 'local'] as const;
    
    providers.forEach(provider => {
      const config = {
        provider,
        model: 'test-model',
      };
      expect(() => AIModelConfigSchema.parse(config)).not.toThrow();
    });
  });

  it('should accept full model config', () => {
    const config = {
      provider: 'anthropic' as const,
      model: 'claude-3-opus-20240229',
      temperature: 0.5,
      maxTokens: 4096,
      topP: 0.9,
    };

    expect(() => AIModelConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce temperature constraints', () => {
    expect(() => AIModelConfigSchema.parse({
      model: 'gpt-4',
      temperature: -0.1,
    })).toThrow();

    expect(() => AIModelConfigSchema.parse({
      model: 'gpt-4',
      temperature: 2.1,
    })).toThrow();

    expect(() => AIModelConfigSchema.parse({
      model: 'gpt-4',
      temperature: 0,
    })).not.toThrow();

    expect(() => AIModelConfigSchema.parse({
      model: 'gpt-4',
      temperature: 2,
    })).not.toThrow();
  });
});

describe('AIToolSchema', () => {
  it('should accept all tool types', () => {
    const types = ['action', 'flow', 'query', 'vector_search'] as const;
    
    types.forEach(type => {
      const tool = {
        type,
        name: 'test_tool',
      };
      expect(() => AIToolSchema.parse(tool)).not.toThrow();
    });
  });

  it('should accept tool with description', () => {
    const tool = {
      type: 'action' as const,
      name: 'create_ticket',
      description: 'Creates a new support ticket in the system',
    };

    expect(() => AIToolSchema.parse(tool)).not.toThrow();
  });
});

describe('AIKnowledgeSchema', () => {
  it('should accept knowledge config', () => {
    const knowledge = {
      topics: ['product_docs', 'faq', 'troubleshooting'],
      indexes: ['vector_store_main', 'vector_store_archive'],
    };

    expect(() => AIKnowledgeSchema.parse(knowledge)).not.toThrow();
  });

  it('should accept empty arrays', () => {
    const knowledge = {
      topics: [],
      indexes: [],
    };

    expect(() => AIKnowledgeSchema.parse(knowledge)).not.toThrow();
  });
});

describe('AgentSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal agent', () => {
      const agent: Agent = {
        name: 'support_agent',
        label: 'Support Agent',
        role: 'Customer Support Specialist',
        instructions: 'You are a helpful customer support agent.',
      };

      const result = AgentSchema.parse(agent);
      expect(result.active).toBe(true);
    });

    it('should enforce snake_case for agent name', () => {
      const validNames = ['support_agent', 'sales_bot', 'hr_assistant', '_internal'];
      validNames.forEach(name => {
        expect(() => AgentSchema.parse({
          name,
          label: 'Test',
          role: 'Test Role',
          instructions: 'Test',
        })).not.toThrow();
      });

      const invalidNames = ['supportAgent', 'Support-Agent', '123agent'];
      invalidNames.forEach(name => {
        expect(() => AgentSchema.parse({
          name,
          label: 'Test',
          role: 'Test Role',
          instructions: 'Test',
        })).toThrow();
      });
    });

    it('should accept agent with avatar', () => {
      const agent: Agent = {
        name: 'sales_coach',
        label: 'Sales Coach',
        avatar: 'https://example.com/avatars/sales-coach.png',
        role: 'Senior Sales Trainer',
        instructions: 'You help sales reps close deals.',
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });
  });

  describe('Model Configuration', () => {
    it('should accept agent with custom model config', () => {
      const agent: Agent = {
        name: 'analyst',
        label: 'Data Analyst',
        role: 'Business Intelligence Analyst',
        instructions: 'Analyze data and provide insights.',
        model: {
          provider: 'anthropic',
          model: 'claude-3-opus-20240229',
          temperature: 0.3,
          maxTokens: 8192,
        },
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });
  });

  describe('Tools and Capabilities', () => {
    it('should accept agent with tools', () => {
      const agent: Agent = {
        name: 'workflow_agent',
        label: 'Workflow Agent',
        role: 'Automation Specialist',
        instructions: 'Execute workflows and actions.',
        tools: [
          {
            type: 'action',
            name: 'send_email',
            description: 'Send email to users',
          },
          {
            type: 'flow',
            name: 'approval_workflow',
          },
          {
            type: 'query',
            name: 'get_pending_tasks',
          },
        ],
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should accept agent with knowledge base', () => {
      const agent: Agent = {
        name: 'knowledge_bot',
        label: 'Knowledge Bot',
        role: 'Documentation Assistant',
        instructions: 'Answer questions using the knowledge base.',
        knowledge: {
          topics: ['api_docs', 'user_guide', 'faq'],
          indexes: ['main_index', 'legacy_index'],
        },
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should accept agent with both tools and knowledge', () => {
      const agent: Agent = {
        name: 'full_agent',
        label: 'Complete Agent',
        role: 'Full-Stack Assistant',
        instructions: 'Comprehensive assistant with all capabilities.',
        tools: [
          { type: 'action', name: 'create_record' },
          { type: 'flow', name: 'process_data' },
        ],
        knowledge: {
          topics: ['everything'],
          indexes: ['master_index'],
        },
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });
  });

  describe('Access Control', () => {
    it('should accept agent with access restrictions', () => {
      const agent: Agent = {
        name: 'admin_agent',
        label: 'Admin Agent',
        role: 'System Administrator',
        instructions: 'Perform admin tasks.',
        access: ['admin', 'super_admin'],
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should accept inactive agent', () => {
      const agent: Agent = {
        name: 'deprecated_agent',
        label: 'Deprecated Agent',
        role: 'Legacy Assistant',
        instructions: 'Old agent, no longer used.',
        active: false,
      };

      const result = AgentSchema.parse(agent);
      expect(result.active).toBe(false);
    });
  });

  describe('Real-World Agent Examples', () => {
    it('should accept customer support agent', () => {
      const agent: Agent = {
        name: 'customer_support_ai',
        label: 'AI Support Agent',
        avatar: '/avatars/support-bot.png',
        role: 'Senior Customer Support Specialist',
        instructions: `You are an experienced customer support agent for ObjectStack.

Your responsibilities:
- Answer customer questions professionally and accurately
- Create support tickets when needed
- Escalate complex issues to human agents
- Search the knowledge base for solutions

Always be polite, empathetic, and solution-oriented.`,
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          maxTokens: 2048,
        },
        tools: [
          {
            type: 'action',
            name: 'create_support_ticket',
            description: 'Create a new support ticket',
          },
          {
            type: 'action',
            name: 'escalate_to_human',
            description: 'Transfer conversation to human agent',
          },
          {
            type: 'query',
            name: 'search_tickets',
            description: 'Search existing support tickets',
          },
          {
            type: 'vector_search',
            name: 'kb_search',
            description: 'Search knowledge base',
          },
        ],
        knowledge: {
          topics: ['product_docs', 'faq', 'troubleshooting', 'api_reference'],
          indexes: ['support_kb_v2'],
        },
        access: ['support_team', 'customers'],
        active: true,
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should accept sales assistant agent', () => {
      const agent: Agent = {
        name: 'sales_assistant',
        label: 'Sales AI Assistant',
        avatar: '/avatars/sales-coach.png',
        role: 'Sales Development Representative',
        instructions: `You are a sales assistant helping SDRs close deals.

Core capabilities:
- Research accounts and contacts
- Draft personalized outreach emails
- Update opportunity information
- Provide competitive intelligence
- Schedule follow-ups

Be persuasive but honest. Focus on value creation.`,
        model: {
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          temperature: 0.8,
        },
        tools: [
          {
            type: 'query',
            name: 'get_account_info',
            description: 'Retrieve account details',
          },
          {
            type: 'action',
            name: 'update_opportunity',
            description: 'Update opportunity fields',
          },
          {
            type: 'action',
            name: 'send_email',
            description: 'Send email via template',
          },
          {
            type: 'flow',
            name: 'create_follow_up_task',
            description: 'Schedule follow-up activity',
          },
        ],
        knowledge: {
          topics: ['sales_playbooks', 'product_features', 'case_studies', 'competitor_analysis'],
          indexes: ['sales_intelligence'],
        },
        access: ['sales_team'],
        active: true,
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should accept data analyst agent', () => {
      const agent: Agent = {
        name: 'data_analyst_ai',
        label: 'Data Analyst AI',
        role: 'Business Intelligence Analyst',
        instructions: `You are a data analyst helping users understand their business metrics.

Skills:
- Query databases for insights
- Generate visualizations
- Identify trends and patterns
- Provide actionable recommendations

Be precise, data-driven, and clear in your explanations.`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 4096,
        },
        tools: [
          {
            type: 'query',
            name: 'execute_sql',
            description: 'Run SQL queries on the data warehouse',
          },
          {
            type: 'action',
            name: 'create_dashboard',
            description: 'Generate dashboard from metrics',
          },
        ],
        knowledge: {
          topics: ['sql_guides', 'metrics_definitions'],
          indexes: ['analytics_kb'],
        },
        access: ['analysts', 'executives'],
        active: true,
      };

      expect(() => AgentSchema.parse(agent)).not.toThrow();
    });

    it('should valid agent with lifecycle state machine', () => {
      const agentWithLifecycle = {
        name: 'approval_bot',
        label: 'Approval Bot',
        role: 'Approver',
        instructions: 'Approve if valid',
        lifecycle: {
          id: 'bot_lifecycle',
          initial: 'idle',
          states: {
            idle: { on: { TASK: 'working' } },
            working: { on: { DONE: 'idle' } }
          }
        }
      };

      const result = AgentSchema.parse(agentWithLifecycle);
      expect(result.lifecycle).toBeDefined();
      expect(result.lifecycle?.initial).toBe('idle');
    });
  });
});
