import { describe, it, expect } from 'vitest';
import {
  FlowSchema,
  FlowNodeSchema,
  FlowEdgeSchema,
  FlowVariableSchema,
  FlowNodeAction,
  defineFlow,
  type Flow,
  type FlowNode,
  type FlowEdge,
} from './flow.zod';

describe('FlowNodeAction', () => {
  it('should accept all node action types', () => {
    const actions = [
      'start', 'end', 'decision', 'assignment', 'loop',
      'create_record', 'update_record', 'delete_record', 'get_record',
      'http_request', 'script', 'wait', 'subflow',
    ];
    
    actions.forEach(action => {
      expect(() => FlowNodeAction.parse(action)).not.toThrow();
    });
  });

  it('should reject invalid action types', () => {
    expect(() => FlowNodeAction.parse('invalid')).toThrow();
    expect(() => FlowNodeAction.parse('custom_action')).toThrow();
  });
});

describe('FlowVariableSchema', () => {
  it('should accept basic variable', () => {
    const variable = {
      name: 'recordId',
      type: 'text',
    };

    const result = FlowVariableSchema.parse(variable);
    expect(result.isInput).toBe(false);
    expect(result.isOutput).toBe(false);
  });

  it('should accept input variable', () => {
    const variable = {
      name: 'accountId',
      type: 'text',
      isInput: true,
    };

    expect(() => FlowVariableSchema.parse(variable)).not.toThrow();
  });

  it('should accept output variable', () => {
    const variable = {
      name: 'totalAmount',
      type: 'number',
      isOutput: true,
    };

    expect(() => FlowVariableSchema.parse(variable)).not.toThrow();
  });

  it('should accept various data types', () => {
    const types = ['text', 'number', 'boolean', 'object', 'list'];
    
    types.forEach(type => {
      const variable = {
        name: 'testVar',
        type,
      };
      expect(() => FlowVariableSchema.parse(variable)).not.toThrow();
    });
  });
});

describe('FlowNodeSchema', () => {
  it('should accept minimal node', () => {
    const node: FlowNode = {
      id: 'node_1',
      type: 'start',
      label: 'Start',
    };

    expect(() => FlowNodeSchema.parse(node)).not.toThrow();
  });

  it('should accept node with position', () => {
    const node: FlowNode = {
      id: 'node_2',
      type: 'decision',
      label: 'Check Amount',
      position: { x: 100, y: 200 },
    };

    expect(() => FlowNodeSchema.parse(node)).not.toThrow();
  });

  it('should accept node with config', () => {
    const node: FlowNode = {
      id: 'node_3',
      type: 'create_record',
      label: 'Create Account',
      config: {
        object: 'account',
        fields: {
          name: '{input.companyName}',
          status: 'active',
        },
      },
    };

    expect(() => FlowNodeSchema.parse(node)).not.toThrow();
  });

  it('should accept all node types', () => {
    const types = [
      'start', 'end', 'decision', 'assignment', 'loop',
      'create_record', 'update_record', 'delete_record', 'get_record',
      'http_request', 'script', 'wait', 'subflow',
    ] as const;

    types.forEach(type => {
      const node: FlowNode = {
        id: `node_${type}`,
        type,
        label: type,
      };
      expect(() => FlowNodeSchema.parse(node)).not.toThrow();
    });
  });
});

describe('FlowEdgeSchema', () => {
  it('should accept minimal edge', () => {
    const edge: FlowEdge = {
      id: 'edge_1',
      source: 'node_1',
      target: 'node_2',
    };

    expect(() => FlowEdgeSchema.parse(edge)).not.toThrow();
  });

  it('should accept edge with condition', () => {
    const edge: FlowEdge = {
      id: 'edge_2',
      source: 'decision_1',
      target: 'node_3',
      condition: 'amount > 1000',
    };

    expect(() => FlowEdgeSchema.parse(edge)).not.toThrow();
  });

  it('should accept edge with label', () => {
    const edge: FlowEdge = {
      id: 'edge_3',
      source: 'node_1',
      target: 'node_2',
      label: 'Yes',
    };

    expect(() => FlowEdgeSchema.parse(edge)).not.toThrow();
  });

  it('should accept edge with both condition and label', () => {
    const edge: FlowEdge = {
      id: 'edge_4',
      source: 'decision_1',
      target: 'approve_path',
      condition: 'status == "approved"',
      label: 'Approved',
    };

    expect(() => FlowEdgeSchema.parse(edge)).not.toThrow();
  });
});

