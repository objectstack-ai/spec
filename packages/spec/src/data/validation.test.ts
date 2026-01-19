import { describe, it, expect } from 'vitest';
import {
  ValidationRuleSchema,
  ScriptValidationSchema,
  UniquenessValidationSchema,
  StateMachineValidationSchema,
  FormatValidationSchema,
  type ValidationRule,
} from './validation.zod';

describe('ScriptValidationSchema', () => {
  it('should accept valid script validation', () => {
    const scriptValidation = {
      type: 'script' as const,
      name: 'check_amount',
      message: 'Amount must be positive',
      condition: 'amount < 0',
    };

    expect(() => ScriptValidationSchema.parse(scriptValidation)).not.toThrow();
  });

  it('should apply default values', () => {
    const validation = {
      type: 'script' as const,
      name: 'test_validation',
      message: 'Validation failed',
      condition: 'true',
    };

    const result = ScriptValidationSchema.parse(validation);
    expect(result.active).toBe(true);
    expect(result.severity).toBe('error');
  });

  it('should accept custom severity levels', () => {
    const severityLevels = ['error', 'warning', 'info'] as const;
    
    severityLevels.forEach(severity => {
      const validation = {
        type: 'script' as const,
        name: 'test',
        message: 'Test',
        condition: 'false',
        severity,
      };

      const result = ScriptValidationSchema.parse(validation);
      expect(result.severity).toBe(severity);
    });
  });

  it('should enforce snake_case for validation name', () => {
    const validNames = ['check_amount', 'validate_email', '_internal'];
    validNames.forEach(name => {
      const validation = {
        type: 'script' as const,
        name,
        message: 'Test',
        condition: 'true',
      };
      expect(() => ScriptValidationSchema.parse(validation)).not.toThrow();
    });

    const invalidNames = ['checkAmount', 'Check-Amount', '123check'];
    invalidNames.forEach(name => {
      const validation = {
        type: 'script' as const,
        name,
        message: 'Test',
        condition: 'true',
      };
      expect(() => ScriptValidationSchema.parse(validation)).toThrow();
    });
  });
});

describe('UniquenessValidationSchema', () => {
  it('should accept single field uniqueness validation', () => {
    const uniqueValidation = {
      type: 'unique' as const,
      name: 'unique_email',
      message: 'Email must be unique',
      fields: ['email'],
    };

    expect(() => UniquenessValidationSchema.parse(uniqueValidation)).not.toThrow();
  });

  it('should accept composite uniqueness validation', () => {
    const compositeValidation = {
      type: 'unique' as const,
      name: 'unique_tenant_email',
      message: 'Email must be unique within tenant',
      fields: ['tenant_id', 'email'],
    };

    expect(() => UniquenessValidationSchema.parse(compositeValidation)).not.toThrow();
  });

  it('should accept uniqueness with scope', () => {
    const scopedValidation = {
      type: 'unique' as const,
      name: 'unique_active_email',
      message: 'Active emails must be unique',
      fields: ['email'],
      scope: 'status = "active"',
    };

    expect(() => UniquenessValidationSchema.parse(scopedValidation)).not.toThrow();
  });

  it('should handle case sensitivity option', () => {
    const caseInsensitive = {
      type: 'unique' as const,
      name: 'unique_username',
      message: 'Username must be unique',
      fields: ['username'],
      caseSensitive: false,
    };

    const result = UniquenessValidationSchema.parse(caseInsensitive);
    expect(result.caseSensitive).toBe(false);
  });

  it('should default caseSensitive to true', () => {
    const validation = {
      type: 'unique' as const,
      name: 'unique_code',
      message: 'Code must be unique',
      fields: ['code'],
    };

    const result = UniquenessValidationSchema.parse(validation);
    expect(result.caseSensitive).toBe(true);
  });
});

describe('StateMachineValidationSchema', () => {
  it('should accept valid state machine validation', () => {
    const stateMachine = {
      type: 'state_machine' as const,
      name: 'order_status_transitions',
      message: 'Invalid status transition',
      field: 'status',
      transitions: {
        draft: ['submitted', 'cancelled'],
        submitted: ['approved', 'rejected'],
        approved: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        rejected: [],
        cancelled: [],
      },
    };

    expect(() => StateMachineValidationSchema.parse(stateMachine)).not.toThrow();
  });

  it('should accept simple state machine', () => {
    const simpleStateMachine = {
      type: 'state_machine' as const,
      name: 'task_status',
      message: 'Cannot change task status',
      field: 'status',
      transitions: {
        open: ['in_progress', 'closed'],
        in_progress: ['open', 'closed'],
        closed: [],
      },
    };

    expect(() => StateMachineValidationSchema.parse(simpleStateMachine)).not.toThrow();
  });
});

