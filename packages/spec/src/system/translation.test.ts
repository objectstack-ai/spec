import { describe, it, expect } from 'vitest';
import {
  TranslationDataSchema,
  TranslationBundleSchema,
  LocaleSchema,
  type TranslationBundle,
} from './translation.zod';

describe('LocaleSchema', () => {
  it('should accept valid locale strings', () => {
    const validLocales = ['en-US', 'zh-CN', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];

    validLocales.forEach(locale => {
      expect(() => LocaleSchema.parse(locale)).not.toThrow();
    });
  });

  it('should accept simple language codes', () => {
    const locales = ['en', 'zh', 'es', 'fr', 'de'];

    locales.forEach(locale => {
      expect(() => LocaleSchema.parse(locale)).not.toThrow();
    });
  });
});

describe('TranslationDataSchema', () => {
  it('should accept empty translation data', () => {
    const data = TranslationDataSchema.parse({});

    expect(data).toBeDefined();
  });

  it('should accept object translations', () => {
    const data = TranslationDataSchema.parse({
      objects: {
        account: {
          label: 'Account',
          pluralLabel: 'Accounts',
        },
      },
    });

    expect(data.objects?.account.label).toBe('Account');
  });

  it('should accept field translations', () => {
    const data = TranslationDataSchema.parse({
      objects: {
        account: {
          label: 'Account',
          fields: {
            name: {
              label: 'Account Name',
              help: 'Enter the name of the account',
            },
            status: {
              label: 'Status',
              options: {
                active: 'Active',
                inactive: 'Inactive',
              },
            },
          },
        },
      },
    });

    expect(data.objects?.account.fields?.name.label).toBe('Account Name');
    expect(data.objects?.account.fields?.status.options?.active).toBe('Active');
  });

  it('should accept app translations', () => {
    const data = TranslationDataSchema.parse({
      apps: {
        sales: {
          label: 'Sales',
          description: 'Manage your sales pipeline',
        },
      },
    });

    expect(data.apps?.sales.label).toBe('Sales');
  });

  it('should accept message translations', () => {
    const data = TranslationDataSchema.parse({
      messages: {
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'error.required': 'This field is required',
      },
    });

    expect(data.messages?.['common.save']).toBe('Save');
  });

  it('should accept complete translation data', () => {
    const data = TranslationDataSchema.parse({
      objects: {
        account: {
          label: 'Account',
          pluralLabel: 'Accounts',
          fields: {
            name: {
              label: 'Name',
            },
          },
        },
      },
      apps: {
        sales: {
          label: 'Sales',
        },
      },
      messages: {
        'common.save': 'Save',
      },
    });

    expect(data.objects).toBeDefined();
    expect(data.apps).toBeDefined();
    expect(data.messages).toBeDefined();
  });
});

