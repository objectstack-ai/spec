// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationBundle } from '@objectstack/spec/system';

/**
 * CRM App — Internationalization (i18n)
 *
 * Enterprise-grade multi-language translations covering:
 * - Core CRM objects: Account, Contact, Lead, Opportunity
 * - Select-field option labels for each object
 * - App & navigation group labels
 * - Common UI messages, validation messages
 *
 * Supported locales: en, zh-CN, ja-JP, es-ES
 */
export const CrmTranslations: TranslationBundle = {
  // ─── English (base) ───────────────────────────────────────────────
  en: {
    objects: {
      account: {
        label: 'Account',
        pluralLabel: 'Accounts',
        fields: {
          account_number: { label: 'Account Number' },
          name: { label: 'Account Name', help: 'Legal name of the company or organization' },
          type: {
            label: 'Type',
            options: { prospect: 'Prospect', customer: 'Customer', partner: 'Partner', former: 'Former' },
          },
          industry: {
            label: 'Industry',
            options: {
              technology: 'Technology', finance: 'Finance', healthcare: 'Healthcare',
              retail: 'Retail', manufacturing: 'Manufacturing', education: 'Education',
            },
          },
          annual_revenue: { label: 'Annual Revenue' },
          number_of_employees: { label: 'Number of Employees' },
          phone: { label: 'Phone' },
          website: { label: 'Website' },
          billing_address: { label: 'Billing Address' },
          office_location: { label: 'Office Location' },
          owner: { label: 'Account Owner' },
          parent_account: { label: 'Parent Account' },
          description: { label: 'Description' },
          is_active: { label: 'Active' },
          last_activity_date: { label: 'Last Activity Date' },
        },
      },

      contact: {
        label: 'Contact',
        pluralLabel: 'Contacts',
        fields: {
          salutation: { label: 'Salutation' },
          first_name: { label: 'First Name' },
          last_name: { label: 'Last Name' },
          full_name: { label: 'Full Name' },
          account: { label: 'Account' },
          email: { label: 'Email' },
          phone: { label: 'Phone' },
          mobile: { label: 'Mobile' },
          title: { label: 'Title' },
          department: {
            label: 'Department',
            options: {
              Executive: 'Executive', Sales: 'Sales', Marketing: 'Marketing',
              Engineering: 'Engineering', Support: 'Support', Finance: 'Finance',
              HR: 'Human Resources', Operations: 'Operations',
            },
          },
          owner: { label: 'Contact Owner' },
          description: { label: 'Description' },
          is_primary: { label: 'Primary Contact' },
        },
      },

      lead: {
        label: 'Lead',
        pluralLabel: 'Leads',
        fields: {
          first_name: { label: 'First Name' },
          last_name: { label: 'Last Name' },
          company: { label: 'Company' },
          title: { label: 'Title' },
          email: { label: 'Email' },
          phone: { label: 'Phone' },
          status: {
            label: 'Status',
            options: {
              new: 'New', contacted: 'Contacted', qualified: 'Qualified',
              unqualified: 'Unqualified', converted: 'Converted',
            },
          },
          lead_source: {
            label: 'Lead Source',
            options: {
              Web: 'Web', Referral: 'Referral', Event: 'Event',
              Partner: 'Partner', Advertisement: 'Advertisement', 'Cold Call': 'Cold Call',
            },
          },
          owner: { label: 'Lead Owner' },
          is_converted: { label: 'Converted' },
          description: { label: 'Description' },
        },
      },

      opportunity: {
        label: 'Opportunity',
        pluralLabel: 'Opportunities',
        fields: {
          name: { label: 'Opportunity Name' },
          account: { label: 'Account' },
          primary_contact: { label: 'Primary Contact' },
          owner: { label: 'Opportunity Owner' },
          amount: { label: 'Amount' },
          expected_revenue: { label: 'Expected Revenue' },
          stage: {
            label: 'Stage',
            options: {
              prospecting: 'Prospecting', qualification: 'Qualification',
              needs_analysis: 'Needs Analysis', proposal: 'Proposal',
              negotiation: 'Negotiation', closed_won: 'Closed Won', closed_lost: 'Closed Lost',
            },
          },
          probability: { label: 'Probability (%)' },
          close_date: { label: 'Close Date' },
          type: {
            label: 'Type',
            options: {
              'New Business': 'New Business',
              'Existing Customer - Upgrade': 'Existing Customer - Upgrade',
              'Existing Customer - Renewal': 'Existing Customer - Renewal',
              'Existing Customer - Expansion': 'Existing Customer - Expansion',
            },
          },
          forecast_category: {
            label: 'Forecast Category',
            options: {
              Pipeline: 'Pipeline', 'Best Case': 'Best Case',
              Commit: 'Commit', Omitted: 'Omitted', Closed: 'Closed',
            },
          },
          description: { label: 'Description' },
          next_step: { label: 'Next Step' },
        },
      },
    },

    apps: {
      crm_enterprise: {
        label: 'Enterprise CRM',
        description: 'Customer relationship management for sales, service, and marketing',
      },
    },

    messages: {
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.back': 'Back',
      'common.confirm': 'Confirm',
      'nav.sales': 'Sales',
      'nav.service': 'Service',
      'nav.marketing': 'Marketing',
      'nav.products': 'Products',
      'nav.analytics': 'Analytics',
      'success.saved': 'Record saved successfully',
      'success.converted': 'Lead converted successfully',
      'confirm.delete': 'Are you sure you want to delete this record?',
      'confirm.convert_lead': 'Convert this lead to account, contact, and opportunity?',
      'error.required': 'This field is required',
      'error.load_failed': 'Failed to load data',
    },

    validationMessages: {
      amount_required_for_closed: 'Amount is required when stage is Closed Won',
      close_date_required: 'Close date is required for opportunities',
      discount_limit: 'Discount cannot exceed 40%',
    },
  },

  // ─── Chinese Simplified ───────────────────────────────────────────
  'zh-CN': {
    objects: {
      account: {
        label: '客户',
        pluralLabel: '客户',
        fields: {
          account_number: { label: '客户编号' },
          name: { label: '客户名称', help: '公司或组织的法定名称' },
          type: {
            label: '类型',
            options: { prospect: '潜在客户', customer: '正式客户', partner: '合作伙伴', former: '前客户' },
          },
          industry: {
            label: '行业',
            options: {
              technology: '科技', finance: '金融', healthcare: '医疗',
              retail: '零售', manufacturing: '制造', education: '教育',
            },
          },
          annual_revenue: { label: '年营收' },
          number_of_employees: { label: '员工人数' },
          phone: { label: '电话' },
          website: { label: '网站' },
          billing_address: { label: '账单地址' },
          office_location: { label: '办公地点' },
          owner: { label: '客户负责人' },
          parent_account: { label: '母公司' },
          description: { label: '描述' },
          is_active: { label: '是否活跃' },
          last_activity_date: { label: '最近活动日期' },
        },
      },

      contact: {
        label: '联系人',
        pluralLabel: '联系人',
        fields: {
          salutation: { label: '称谓' },
          first_name: { label: '名' },
          last_name: { label: '姓' },
          full_name: { label: '全名' },
          account: { label: '所属客户' },
          email: { label: '邮箱' },
          phone: { label: '电话' },
          mobile: { label: '手机' },
          title: { label: '职位' },
          department: {
            label: '部门',
            options: {
              Executive: '管理层', Sales: '销售部', Marketing: '市场部',
              Engineering: '工程部', Support: '支持部', Finance: '财务部',
              HR: '人力资源', Operations: '运营部',
            },
          },
          owner: { label: '联系人负责人' },
          description: { label: '描述' },
          is_primary: { label: '主要联系人' },
        },
      },

      lead: {
        label: '线索',
        pluralLabel: '线索',
        fields: {
          first_name: { label: '名' },
          last_name: { label: '姓' },
          company: { label: '公司' },
          title: { label: '职位' },
          email: { label: '邮箱' },
          phone: { label: '电话' },
          status: {
            label: '状态',
            options: {
              new: '新建', contacted: '已联系', qualified: '已确认',
              unqualified: '不合格', converted: '已转化',
            },
          },
          lead_source: {
            label: '线索来源',
            options: {
              Web: '网站', Referral: '推荐', Event: '活动',
              Partner: '合作伙伴', Advertisement: '广告', 'Cold Call': '陌生拜访',
            },
          },
          owner: { label: '线索负责人' },
          is_converted: { label: '已转化' },
          description: { label: '描述' },
        },
      },

      opportunity: {
        label: '商机',
        pluralLabel: '商机',
        fields: {
          name: { label: '商机名称' },
          account: { label: '所属客户' },
          primary_contact: { label: '主要联系人' },
          owner: { label: '商机负责人' },
          amount: { label: '金额' },
          expected_revenue: { label: '预期收入' },
          stage: {
            label: '阶段',
            options: {
              prospecting: '寻找客户', qualification: '资格审查',
              needs_analysis: '需求分析', proposal: '提案',
              negotiation: '谈判', closed_won: '成交', closed_lost: '失败',
            },
          },
          probability: { label: '成交概率 (%)' },
          close_date: { label: '预计成交日期' },
          type: {
            label: '类型',
            options: {
              'New Business': '新业务',
              'Existing Customer - Upgrade': '老客户升级',
              'Existing Customer - Renewal': '老客户续约',
              'Existing Customer - Expansion': '老客户拓展',
            },
          },
          forecast_category: {
            label: '预测类别',
            options: {
              Pipeline: '管道', 'Best Case': '最佳情况',
              Commit: '承诺', Omitted: '已排除', Closed: '已关闭',
            },
          },
          description: { label: '描述' },
          next_step: { label: '下一步' },
        },
      },
    },

    apps: {
      crm_enterprise: {
        label: '企业 CRM',
        description: '涵盖销售、服务和市场营销的客户关系管理系统',
      },
    },

    messages: {
      'common.save': '保存',
      'common.cancel': '取消',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.create': '新建',
      'common.search': '搜索',
      'common.filter': '筛选',
      'common.export': '导出',
      'common.back': '返回',
      'common.confirm': '确认',
      'nav.sales': '销售',
      'nav.service': '服务',
      'nav.marketing': '营销',
      'nav.products': '产品',
      'nav.analytics': '数据分析',
      'success.saved': '记录保存成功',
      'success.converted': '线索转化成功',
      'confirm.delete': '确定要删除此记录吗？',
      'confirm.convert_lead': '将此线索转化为客户、联系人和商机？',
      'error.required': '此字段为必填项',
      'error.load_failed': '数据加载失败',
    },

    validationMessages: {
      amount_required_for_closed: '阶段为"成交"时，金额为必填项',
      close_date_required: '商机必须填写预计成交日期',
      discount_limit: '折扣不能超过40%',
    },
  },

  // ─── Japanese ─────────────────────────────────────────────────────
  'ja-JP': {
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
  },

  // ─── Spanish ──────────────────────────────────────────────────────
  'es-ES': {
    objects: {
      account: {
        label: 'Cuenta',
        pluralLabel: 'Cuentas',
        fields: {
          account_number: { label: 'Número de Cuenta' },
          name: { label: 'Nombre de Cuenta', help: 'Nombre legal de la empresa u organización' },
          type: {
            label: 'Tipo',
            options: { prospect: 'Prospecto', customer: 'Cliente', partner: 'Socio', former: 'Anterior' },
          },
          industry: {
            label: 'Industria',
            options: {
              technology: 'Tecnología', finance: 'Finanzas', healthcare: 'Salud',
              retail: 'Comercio', manufacturing: 'Manufactura', education: 'Educación',
            },
          },
          annual_revenue: { label: 'Ingresos Anuales' },
          number_of_employees: { label: 'Número de Empleados' },
          phone: { label: 'Teléfono' },
          website: { label: 'Sitio Web' },
          billing_address: { label: 'Dirección de Facturación' },
          office_location: { label: 'Ubicación de Oficina' },
          owner: { label: 'Propietario de Cuenta' },
          parent_account: { label: 'Cuenta Matriz' },
          description: { label: 'Descripción' },
          is_active: { label: 'Activo' },
          last_activity_date: { label: 'Fecha de Última Actividad' },
        },
      },

      contact: {
        label: 'Contacto',
        pluralLabel: 'Contactos',
        fields: {
          salutation: { label: 'Título' },
          first_name: { label: 'Nombre' },
          last_name: { label: 'Apellido' },
          full_name: { label: 'Nombre Completo' },
          account: { label: 'Cuenta' },
          email: { label: 'Correo Electrónico' },
          phone: { label: 'Teléfono' },
          mobile: { label: 'Móvil' },
          title: { label: 'Cargo' },
          department: {
            label: 'Departamento',
            options: {
              Executive: 'Ejecutivo', Sales: 'Ventas', Marketing: 'Marketing',
              Engineering: 'Ingeniería', Support: 'Soporte', Finance: 'Finanzas',
              HR: 'Recursos Humanos', Operations: 'Operaciones',
            },
          },
          owner: { label: 'Propietario de Contacto' },
          description: { label: 'Descripción' },
          is_primary: { label: 'Contacto Principal' },
        },
      },

      lead: {
        label: 'Prospecto',
        pluralLabel: 'Prospectos',
        fields: {
          first_name: { label: 'Nombre' },
          last_name: { label: 'Apellido' },
          company: { label: 'Empresa' },
          title: { label: 'Cargo' },
          email: { label: 'Correo Electrónico' },
          phone: { label: 'Teléfono' },
          status: {
            label: 'Estado',
            options: {
              new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado',
              unqualified: 'No Calificado', converted: 'Convertido',
            },
          },
          lead_source: {
            label: 'Origen del Prospecto',
            options: {
              Web: 'Web', Referral: 'Referencia', Event: 'Evento',
              Partner: 'Socio', Advertisement: 'Publicidad', 'Cold Call': 'Llamada en Frío',
            },
          },
          owner: { label: 'Propietario' },
          is_converted: { label: 'Convertido' },
          description: { label: 'Descripción' },
        },
      },

      opportunity: {
        label: 'Oportunidad',
        pluralLabel: 'Oportunidades',
        fields: {
          name: { label: 'Nombre de Oportunidad' },
          account: { label: 'Cuenta' },
          primary_contact: { label: 'Contacto Principal' },
          owner: { label: 'Propietario de Oportunidad' },
          amount: { label: 'Monto' },
          expected_revenue: { label: 'Ingreso Esperado' },
          stage: {
            label: 'Etapa',
            options: {
              prospecting: 'Prospección', qualification: 'Calificación',
              needs_analysis: 'Análisis de Necesidades', proposal: 'Propuesta',
              negotiation: 'Negociación', closed_won: 'Cerrada Ganada', closed_lost: 'Cerrada Perdida',
            },
          },
          probability: { label: 'Probabilidad (%)' },
          close_date: { label: 'Fecha de Cierre' },
          type: {
            label: 'Tipo',
            options: {
              'New Business': 'Nuevo Negocio',
              'Existing Customer - Upgrade': 'Cliente Existente - Mejora',
              'Existing Customer - Renewal': 'Cliente Existente - Renovación',
              'Existing Customer - Expansion': 'Cliente Existente - Expansión',
            },
          },
          forecast_category: {
            label: 'Categoría de Pronóstico',
            options: {
              Pipeline: 'Pipeline', 'Best Case': 'Mejor Caso',
              Commit: 'Compromiso', Omitted: 'Omitida', Closed: 'Cerrada',
            },
          },
          description: { label: 'Descripción' },
          next_step: { label: 'Próximo Paso' },
        },
      },
    },

    apps: {
      crm_enterprise: {
        label: 'CRM Empresarial',
        description: 'Gestión de relaciones con clientes para ventas, servicio y marketing',
      },
    },

    messages: {
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.create': 'Crear',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      'common.export': 'Exportar',
      'common.back': 'Volver',
      'common.confirm': 'Confirmar',
      'nav.sales': 'Ventas',
      'nav.service': 'Servicio',
      'nav.marketing': 'Marketing',
      'nav.products': 'Productos',
      'nav.analytics': 'Analítica',
      'success.saved': 'Registro guardado exitosamente',
      'success.converted': 'Prospecto convertido exitosamente',
      'confirm.delete': '¿Está seguro de que desea eliminar este registro?',
      'confirm.convert_lead': '¿Convertir este prospecto en cuenta, contacto y oportunidad?',
      'error.required': 'Este campo es obligatorio',
      'error.load_failed': 'Error al cargar los datos',
    },

    validationMessages: {
      amount_required_for_closed: 'El monto es obligatorio cuando la etapa es Cerrada Ganada',
      close_date_required: 'La fecha de cierre es obligatoria para las oportunidades',
      discount_limit: 'El descuento no puede superar el 40%',
    },
  },
};
