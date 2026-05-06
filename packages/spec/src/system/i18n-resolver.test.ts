// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect } from 'vitest';
import { ObjectTranslationDataSchema, TranslationDataSchema, type TranslationBundle } from './translation.zod';
import {
  resolveViewLabel,
  resolveViewDescription,
  resolveActionLabel,
  resolveActionConfirm,
  resolveActionSuccess,
  translateMetadataDocument,
} from './i18n-resolver';

describe('ObjectTranslationDataSchema (_views/_actions extensions)', () => {
  it('accepts _views entries', () => {
    const data = ObjectTranslationDataSchema.parse({
      label: '客户',
      _views: {
        all_accounts: { label: '全部客户', description: '所有客户列表' },
        my_accounts: { label: '我的客户' },
      },
    });
    expect(data._views?.all_accounts.label).toBe('全部客户');
    expect(data._views?.all_accounts.description).toBe('所有客户列表');
    expect(data._views?.my_accounts.label).toBe('我的客户');
  });

  it('accepts _actions entries with confirm + success', () => {
    const data = ObjectTranslationDataSchema.parse({
      label: '线索',
      _actions: {
        convert_lead: {
          label: '转化线索',
          confirmText: '确定要转化此线索吗？',
          successMessage: '线索转化成功！',
        },
      },
    });
    expect(data._actions?.convert_lead.label).toBe('转化线索');
    expect(data._actions?.convert_lead.confirmText).toBe('确定要转化此线索吗？');
    expect(data._actions?.convert_lead.successMessage).toBe('线索转化成功！');
  });
});

describe('TranslationDataSchema globalActions', () => {
  it('accepts globalActions', () => {
    const data = TranslationDataSchema.parse({
      globalActions: {
        log_call: { label: '记录通话', successMessage: '通话已记录！' },
        export_csv: { label: '导出 CSV' },
      },
    });
    expect(data.globalActions?.log_call.label).toBe('记录通话');
    expect(data.globalActions?.export_csv.label).toBe('导出 CSV');
  });
});

const bundle: TranslationBundle = {
  en: {
    objects: {
      account: {
        label: 'Account',
        _views: {
          all_accounts: { label: 'All Accounts', description: 'Every account' },
        },
        _actions: {
          merge_accounts: {
            label: 'Merge Accounts',
            confirmText: 'Merge selected accounts?',
            successMessage: 'Accounts merged.',
          },
        },
      },
    },
    globalActions: {
      export_csv: { label: 'Export CSV', successMessage: 'Export ready.' },
    },
  },
  'zh-CN': {
    objects: {
      account: {
        label: '客户',
        _views: { all_accounts: { label: '全部客户', description: '所有客户' } },
        _actions: {
          merge_accounts: {
            label: '合并客户',
            confirmText: '确认合并选中的客户？',
            successMessage: '客户已合并。',
          },
        },
      },
    },
    globalActions: {
      export_csv: { label: '导出 CSV', successMessage: '导出完成。' },
    },
  },
};

describe('resolveViewLabel', () => {
  it('returns translated label for the active locale', () => {
    expect(
      resolveViewLabel(
        bundle,
        { name: 'all_accounts', label: 'All Accounts', objectName: 'account' },
        { locale: 'zh-CN' },
      ),
    ).toBe('全部客户');
  });

  it('falls back through fallbackChain to en', () => {
    expect(
      resolveViewLabel(
        bundle,
        { name: 'all_accounts', label: 'All Accounts', objectName: 'account' },
        { locale: 'fr-FR', fallbackChain: ['en'] },
      ),
    ).toBe('All Accounts');
  });

  it('falls back to literal label when no bundle entry exists', () => {
    expect(
      resolveViewLabel(
        bundle,
        { name: 'unknown_view', label: 'Unknown View', objectName: 'account' },
        { locale: 'zh-CN' },
      ),
    ).toBe('Unknown View');
  });

  it('uses data.object when objectName is missing', () => {
    expect(
      resolveViewLabel(
        bundle,
        { name: 'all_accounts', label: 'All Accounts', data: { object: 'account' } },
        { locale: 'zh-CN' },
      ),
    ).toBe('全部客户');
  });

  it('returns label when bundle is undefined', () => {
    expect(
      resolveViewLabel(undefined, {
        name: 'all_accounts',
        label: 'All Accounts',
        objectName: 'account',
      }),
    ).toBe('All Accounts');
  });
});

