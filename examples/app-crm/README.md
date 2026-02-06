# ObjectStack Enterprise CRM Application

[English](#english) | [中文](#中文)

---

## English

### 🎯 Overview

**Enterprise CRM** is a comprehensive, production-ready Customer Relationship Management system built on the ObjectStack Protocol. It demonstrates all 128+ protocol modules across 15 categories, showcasing enterprise-grade architecture following Salesforce and ServiceNow best practices.

### ✨ Key Features

#### 📊 **Complete Data Model**
- **10 Core Objects** organized by domain (Sales, Service, Marketing, Products)
- **50+ Field Types** including advanced types (Location, Color, Address)
- **Comprehensive Relationships** with lookups and master-detail
- **Smart Validations** with script-based rules and formulas

#### 🔒 **Enterprise Security**
- **5 User Profiles** (Admin, Sales Manager, Sales Rep, Service Agent, Marketing User)
- **Role Hierarchy** with 10 roles
- **Sharing Rules** (criteria-based, owner-based, territory-based)
- **Field-Level Security** for sensitive data
- **Organization-Wide Defaults** for baseline access control

#### 🤖 **AI-Powered Automation**
- **5 AI Agents** (Sales Assistant, Service Agent, Lead Enrichment, Revenue Intelligence, Email Campaign)
- **4 RAG Pipelines** for knowledge retrieval
- **Natural Language Queries** for intuitive data access
- **Predictive Analytics** (lead scoring, revenue forecasting)

#### ⚡ **Business Process Automation**
- **5 Automated Flows** (Lead Conversion, Opportunity Approval, Case Escalation, Quote Generation, Campaign Enrollment)
- **Workflow Rules** for field updates and notifications
- **Approval Processes** for large deals and contracts
- **Scheduled Jobs** for batch processing

#### 📈 **Analytics & Reporting**
- **3 Interactive Dashboards** (Sales, Service, Executive)
- **8 Pre-built Reports** (opportunities, accounts, cases, leads, tasks)
- **Real-time Metrics** with KPIs and trends
- **Custom Charts** (funnel, bar, line, pie, table)

### 📁 Architecture

```
src/
├── domains/              # Domain-Driven Design
│   ├── sales/           # Account, Contact, Lead, Opportunity, Quote, Contract
│   ├── service/         # Case, Task
│   ├── marketing/       # Campaign
│   └── products/        # Product
├── ui/                  # User Interface
│   ├── dashboards.ts    # 3 dashboards
│   ├── reports.ts       # 8 reports
│   └── actions.ts       # Custom actions
├── security/            # Security Model
│   ├── profiles.ts      # 5 profiles
│   └── sharing-rules.ts # Sharing and OWD
├── automation/          # Business Logic
│   └── flows.ts         # 5 flows
├── ai/                  # AI & Machine Learning
│   ├── agents.ts        # 5 AI agents
│   └── rag-pipelines.ts # 4 RAG pipelines
└── server/              # Custom APIs
    └── apis.ts          # REST endpoints
```

### 📚 Documentation

Comprehensive guides covering all aspects:

1. **[Data Modeling](./docs/01-data-modeling.md)** - Objects, fields, relationships, validations
2. **[Business Logic](./docs/02-business-logic.md)** - Workflows, triggers, formulas
3. **[Security](./docs/05-security.md)** - Profiles, roles, sharing, permissions
4. **[AI Capabilities](./docs/08-ai-capabilities.md)** - Agents, RAG, NLQ, ML

### 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build the application
pnpm --filter @example/app-crm build

# Run development server
pnpm --filter @example/app-crm dev
```

### 📦 What's Included

| Category | Count | Examples |
|----------|-------|----------|
| **Objects** | 10 | Account, Opportunity, Case, Product |
| **Fields** | 100+ | AutoNumber, Formula, Lookup, Address |
| **Profiles** | 5 | Admin, Sales Manager, Sales Rep |
| **Sharing Rules** | 5+ | Criteria-based, Territory-based |
| **AI Agents** | 5 | Sales Assistant, Service Agent |
| **RAG Pipelines** | 4 | Sales Knowledge, Support KB |
| **Flows** | 5 | Lead Conversion, Approval |
| **Dashboards** | 3 | Sales, Service, Executive |
| **Reports** | 8 | Opportunities, Cases, Leads |

---

## 中文

### 🎯 概述

**企业级CRM** 是基于 ObjectStack 协议构建的综合性、生产就绪的客户关系管理系统。它展示了15个类别中的128+协议模块,遵循 Salesforce 和 ServiceNow 的企业级架构最佳实践。

### ✨ 核心特性

#### 📊 **完整数据模型**
- **10个核心对象** 按领域组织（销售、服务、营销、产品）
- **50+字段类型** 包括高级类型（位置、颜色、地址）
- **全面的关系** 查找和主从关系
- **智能验证** 基于脚本的规则和公式

#### 🔒 **企业级安全**
- **5种用户配置文件** （管理员、销售经理、销售代表、服务代表、营销用户）
- **角色层次结构** 包含10个角色
- **共享规则** （基于条件、基于所有者、基于区域）
- **字段级安全** 保护敏感数据
- **组织范围默认值** 基线访问控制

#### 🤖 **AI驱动自动化**
- **5个AI代理** （销售助手、服务代理、线索丰富、收入智能、邮件营销）
- **4个RAG管道** 用于知识检索
- **自然语言查询** 直观的数据访问
- **预测分析** （线索评分、收入预测）

#### ⚡ **业务流程自动化**
- **5个自动化流程** （线索转换、商机审批、案例升级、报价生成、营销注册）
- **工作流规则** 字段更新和通知
- **审批流程** 大型交易和合同
- **定时任务** 批处理

#### 📈 **分析与报表**
- **3个交互式仪表板** （销售、服务、高管）
- **8个预制报表** （商机、客户、案例、线索、任务）
- **实时指标** KPI和趋势
- **自定义图表** （漏斗、柱状、折线、饼图、表格）

### 📚 文档

1. **[数据建模](./docs/01-data-modeling.md)** - 对象、字段、关系、验证
2. **[业务逻辑](./docs/02-business-logic.md)** - 工作流、触发器、公式
3. **[安全模型](./docs/05-security.md)** - 配置文件、角色、共享、权限
4. **[AI能力](./docs/08-ai-capabilities.md)** - 代理、RAG、NLQ、机器学习

### 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 构建应用
pnpm --filter @example/app-crm build

# 运行开发服务器
pnpm --filter @example/app-crm dev
```

---

**构建全球最顶级的企业管理软件平台** 🚀
