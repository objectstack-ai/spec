// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { TranslationData } from '@objectstack/spec/system';

/**
 * 简体中文 (zh-CN) — CRM App Translations
 *
 * Per-locale file: one file per language, following the `per_locale` convention.
 */
export const zhCN: TranslationData = {
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
        reports_to: { label: '直属上级', help: '直属上级/主管' },
        mailing_street: { label: '邮寄地址' },
        mailing_city: { label: '邮寄城市' },
        mailing_state: { label: '邮寄省份' },
        mailing_postal_code: { label: '邮政编码' },
        mailing_country: { label: '邮寄国家' },
        birthdate: { label: '生日' },
        lead_source: {
          label: '线索来源',
          options: {
            web: '网站', referral: '推荐', event: '活动',
            partner: '合作伙伴', advertisement: '广告',
          },
        },
        do_not_call: { label: '禁止致电' },
        email_opt_out: { label: '拒绝邮件' },
        avatar: { label: '头像' },
      },
    },

    lead: {
      label: '线索',
      pluralLabel: '线索',
      description: '尚未确认的潜在客户',
      fields: {
        salutation: {
          label: '称谓',
          options: { mr: '先生', ms: '女士', mrs: '夫人', dr: '博士' },
        },
        first_name: { label: '名' },
        last_name: { label: '姓' },
        full_name: { label: '全名' },
        company: { label: '公司' },
        title: { label: '职位' },
        email: { label: '邮箱' },
        phone: { label: '电话' },
        industry: {
          label: '行业',
          options: {
            technology: '科技', finance: '金融', healthcare: '医疗',
            retail: '零售', manufacturing: '制造', education: '教育',
          },
        },
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

    quote: {
      label: '报价单',
      pluralLabel: '报价单',
      description: '发送给客户的价格报价',
      fields: {
        quote_number: { label: '报价单编号' },
        name: { label: '报价名称' },
        account: { label: '所属客户' },
        opportunity: { label: '关联商机' },
        status: {
          label: '状态',
          options: {
            draft: '草稿', presented: '已提交', accepted: '已接受',
            rejected: '已拒绝', expired: '已过期',
          },
        },
        total_price: { label: '总金额' },
        discount: { label: '折扣 (%)' },
        expiration_date: { label: '到期日期' },
        description: { label: '描述' },
      },
    },

    contract: {
      label: '合同',
      pluralLabel: '合同',
      description: '与客户签署的法律合同',
      fields: {
        contract_number: { label: '合同编号' },
        account: { label: '所属客户' },
        status: {
          label: '状态',
          options: {
            draft: '草稿', active: '生效中', expired: '已过期', terminated: '已终止',
          },
        },
        start_date: { label: '开始日期' },
        end_date: { label: '结束日期' },
        contract_value: { label: '合同金额' },
        description: { label: '描述' },
      },
    },

    case: {
      label: '服务案例',
      pluralLabel: '服务案例',
      description: '客户支持案例与服务请求',
      fields: {
        case_number: { label: '案例编号' },
        subject: { label: '主题' },
        description: { label: '描述' },
        account: { label: '所属客户' },
        contact: { label: '联系人' },
        status: {
          label: '状态',
          options: {
            new: '新建', in_progress: '处理中', waiting: '等待中',
            resolved: '已解决', closed: '已关闭',
          },
        },
        priority: {
          label: '优先级',
          options: { low: '低', medium: '中', high: '高', critical: '紧急' },
        },
        type: { label: '类型' },
        owner: { label: '负责人' },
      },
    },

    task: {
      label: '任务',
      pluralLabel: '任务',
      description: '活动与待办事项',
      fields: {
        subject: { label: '主题' },
        description: { label: '描述' },
        status: {
          label: '状态',
          options: {
            not_started: '未开始', in_progress: '进行中',
            completed: '已完成', deferred: '已推迟', cancelled: '已取消',
          },
        },
        priority: {
          label: '优先级',
          options: { low: '低', normal: '普通', high: '高' },
        },
        due_date: { label: '截止日期' },
        assigned_to: { label: '负责人' },
        related_to: { label: '关联对象' },
      },
    },

    campaign: {
      label: '营销活动',
      pluralLabel: '营销活动',
      description: '市场营销活动与推广',
      fields: {
        campaign_code: { label: '活动代码' },
        name: { label: '活动名称' },
        type: {
          label: '类型',
          options: {
            email: '邮件营销', webinar: '线上研讨会', event: '线下活动',
            advertising: '广告', 'direct-mail': '直邮', telemarketing: '电话营销',
          },
        },
        status: {
          label: '状态',
          options: {
            planned: '已计划', in_progress: '进行中',
            completed: '已完成', aborted: '已中止',
          },
        },
        start_date: { label: '开始日期' },
        end_date: { label: '结束日期' },
        budget: { label: '预算' },
        expected_revenue: { label: '预期收入' },
        description: { label: '描述' },
      },
    },

    product: {
      label: '产品',
      pluralLabel: '产品',
      description: '公司提供的产品与服务',
      fields: {
        product_code: { label: '产品代码' },
        name: { label: '产品名称' },
        category: {
          label: '产品类别',
          options: {
            software: '软件', hardware: '硬件', service: '服务',
            subscription: '订阅', training: '培训',
          },
        },
        price: { label: '单价' },
        cost: { label: '成本' },
        is_active: { label: '是否启用' },
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

  dashboards: {
    sales_dashboard: {
      label: '销售业绩',
      description: '管道分析、赢率趋势及销售代表绩效',
      actions: {
        create_opportunity: { label: '新建商机' },
        '/reports/forecast': { label: '预测' },
        export_dashboard_pdf: { label: '导出' },
      },
      widgets: {
        total_pipeline_value: { title: '管道总额', description: '所有进行中商机金额合计' },
        closed_won_qtd: { title: '本季度已成交', description: '本季度已赢得的收入' },
        open_opportunities: { title: '进行中商机', description: '正在推进的活跃商机' },
        avg_deal_size: { title: '平均订单金额', description: '本季度已成交商机的平均金额' },
        pipeline_by_stage: { title: '阶段管道分布', description: '按阶段统计的进行中商机金额' },
        monthly_revenue_trend: { title: '月度收入趋势', description: '过去 12 个月的已成交收入' },
        opportunities_by_owner: { title: '负责人商机分布', description: '各销售负责的进行中商机' },
        lead_source_breakdown: { title: '线索来源分布', description: '按来源统计的线索数量' },
        top_opportunities: { title: '重点商机', description: '当前金额最高的进行中商机' },
      },
    },
  },
};