describe('resolveViewDescription', () => {
  it('returns translated description', () => {
    expect(
      resolveViewDescription(
        bundle,
        { name: 'all_accounts', objectName: 'account' },
        { locale: 'zh-CN' },
      ),
    ).toBe('所有客户');
  });

  it('falls back to literal description', () => {
    expect(
      resolveViewDescription(
        bundle,
        { name: 'unknown', objectName: 'account', description: 'literal' },
        { locale: 'zh-CN' },
      ),
    ).toBe('literal');
  });
});

describe('resolveActionLabel + confirm + success', () => {
  it('translates an object-bound action', () => {
    const action = {
      name: 'merge_accounts',
      label: 'Merge Accounts',
      objectName: 'account',
      confirmText: 'Merge selected accounts?',
      successMessage: 'Accounts merged.',
    };
    expect(resolveActionLabel(bundle, action, { locale: 'zh-CN' })).toBe('合并客户');
    expect(resolveActionConfirm(bundle, action, { locale: 'zh-CN' })).toBe(
      '确认合并选中的客户？',
    );
    expect(resolveActionSuccess(bundle, action, { locale: 'zh-CN' })).toBe('客户已合并。');
  });

  it('falls back to globalActions for object-less actions', () => {
    const action = {
      name: 'export_csv',
      label: 'Export to CSV',
      successMessage: 'Export completed!',
    };
    expect(resolveActionLabel(bundle, action, { locale: 'zh-CN' })).toBe('导出 CSV');
    expect(resolveActionSuccess(bundle, action, { locale: 'zh-CN' })).toBe('导出完成。');
    expect(resolveActionConfirm(bundle, action, { locale: 'zh-CN' })).toBeUndefined();
  });

  it('returns the literal label when no bundle entry matches', () => {
    expect(
      resolveActionLabel(
        bundle,
        { name: 'unknown_action', label: 'Mystery', objectName: 'account' },
        { locale: 'zh-CN' },
      ),
    ).toBe('Mystery');
  });

  it('returns the action name when neither bundle nor literal label exists', () => {
    expect(
      resolveActionLabel(undefined, { name: 'nameless_action' }),
    ).toBe('nameless_action');
  });
});

describe('translateMetadataDocument', () => {
  it('translates a view document', () => {
    const view = {
      name: 'all_accounts',
      label: 'All Accounts',
      description: 'Every account',
      objectName: 'account',
      kind: 'list',
    };
    const out = translateMetadataDocument('view', view, bundle, { locale: 'zh-CN' });
    expect(out.label).toBe('全部客户');
    expect(out.description).toBe('所有客户');
    expect(out.kind).toBe('list');
    expect(view.label).toBe('All Accounts'); // not mutated
  });

  it('translates an action document with confirm + success', () => {
    const action = {
      name: 'merge_accounts',
      label: 'Merge Accounts',
      objectName: 'account',
      confirmText: 'Merge selected accounts?',
      successMessage: 'Accounts merged.',
    };
    const out = translateMetadataDocument('action', action, bundle, { locale: 'zh-CN' });
    expect(out.label).toBe('合并客户');
    expect(out.confirmText).toBe('确认合并选中的客户？');
    expect(out.successMessage).toBe('客户已合并。');
  });

  it('returns unknown types unchanged', () => {
    const doc = { name: 'foo', label: 'Bar' };
    const out = translateMetadataDocument('mystery', doc, bundle, { locale: 'zh-CN' });
    expect(out).toBe(doc);
  });

  it('returns literal labels when bundle is undefined', () => {
    const view = { name: 'all_accounts', label: 'All Accounts', objectName: 'account' };
    const out = translateMetadataDocument('view', view, undefined, { locale: 'zh-CN' });
    expect(out.label).toBe('All Accounts');
  });
});
