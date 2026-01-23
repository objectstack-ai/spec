import { describe, it, expect } from 'vitest';
import { 
  FieldSchema, 
  FieldType, 
  SelectOptionSchema,
  Field,
  type SelectOption
} from './field.zod';

describe('FieldType', () => {
  it('should accept valid field types', () => {
    const validTypes = [
      'text', 'textarea', 'email', 'url', 'phone', 'password',
      'markdown', 'html', 'richtext',
      'number', 'currency', 'percent',
      'date', 'datetime', 'time',
      'boolean',
      'select',
      'lookup', 'master_detail',
      'image', 'file', 'avatar',
      'formula', 'summary', 'autonumber',
      'location', 'geolocation', 'address', 'code', 'color', 'rating', 'slider', 'signature', 'qrcode'
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

describe('Field Factory Helpers', () => {
  describe('Basic Field Types', () => {
    it('should create phone field', () => {
      const phoneField = Field.phone({ label: 'Mobile Phone', required: true });
      
      expect(phoneField.type).toBe('phone');
      expect(phoneField.label).toBe('Mobile Phone');
      expect(phoneField.required).toBe(true);
    });

    it('should create text field', () => {
      const textField = Field.text({ label: 'Name', maxLength: 100 });
      
      expect(textField.type).toBe('text');
      expect(textField.label).toBe('Name');
      expect(textField.maxLength).toBe(100);
    });

    it('should create email field', () => {
      const emailField = Field.email({ label: 'Email Address' });
      
      expect(emailField.type).toBe('email');
      expect(emailField.label).toBe('Email Address');
    });
  });

  describe('Select Field Factory', () => {
    it('should create select field with string array (old API)', () => {
      const selectField = Field.select(['High', 'Medium', 'Low'], { label: 'Priority' });
      
      expect(selectField.type).toBe('select');
      expect(selectField.label).toBe('Priority');
      expect(selectField.options).toHaveLength(3);
      expect(selectField.options[0]).toEqual({ label: 'High', value: 'High' });
    });

    it('should create select field with SelectOption array in config (new API)', () => {
      const selectField = Field.select({
        label: 'Priority',
        options: [
          { label: 'High Priority', value: 'high', color: '#FF0000' },
          { label: 'Low Priority', value: 'low', color: '#00FF00' },
        ],
      });
      
      expect(selectField.type).toBe('select');
      expect(selectField.label).toBe('Priority');
      expect(selectField.options).toHaveLength(2);
      expect(selectField.options[0].color).toBe('#FF0000');
      expect(selectField.options[1].value).toBe('low');
    });

    it('should create select field with mixed string/object array (new API)', () => {
      const selectField = Field.select({
        label: 'Status',
        options: [
          { label: 'Active', value: 'active', color: '#00AA00' },
          'Inactive',
          'Pending',
        ],
      });
      
      expect(selectField.type).toBe('select');
      expect(selectField.options).toHaveLength(3);
      expect(selectField.options[0]).toEqual({ label: 'Active', value: 'active', color: '#00AA00' });
      expect(selectField.options[1]).toEqual({ label: 'Inactive', value: 'Inactive' });
      expect(selectField.options[2]).toEqual({ label: 'Pending', value: 'Pending' });
    });
  });

  describe('Lookup and Master-Detail Fields', () => {
    it('should create lookup field', () => {
      const lookupField = Field.lookup('account', { 
        label: 'Account',
        referenceFilters: ['status = "active"'],
      });
      
      expect(lookupField.type).toBe('lookup');
      expect(lookupField.reference).toBe('account');
      expect(lookupField.label).toBe('Account');
    });

    it('should create master_detail field', () => {
      const masterDetailField = Field.masterDetail('parent_object', {
        label: 'Parent',
        deleteBehavior: 'cascade',
      });
      
      expect(masterDetailField.type).toBe('master_detail');
      expect(masterDetailField.reference).toBe('parent_object');
      expect(masterDetailField.deleteBehavior).toBe('cascade');
    });
  });

  describe('Enhanced Field Types', () => {
    it('should accept location field type', () => {
      expect(() => FieldType.parse('location')).not.toThrow();
    });

    it('should accept geolocation field type', () => {
      expect(() => FieldType.parse('geolocation')).not.toThrow();
    });

    it('should accept address field type', () => {
      expect(() => FieldType.parse('address')).not.toThrow();
    });

    it('should accept richtext field type', () => {
      expect(() => FieldType.parse('richtext')).not.toThrow();
    });

    it('should accept code field type', () => {
      expect(() => FieldType.parse('code')).not.toThrow();
    });

    it('should accept color field type', () => {
      expect(() => FieldType.parse('color')).not.toThrow();
    });

    it('should accept rating field type', () => {
      expect(() => FieldType.parse('rating')).not.toThrow();
    });

    it('should accept slider field type', () => {
      expect(() => FieldType.parse('slider')).not.toThrow();
    });

    it('should accept signature field type', () => {
      expect(() => FieldType.parse('signature')).not.toThrow();
    });

    it('should accept qrcode field type', () => {
      expect(() => FieldType.parse('qrcode')).not.toThrow();
    });

    it('should create location field with config', () => {
      const locationField = Field.location({
        label: 'Office Location',
        displayMap: true,
        allowGeocoding: true,
      });
      
      expect(locationField.type).toBe('location');
      expect(locationField.label).toBe('Office Location');
      expect(locationField.displayMap).toBe(true);
    });

    it('should create address field with format', () => {
      const addressField = Field.address({
        label: 'Mailing Address',
        addressFormat: 'us',
        required: true,
      });
      
      expect(addressField.type).toBe('address');
      expect(addressField.addressFormat).toBe('us');
      expect(addressField.required).toBe(true);
    });

    it('should create richtext field', () => {
      const richtextField = Field.richtext({
        label: 'Description',
        maxLength: 5000,
      });
      
      expect(richtextField.type).toBe('richtext');
      expect(richtextField.label).toBe('Description');
    });

    it('should create code field with language', () => {
      const codeField = Field.code('javascript', {
        label: 'Script',
        lineNumbers: true,
        theme: 'dark',
      });
      
      expect(codeField.type).toBe('code');
      expect(codeField.language).toBe('javascript');
      expect(codeField.lineNumbers).toBe(true);
    });

    it('should create color field with format', () => {
      const colorField = Field.color({
        label: 'Brand Color',
        colorFormat: 'hex',
        allowAlpha: false,
        presetColors: ['#FF0000', '#00FF00', '#0000FF'],
      });
      
      expect(colorField.type).toBe('color');
      expect(colorField.colorFormat).toBe('hex');
      expect(colorField.presetColors).toHaveLength(3);
    });

    it('should create rating field with max rating', () => {
      const ratingField = Field.rating(10, {
        label: 'Customer Satisfaction',
        allowHalf: true,
      });
      
      expect(ratingField.type).toBe('rating');
      expect(ratingField.maxRating).toBe(10);
      expect(ratingField.allowHalf).toBe(true);
    });

    it('should create signature field', () => {
      const signatureField = Field.signature({
        label: 'Customer Signature',
        required: true,
      });
      
      expect(signatureField.type).toBe('signature');
      expect(signatureField.required).toBe(true);
    });

    it('should create slider field with config', () => {
      const sliderField = Field.slider({
        label: 'Volume',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 50,
        showValue: true,
        marks: { '0': 'Silent', '50': 'Medium', '100': 'Loud' },
      });
      
      expect(sliderField.type).toBe('slider');
      expect(sliderField.label).toBe('Volume');
      expect(sliderField.min).toBe(0);
      expect(sliderField.max).toBe(100);
      expect(sliderField.step).toBe(5);
      expect(sliderField.showValue).toBe(true);
      expect(sliderField.marks).toEqual({ '0': 'Silent', '50': 'Medium', '100': 'Loud' });
    });

    it('should create qrcode field with barcode format', () => {
      const qrcodeField = Field.qrcode({
        label: 'Product Barcode',
        barcodeFormat: 'qr',
        qrErrorCorrection: 'M',
        displayValue: true,
        allowScanning: true,
      });
      
      expect(qrcodeField.type).toBe('qrcode');
      expect(qrcodeField.label).toBe('Product Barcode');
      expect(qrcodeField.barcodeFormat).toBe('qr');
      expect(qrcodeField.qrErrorCorrection).toBe('M');
      expect(qrcodeField.displayValue).toBe(true);
      expect(qrcodeField.allowScanning).toBe(true);
    });

    it('should create geolocation field', () => {
      const geolocationField = Field.geolocation({
        label: 'Current Location',
        displayMap: true,
        allowGeocoding: false,
      });
      
      expect(geolocationField.type).toBe('geolocation');
      expect(geolocationField.label).toBe('Current Location');
      expect(geolocationField.displayMap).toBe(true);
      expect(geolocationField.allowGeocoding).toBe(false);
    });
  });
});