describe('FlowSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal flow', () => {
      const flow: Flow = {
        name: 'simple_flow',
        label: 'Simple Flow',
        type: 'autolaunched',
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          { id: 'end', type: 'end', label: 'End' },
        ],
        edges: [
          { id: 'edge_1', source: 'start', target: 'end' },
        ],
      };

      const result = FlowSchema.parse(flow);
      expect(result.active).toBe(false);
      expect(result.runAs).toBe('user');
    });

    it('should enforce snake_case for flow name', () => {
      const validNames = ['approval_flow', 'send_email', 'create_record', '_internal'];
      validNames.forEach(name => {
        expect(() => FlowSchema.parse({
          name,
          label: 'Test',
          type: 'autolaunched',
          nodes: [],
          edges: [],
        })).not.toThrow();
      });

      const invalidNames = ['approvalFlow', 'Approval-Flow', '123flow'];
      invalidNames.forEach(name => {
        expect(() => FlowSchema.parse({
          name,
          label: 'Test',
          type: 'autolaunched',
          nodes: [],
          edges: [],
        })).toThrow();
      });
    });

    it('should accept all flow types', () => {
      const types = ['autolaunched', 'record_change', 'schedule', 'screen', 'api'] as const;
      
      types.forEach(type => {
        const flow: Flow = {
          name: 'test_flow',
          label: 'Test Flow',
          type,
          nodes: [],
          edges: [],
        };
        expect(() => FlowSchema.parse(flow)).not.toThrow();
      });
    });

    it('should default active to false', () => {
      const flow = {
        name: 'test_flow',
        label: 'Test',
        type: 'autolaunched' as const,
        nodes: [],
        edges: [],
      };

      const result = FlowSchema.parse(flow);
      expect(result.active).toBe(false);
    });

    it('should default runAs to user', () => {
      const flow = {
        name: 'test_flow',
        label: 'Test',
        type: 'autolaunched' as const,
        nodes: [],
        edges: [],
      };

      const result = FlowSchema.parse(flow);
      expect(result.runAs).toBe('user');
    });
  });

  describe('Flow with Variables', () => {
    it('should accept flow with variables', () => {
      const flow: Flow = {
        name: 'data_flow',
        label: 'Data Processing Flow',
        type: 'autolaunched',
        variables: [
          { name: 'recordId', type: 'text', isInput: true },
          { name: 'amount', type: 'number', isInput: true },
          { name: 'result', type: 'boolean', isOutput: true },
        ],
        nodes: [],
        edges: [],
      };

      expect(() => FlowSchema.parse(flow)).not.toThrow();
    });
  });

  describe('Real-World Flow Examples', () => {
    it('should accept approval flow', () => {
      const approvalFlow: Flow = {
        name: 'opportunity_approval',
        label: 'Opportunity Approval Flow',
        description: 'Handles approval process for large opportunities',
        type: 'record_change',
        variables: [
          { name: 'opportunityId', type: 'text', isInput: true },
          { name: 'approvalRequired', type: 'boolean', isOutput: true },
        ],
        nodes: [
          {
            id: 'start',
            type: 'start',
            label: 'Start',
            position: { x: 100, y: 50 },
          },
          {
            id: 'get_opportunity',
            type: 'get_record',
            label: 'Get Opportunity',
            config: {
              object: 'opportunity',
              recordId: '{opportunityId}',
            },
            position: { x: 100, y: 150 },
          },
          {
            id: 'check_amount',
            type: 'decision',
            label: 'Amount > $100K?',
            config: {
              condition: '{opportunity.amount} > 100000',
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'auto_approve',
            type: 'update_record',
            label: 'Auto Approve',
            config: {
              recordId: '{opportunityId}',
              fields: {
                status: 'approved',
                approved_by: 'system',
              },
            },
            position: { x: 50, y: 350 },
          },
          {
            id: 'send_approval_request',
            type: 'http_request',
            label: 'Send to Manager',
            config: {
              url: '/api/approvals',
              method: 'POST',
              body: {
                recordId: '{opportunityId}',
                approver: '{opportunity.owner.manager}',
              },
            },
            position: { x: 250, y: 350 },
          },
          {
            id: 'end',
            type: 'end',
            label: 'End',
            position: { x: 100, y: 450 },
          },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'get_opportunity' },
          { id: 'e2', source: 'get_opportunity', target: 'check_amount' },
          {
            id: 'e3',
            source: 'check_amount',
            target: 'auto_approve',
            condition: '{opportunity.amount} <= 100000',
            label: 'No',
          },
          {
            id: 'e4',
            source: 'check_amount',
            target: 'send_approval_request',
            condition: '{opportunity.amount} > 100000',
            label: 'Yes',
          },
          { id: 'e5', source: 'auto_approve', target: 'end' },
          { id: 'e6', source: 'send_approval_request', target: 'end' },
        ],
        active: true,
        runAs: 'system',
      };

      expect(() => FlowSchema.parse(approvalFlow)).not.toThrow();
    });

    it('should accept screen flow for user input', () => {
      const screenFlow: Flow = {
        name: 'contact_creation_wizard',
        label: 'Contact Creation Wizard',
        type: 'screen',
        variables: [
          { name: 'firstName', type: 'text', isInput: true },
          { name: 'lastName', type: 'text', isInput: true },
          { name: 'email', type: 'text', isInput: true },
          { name: 'contactId', type: 'text', isOutput: true },
        ],
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          {
            id: 'create_contact',
            type: 'create_record',
            label: 'Create Contact',
            config: {
              object: 'contact',
              fields: {
                first_name: '{firstName}',
                last_name: '{lastName}',
                email: '{email}',
              },
            },
          },
          {
            id: 'assign_output',
            type: 'assignment',
            label: 'Set Output',
            config: {
              variable: 'contactId',
              value: '{create_contact.id}',
            },
          },
          { id: 'end', type: 'end', label: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'create_contact' },
          { id: 'e2', source: 'create_contact', target: 'assign_output' },
          { id: 'e3', source: 'assign_output', target: 'end' },
        ],
        active: true,
      };

      expect(() => FlowSchema.parse(screenFlow)).not.toThrow();
    });

    it('should accept scheduled flow', () => {
      const scheduledFlow: Flow = {
        name: 'daily_cleanup',
        label: 'Daily Data Cleanup',
        description: 'Runs daily to archive old records',
        type: 'schedule',
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          {
            id: 'get_old_records',
            type: 'get_record',
            label: 'Find Old Records',
            config: {
              object: 'log_entry',
              filter: 'created_at < DAYS_AGO(90)',
            },
          },
          {
            id: 'loop_records',
            type: 'loop',
            label: 'For Each Record',
            config: {
              collection: '{get_old_records.records}',
            },
          },
          {
            id: 'delete_record',
            type: 'delete_record',
            label: 'Delete Record',
            config: {
              recordId: '{loop_records.item.id}',
            },
          },
          { id: 'end', type: 'end', label: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'get_old_records' },
          { id: 'e2', source: 'get_old_records', target: 'loop_records' },
          { id: 'e3', source: 'loop_records', target: 'delete_record' },
          { id: 'e4', source: 'delete_record', target: 'loop_records' },
          { id: 'e5', source: 'loop_records', target: 'end', label: 'Done' },
        ],
        active: true,
        runAs: 'system',
      };

      expect(() => FlowSchema.parse(scheduledFlow)).not.toThrow();
    });

    it('should accept API flow with webhook', () => {
      const apiFlow: Flow = {
        name: 'external_api_integration',
        label: 'External API Integration',
        type: 'api',
        variables: [
          { name: 'payload', type: 'object', isInput: true },
          { name: 'response', type: 'object', isOutput: true },
        ],
        nodes: [
          { id: 'start', type: 'start', label: 'Start' },
          {
            id: 'call_external_api',
            type: 'http_request',
            label: 'Call External API',
            config: {
              url: 'https://api.external.com/v1/data',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer {$Credential.token}',
              },
              body: '{payload}',
            },
          },
          {
            id: 'process_response',
            type: 'script',
            label: 'Process Response',
            config: {
              script: 'return JSON.parse(response.body);',
            },
          },
          { id: 'end', type: 'end', label: 'End' },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'call_external_api' },
          { id: 'e2', source: 'call_external_api', target: 'process_response' },
          { id: 'e3', source: 'process_response', target: 'end' },
        ],
        active: true,
      };

      expect(() => FlowSchema.parse(apiFlow)).not.toThrow();
    });
  });
});

