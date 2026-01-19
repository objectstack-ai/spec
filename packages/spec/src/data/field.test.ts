import { describe, it, expect } from 'vitest';
import { 
  FieldSchema, 
  FieldType, 
  SelectOptionSchema,
  type Field,
  type SelectOption
} from './field.zod';

describe('FieldType', () => {
  it('should accept valid field types', () => {
    const validTypes = [
      'text', 'textarea', 'email', 'url', 'phone', 'password',
      'markdown', 'html',
      'number', 'currency', 'percent',
      'date', 'datetime', 'time',
      'boolean',
      'select', 'multiselect',
      'lookup', 'master_detail',
      'image', 'file', 'avatar',
      'formula', 'summary', 'autonumber'
    ];

    validTypes.forEach(type => {
      expect(() => FieldType.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid field types', () => {
    expect(() => FieldType.parse('invalid')).toThrow();
    expect(() => FieldType.parse('text_area')).toThrow();
    expect(() => FieldType.parse('')).toThrow();
  });
});

describe('SelectOptionSchema', () => {
  it('should accept valid select option', () => {
    const validOption: SelectOption = {
      label: 'Active',
      value: 'active',
    };

    expect(() => SelectOptionSchema.parse(validOption)).not.toThrow();
  });

  it('should accept select option with all fields', () => {
    const fullOption: SelectOption = {
      label: 'High Priority',
      value: 'high',
      color: '#FF0000',
      default: true,
    };

    expect(() => SelectOptionSchema.parse(fullOption)).not.toThrow();
  });

  it('should reject option without required fields', () => {
    expect(() => SelectOptionSchema.parse({ label: 'Test' })).toThrow();
    expect(() => SelectOptionSchema.parse({ value: 'test' })).toThrow();
  });
});

describe('FieldSchema', () => {
  describe('Basic Field Properties', () => {
    it('should accept valid field with minimal properties', () => {
      const validField: Field = {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
      };

      const result = FieldSchema.safeParse(validField);
      expect(result.success).toBe(true);
    });

    it('should enforce snake_case for field name', () => {
      const validNames = ['first_name', 'user_id', 'created_at', '_private'];
      validNames.forEach(name => {
        expect(() => FieldSchema.parse({ name, label: 'Test', type: 'text' })).not.toThrow();
      });

      const invalidNames = ['firstName', 'First-Name', '123name', 'name-field'];
      invalidNames.forEach(name => {
        expect(() => FieldSchema.parse({ name, label: 'Test', type: 'text' })).toThrow();
      });
    });

    it('should apply default values correctly', () => {
      const field = {
        name: 'test_field',
        label: 'Test',
        type: 'text' as const,
      };

      const result = FieldSchema.parse(field);
      expect(result.required).toBe(false);
      expect(result.multiple).toBe(false);
      expect(result.unique).toBe(false);
      expect(result.hidden).toBe(false);
      expect(result.readonly).toBe(false);
      expect(result.encryption).toBe(false);
      expect(result.index).toBe(false);
      expect(result.externalId).toBe(false);
    });
  });

  describe('Text Field Constraints', () => {
    it('should accept text field with length constraints', () => {
      const textField: Field = {
        name: 'username',
        label: 'Username',
        type: 'text',
        maxLength: 50,
        minLength: 3,
      };

      expect(() => FieldSchema.parse(textField)).not.toThrow();
    });
  });

  describe('Number Field Constraints', () => {
    it('should accept number field with precision and scale', () => {
      const numberField: Field = {
        name: 'amount',
        label: 'Amount',
        type: 'currency',
        precision: 10,
        scale: 2,
        min: 0,
        max: 999999.99,
      };

      expect(() => FieldSchema.parse(numberField)).not.toThrow();
    });
  });

  describe('Select Field', () => {
    it('should accept select field with options', () => {
      const selectField: Field = {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active', color: '#00FF00', default: true },
          { label: 'Inactive', value: 'inactive', color: '#FF0000' },
        ],
      };

      expect(() => FieldSchema.parse(selectField)).not.toThrow();
    });

    it('should accept multiselect field', () => {
      const multiselectField: Field = {
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        multiple: true,
        options: [
          { label: 'Important', value: 'important' },
          { label: 'Urgent', value: 'urgent' },
        ],
      };

      expect(() => FieldSchema.parse(multiselectField)).not.toThrow();
    });
  });

  describe('Relationship Fields', () => {
    it('should accept lookup field with reference', () => {
      const lookupField: Field = {
        name: 'account_id',
        label: 'Account',
        type: 'lookup',
        reference: 'account',
        referenceFilters: ['status = "active"'],
      };

      expect(() => FieldSchema.parse(lookupField)).not.toThrow();
    });

    it('should accept master_detail field with delete behavior', () => {
      const masterDetailField: Field = {
        name: 'parent_id',
        label: 'Parent Record',
        type: 'master_detail',
        reference: 'parent_object',
        deleteBehavior: 'cascade',
        writeRequiresMasterRead: true,
      };

      const result = FieldSchema.parse(masterDetailField);
      expect(result.deleteBehavior).toBe('cascade');
    });

    it('should default deleteBehavior to set_null', () => {
      const lookupField: Field = {
        name: 'contact_id',
        label: 'Contact',
        type: 'lookup',
        reference: 'contact',
      };

      const result = FieldSchema.parse(lookupField);
      expect(result.deleteBehavior).toBe('set_null');
    });
  });

  describe('Calculated Fields', () => {
    it('should accept formula field with expression', () => {
      const formulaField: Field = {
        name: 'full_name',
        label: 'Full Name',
        type: 'formula',
        expression: 'first_name + " " + last_name',
      };

      expect(() => FieldSchema.parse(formulaField)).not.toThrow();
    });

    it('should accept summary field with operations', () => {
      const summaryField: Field = {
        name: 'total_opportunities',
        label: 'Total Opportunities',
        type: 'summary',
        summaryOperations: {
          object: 'opportunity',
          field: 'amount',
          function: 'sum',
        },
      };

      expect(() => FieldSchema.parse(summaryField)).not.toThrow();
    });

    it('should accept all summary functions', () => {
      const functions = ['count', 'sum', 'min', 'max', 'avg'] as const;
      
      functions.forEach(fn => {
        const field: Field = {
          name: 'test_summary',
          label: 'Test Summary',
          type: 'summary',
          summaryOperations: {
            object: 'child_object',
            field: 'value',
            function: fn,
          },
        };

        expect(() => FieldSchema.parse(field)).not.toThrow();
      });
    });
  });

  describe('Security and Visibility', () => {
    it('should accept hidden and readonly fields', () => {
      const secureField: Field = {
        name: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        hidden: true,
        readonly: true,
        encryption: true,
      };

      expect(() => FieldSchema.parse(secureField)).not.toThrow();
    });
  });

  describe('Indexing', () => {
    it('should accept indexed fields', () => {
      const indexedField: Field = {
        name: 'email',
        label: 'Email',
        type: 'email',
        unique: true,
        index: true,
        externalId: true,
      };

      expect(() => FieldSchema.parse(indexedField)).not.toThrow();
    });
  });

  describe('Complex Field Examples', () => {
    it('should accept complex field with many properties', () => {
      const complexField: Field = {
        name: 'account_number',
        label: 'Account Number',
        type: 'text',
        description: 'Unique account identifier',
        required: true,
        unique: true,
        maxLength: 20,
        minLength: 10,
        defaultValue: 'ACC-0000',
        index: true,
        externalId: true,
        readonly: false,
        hidden: false,
      };

      expect(() => FieldSchema.parse(complexField)).not.toThrow();
    });
  });
});