describe('TranslationBundleSchema', () => {
  it('should accept valid translation bundle', () => {
    const bundle: TranslationBundle = {
      'en-US': {
        objects: {
          account: {
            label: 'Account',
            pluralLabel: 'Accounts',
          },
        },
      },
    };

    expect(() => TranslationBundleSchema.parse(bundle)).not.toThrow();
  });

  it('should accept multi-language bundle', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        objects: {
          account: {
            label: 'Account',
          },
        },
        messages: {
          'common.save': 'Save',
        },
      },
      'zh-CN': {
        objects: {
          account: {
            label: '客户',
          },
        },
        messages: {
          'common.save': '保存',
        },
      },
    });

    expect(bundle['en-US'].objects?.account.label).toBe('Account');
    expect(bundle['zh-CN'].objects?.account.label).toBe('客户');
  });

  it('should handle English translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        objects: {
          account: {
            label: 'Account',
            pluralLabel: 'Accounts',
            fields: {
              name: {
                label: 'Account Name',
                help: 'The name of the account',
              },
              type: {
                label: 'Type',
                options: {
                  customer: 'Customer',
                  partner: 'Partner',
                  vendor: 'Vendor',
                },
              },
            },
          },
        },
        apps: {
          sales: {
            label: 'Sales',
            description: 'Manage your sales pipeline',
          },
        },
        messages: {
          'common.save': 'Save',
          'common.cancel': 'Cancel',
          'common.delete': 'Delete',
        },
      },
    });

    expect(bundle['en-US'].objects?.account.label).toBe('Account');
  });

  it('should handle Chinese translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'zh-CN': {
        objects: {
          account: {
            label: '客户',
            pluralLabel: '客户',
            fields: {
              name: {
                label: '客户名称',
                help: '输入客户名称',
              },
            },
          },
        },
        messages: {
          'common.save': '保存',
          'common.cancel': '取消',
        },
      },
    });

    expect(bundle['zh-CN'].objects?.account.label).toBe('客户');
  });

  it('should handle Spanish translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'es-ES': {
        objects: {
          account: {
            label: 'Cuenta',
            pluralLabel: 'Cuentas',
          },
        },
        messages: {
          'common.save': 'Guardar',
          'common.cancel': 'Cancelar',
        },
      },
    });

    expect(bundle['es-ES'].objects?.account.label).toBe('Cuenta');
  });

  it('should handle field option translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        objects: {
          opportunity: {
            label: 'Opportunity',
            fields: {
              stage: {
                label: 'Stage',
                options: {
                  prospecting: 'Prospecting',
                  qualification: 'Qualification',
                  proposal: 'Proposal',
                  closed_won: 'Closed Won',
                  closed_lost: 'Closed Lost',
                },
              },
            },
          },
        },
      },
      'zh-CN': {
        objects: {
          opportunity: {
            label: '商机',
            fields: {
              stage: {
                label: '阶段',
                options: {
                  prospecting: '寻找客户',
                  qualification: '资格审查',
                  proposal: '提案',
                  closed_won: '成交',
                  closed_lost: '失败',
                },
              },
            },
          },
        },
      },
    });

    expect(bundle['en-US'].objects?.opportunity.fields?.stage.options?.prospecting).toBe('Prospecting');
    expect(bundle['zh-CN'].objects?.opportunity.fields?.stage.options?.prospecting).toBe('寻找客户');
  });

  it('should handle app menu translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        apps: {
          sales: {
            label: 'Sales',
            description: 'Manage your sales pipeline and opportunities',
          },
          service: {
            label: 'Service',
            description: 'Handle customer support cases',
          },
        },
      },
      'fr-FR': {
        apps: {
          sales: {
            label: 'Ventes',
            description: 'Gérez votre pipeline de ventes',
          },
          service: {
            label: 'Service',
            description: 'Gérez les cas de support client',
          },
        },
      },
    });

    expect(bundle['en-US'].apps?.sales.label).toBe('Sales');
    expect(bundle['fr-FR'].apps?.sales.label).toBe('Ventes');
  });

  it('should handle UI message translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        messages: {
          'error.required': 'This field is required',
          'error.invalid_email': 'Invalid email address',
          'success.saved': 'Successfully saved',
          'confirm.delete': 'Are you sure you want to delete this record?',
        },
      },
      'de-DE': {
        messages: {
          'error.required': 'Dieses Feld ist erforderlich',
          'error.invalid_email': 'Ungültige E-Mail-Adresse',
          'success.saved': 'Erfolgreich gespeichert',
          'confirm.delete': 'Möchten Sie diesen Datensatz wirklich löschen?',
        },
      },
    });

    expect(bundle['en-US'].messages?.['error.required']).toBe('This field is required');
    expect(bundle['de-DE'].messages?.['error.required']).toBe('Dieses Feld ist erforderlich');
  });

  it('should accept empty locale data', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {},
      'zh-CN': {},
    });

    expect(bundle['en-US']).toBeDefined();
    expect(bundle['zh-CN']).toBeDefined();
  });

  it('should handle partial translations', () => {
    const bundle = TranslationBundleSchema.parse({
      'en-US': {
        objects: {
          account: {
            label: 'Account',
          },
        },
        messages: {
          'common.save': 'Save',
        },
      },
      'zh-CN': {
        objects: {
          account: {
            label: '客户',
          },
        },
        // messages not translated yet
      },
    });

    expect(bundle['zh-CN'].objects?.account.label).toBe('客户');
    expect(bundle['zh-CN'].messages).toBeUndefined();
  });
});

// ============================================================================
// Protocol Improvement Tests: Translation validationMessages
// ============================================================================

describe('TranslationDataSchema - validationMessages', () => {
  it('should accept translation data with validationMessages', () => {
    const data = TranslationDataSchema.parse({
      validationMessages: {
        'discount_limit': 'Discount cannot exceed 40%',
        'amount_required': 'Amount is required for closed deals',
      },
    });
    expect(data.validationMessages?.['discount_limit']).toBe('Discount cannot exceed 40%');
    expect(data.validationMessages?.['amount_required']).toBe('Amount is required for closed deals');
  });

  it('should accept Chinese validation messages', () => {
    const bundle = TranslationBundleSchema.parse({
      'zh-CN': {
        validationMessages: {
          'discount_limit': '折扣不能超过40%',
          'end_date_check': '结束日期必须大于开始日期',
        },
      },
    });
    expect(bundle['zh-CN'].validationMessages?.['discount_limit']).toBe('折扣不能超过40%');
  });

  it('should accept translation data without validationMessages (optional)', () => {
    const data = TranslationDataSchema.parse({
      messages: { 'save': 'Save' },
    });
    expect(data.validationMessages).toBeUndefined();
  });
});
