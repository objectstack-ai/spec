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
};