// ============================================================================
// Protocol Improvement Tests: Flow errorHandling
// ============================================================================

describe('FlowSchema - errorHandling', () => {
  it('should accept flow with errorHandling config', () => {
    const result = FlowSchema.parse({
      name: 'resilient_flow',
      label: 'Resilient Flow',
      type: 'autolaunched',
      nodes: [
        { id: 'start', type: 'start', label: 'Start' },
        { id: 'end', type: 'end', label: 'End' },
      ],
      edges: [{ id: 'e1', source: 'start', target: 'end' }],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelayMs: 2000,
      },
    });
    expect(result.errorHandling?.strategy).toBe('retry');
    expect(result.errorHandling?.maxRetries).toBe(3);
    expect(result.errorHandling?.retryDelayMs).toBe(2000);
  });

  it('should default errorHandling strategy to fail', () => {
    const result = FlowSchema.parse({
      name: 'default_flow',
      label: 'Default',
      type: 'autolaunched',
      nodes: [
        { id: 'start', type: 'start', label: 'Start' },
      ],
      edges: [],
      errorHandling: {},
    });
    expect(result.errorHandling?.strategy).toBe('fail');
    expect(result.errorHandling?.maxRetries).toBe(0);
  });

  it('should accept continue strategy with fallback node', () => {
    const result = FlowSchema.parse({
      name: 'fallback_flow',
      label: 'Fallback',
      type: 'autolaunched',
      nodes: [
        { id: 'start', type: 'start', label: 'Start' },
        { id: 'fallback', type: 'end', label: 'Fallback' },
      ],
      edges: [],
      errorHandling: {
        strategy: 'continue',
        fallbackNodeId: 'fallback',
      },
    });
    expect(result.errorHandling?.strategy).toBe('continue');
    expect(result.errorHandling?.fallbackNodeId).toBe('fallback');
  });

  it('should accept flow without errorHandling (optional)', () => {
    const result = FlowSchema.parse({
      name: 'simple_flow',
      label: 'Simple',
      type: 'autolaunched',
      nodes: [{ id: 'start', type: 'start', label: 'Start' }],
      edges: [],
    });
    expect(result.errorHandling).toBeUndefined();
  });
});

describe('defineFlow', () => {
  it('should return a parsed flow', () => {
    const result = defineFlow({
      name: 'on_task_create',
      label: 'On Task Create',
      type: 'record_change',
      nodes: [
        { id: 'start', type: 'start', label: 'Start' },
        { id: 'end', type: 'end', label: 'End' },
      ],
      edges: [{ id: 'e1', source: 'start', target: 'end' }],
    });
    expect(result.name).toBe('on_task_create');
    expect(result.label).toBe('On Task Create');
    expect(result.type).toBe('record_change');
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });

  it('should apply defaults', () => {
    const result = defineFlow({
      name: 'simple',
      label: 'Simple',
      type: 'autolaunched',
      nodes: [{ id: 'start', type: 'start', label: 'Start' }],
      edges: [],
    });
    expect(result.version).toBe(1);
    expect(result.status).toBe('draft');
    expect(result.active).toBe(false);
    expect(result.runAs).toBe('user');
  });

  it('should throw on invalid flow name', () => {
    expect(() => defineFlow({
      name: 'INVALID',
      label: 'Bad Flow',
      type: 'autolaunched',
      nodes: [],
      edges: [],
    })).toThrow();
  });
});