describe('FormatValidationSchema', () => {
  it('should accept format validation with predefined format', () => {
    const formats = ['email', 'url', 'phone', 'json'] as const;
    
    formats.forEach(format => {
      const validation = {
        type: 'format' as const,
        name: `validate_${format}`,
        message: `Invalid ${format}`,
        field: 'test_field',
        format,
      };

      expect(() => FormatValidationSchema.parse(validation)).not.toThrow();
    });
  });

  it('should accept format validation with regex', () => {
    const regexValidation = {
      type: 'format' as const,
      name: 'validate_zipcode',
      message: 'Invalid ZIP code',
      field: 'zipcode',
      regex: '^[0-9]{5}(-[0-9]{4})?$',
    };

    expect(() => FormatValidationSchema.parse(regexValidation)).not.toThrow();
  });

  it('should accept format validation with both regex and format', () => {
    const mixedValidation = {
      type: 'format' as const,
      name: 'custom_email',
      message: 'Invalid email format',
      field: 'email',
      format: 'email' as const,
      regex: '^[a-z0-9._%+-]+@company\\.com$',
    };

    expect(() => FormatValidationSchema.parse(mixedValidation)).not.toThrow();
  });
});

describe('ValidationRuleSchema (Discriminated Union)', () => {
  it('should accept all validation rule types', () => {
    const rules: ValidationRule[] = [
      {
        type: 'script',
        name: 'check_amount',
        message: 'Amount must be positive',
        condition: 'amount > 0',
      },
      {
        type: 'unique',
        name: 'unique_email',
        message: 'Email must be unique',
        fields: ['email'],
      },
      {
        type: 'state_machine',
        name: 'status_flow',
        message: 'Invalid status transition',
        field: 'status',
        transitions: { open: ['closed'], closed: [] },
      },
      {
        type: 'format',
        name: 'email_format',
        message: 'Invalid email',
        field: 'email',
        format: 'email',
      },
    ];

    rules.forEach(rule => {
      expect(() => ValidationRuleSchema.parse(rule)).not.toThrow();
    });
  });

  it('should properly discriminate between rule types', () => {
    const scriptRule = {
      type: 'script' as const,
      name: 'test',
      message: 'Test',
      condition: 'true',
    };

    const result = ValidationRuleSchema.parse(scriptRule);
    expect(result.type).toBe('script');
    if (result.type === 'script') {
      expect(result.condition).toBe('true');
    }
  });

  describe('Real-World Validation Examples', () => {
    it('should accept opportunity validation rules', () => {
      const opportunityValidations: ValidationRule[] = [
        {
          type: 'script',
          name: 'amount_positive',
          message: 'Opportunity amount must be positive',
          condition: 'amount <= 0',
          severity: 'error',
        },
        {
          type: 'script',
          name: 'close_date_future',
          message: 'Close date should be in the future',
          condition: 'close_date < TODAY()',
          severity: 'warning',
        },
        {
          type: 'unique',
          name: 'unique_opportunity_name',
          message: 'Opportunity name must be unique per account',
          fields: ['account_id', 'name'],
          scope: 'is_deleted = false',
        },
        {
          type: 'state_machine',
          name: 'stage_transitions',
          message: 'Invalid stage transition',
          field: 'stage',
          transitions: {
            prospecting: ['qualification', 'closed_lost'],
            qualification: ['needs_analysis', 'closed_lost'],
            needs_analysis: ['proposal', 'closed_lost'],
            proposal: ['negotiation', 'closed_lost'],
            negotiation: ['closed_won', 'closed_lost'],
            closed_won: [],
            closed_lost: [],
          },
        },
        {
          type: 'format',
          name: 'email_format',
          message: 'Primary contact email must be valid',
          field: 'primary_contact_email',
          format: 'email',
        },
      ];

      opportunityValidations.forEach(validation => {
        expect(() => ValidationRuleSchema.parse(validation)).not.toThrow();
      });
    });
  });
});
