// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationData } from '@objectstack/spec/system';

/**
 * 日本語 (ja-JP) — CRM App Translations
 *
 * Per-locale file: one file per language, following the `per_locale` convention.
 */
export const jaJP: TranslationData = {
  objects: {
    account: {
      label: '取引先',
      pluralLabel: '取引先',
      fields: {
        account_number: { label: '取引先番号' },
        name: { label: '取引先名', help: '会社または組織の正式名称' },
        type: {
          label: 'タイプ',
          options: { prospect: '見込み客', customer: '顧客', partner: 'パートナー', former: '過去の取引先' },
        },
        industry: {
          label: '業種',
          options: {
            technology: 'テクノロジー', finance: '金融', healthcare: 'ヘルスケア',
            retail: '小売', manufacturing: '製造', education: '教育',
          },
        },
        annual_revenue: { label: '年間売上' },
        number_of_employees: { label: '従業員数' },
        phone: { label: '電話番号' },
        website: { label: 'Webサイト' },
        billing_address: { label: '請求先住所' },
        office_location: { label: 'オフィス所在地' },
        owner: { label: '取引先責任者' },
        parent_account: { label: '親取引先' },
        description: { label: '説明' },
        is_active: { label: '有効' },
        last_activity_date: { label: '最終活動日' },
      },
    },

    contact: {
      label: '取引先責任者',
      pluralLabel: '取引先責任者',
      fields: {
        salutation: { label: '敬称' },
        first_name: { label: '名' },
        last_name: { label: '姓' },
        full_name: { label: '氏名' },
        account: { label: '取引先' },
        email: { label: 'メール' },
        phone: { label: '電話' },
        mobile: { label: '携帯電話' },
        title: { label: '役職' },
        department: {
          label: '部門',
          options: {
            Executive: '経営層', Sales: '営業部', Marketing: 'マーケティング部',
            Engineering: 'エンジニアリング部', Support: 'サポート部', Finance: '経理部',
            HR: '人事部', Operations: 'オペレーション部',
          },
        },
        owner: { label: '所有者' },
        description: { label: '説明' },
        is_primary: { label: '主担当者' },
      },
    },

    lead: {
      label: 'リード',
      pluralLabel: 'リード',
      fields: {
        first_name: { label: '名' },
        last_name: { label: '姓' },
        company: { label: '会社名' },
        title: { label: '役職' },
        email: { label: 'メール' },
        phone: { label: '電話' },
        status: {
          label: 'ステータス',
          options: {
            new: '新規', contacted: 'コンタクト済み', qualified: '適格',
            unqualified: '不適格', converted: '取引開始済み',
          },
        },
        lead_source: {
          label: 'リードソース',
          options: {
            Web: 'Web', Referral: '紹介', Event: 'イベント',
            Partner: 'パートナー', Advertisement: '広告', 'Cold Call': 'コールドコール',
          },
        },
        owner: { label: 'リード所有者' },
        is_converted: { label: '取引開始済み' },
        description: { label: '説明' },
      },
    },

    opportunity: {
      label: '商談',
      pluralLabel: '商談',
      fields: {
        name: { label: '商談名' },
        account: { label: '取引先' },
        primary_contact: { label: '主担当者' },
        owner: { label: '商談所有者' },
        amount: { label: '金額' },
        expected_revenue: { label: '期待収益' },
        stage: {
          label: 'フェーズ',
          options: {
            prospecting: '見込み調査', qualification: '選定',
            needs_analysis: 'ニーズ分析', proposal: '提案',
            negotiation: '交渉', closed_won: '成立', closed_lost: '不成立',
          },
        },
        probability: { label: '確度 (%)' },
        close_date: { label: '完了予定日' },
        type: {
          label: 'タイプ',
          options: {
            'New Business': '新規ビジネス',
            'Existing Customer - Upgrade': '既存顧客 - アップグレード',
            'Existing Customer - Renewal': '既存顧客 - 更新',
            'Existing Customer - Expansion': '既存顧客 - 拡大',
          },
        },
        forecast_category: {
          label: '売上予測カテゴリ',
          options: {
            Pipeline: 'パイプライン', 'Best Case': '最良ケース',
            Commit: 'コミット', Omitted: '除外', Closed: '完了',
          },
        },
        description: { label: '説明' },
        next_step: { label: '次のステップ' },
      },
    },
  },

  apps: {
    crm_enterprise: {
      label: 'エンタープライズ CRM',
      description: '営業・サービス・マーケティング向け顧客関係管理システム',
    },
  },

  messages: {
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.create': '新規作成',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.export': 'エクスポート',
    'common.back': '戻る',
    'common.confirm': '確認',
    'nav.sales': '営業',
    'nav.service': 'サービス',
    'nav.marketing': 'マーケティング',
    'nav.products': '製品',
    'nav.analytics': 'アナリティクス',
    'success.saved': 'レコードを保存しました',
    'success.converted': 'リードを取引開始しました',
    'confirm.delete': 'このレコードを削除してもよろしいですか？',
    'confirm.convert_lead': 'このリードを取引先・取引先責任者・商談に変換しますか？',
    'error.required': 'この項目は必須です',
    'error.load_failed': 'データの読み込みに失敗しました',
  },

  validationMessages: {
    amount_required_for_closed: 'フェーズが「成立」の場合、金額は必須です',
    close_date_required: '商談には完了予定日が必要です',
    discount_limit: '割引は40%を超えることはできません',
  },
};
