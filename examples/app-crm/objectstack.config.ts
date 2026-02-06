import { defineStack } from '@objectstack/spec';

// ─── Objects ────────────────────────────────────────────────────────
import { Account } from './src/objects/account.object';
import { Contact } from './src/objects/contact.object';
import { Opportunity } from './src/objects/opportunity.object';
import { Lead } from './src/objects/lead.object';
import { Quote } from './src/objects/quote.object';
import { Contract } from './src/objects/contract.object';
import { Case } from './src/objects/case.object';
import { Task } from './src/objects/task.object';
import { Campaign } from './src/objects/campaign.object';
import { Product } from './src/objects/product.object';

// ─── APIs ───────────────────────────────────────────────────────────
import { PipelineStatsApi } from './src/apis/pipeline-stats.api';
import { LeadConvertApi } from './src/apis/lead-convert.api';

// ─── Actions ────────────────────────────────────────────────────────
import { ConvertLeadAction, CreateCampaignAction } from './src/actions/lead.actions';
import { MarkPrimaryContactAction, SendEmailAction } from './src/actions/contact.actions';
import { CloneOpportunityAction, MassUpdateStageAction } from './src/actions/opportunity.actions';
import { EscalateCaseAction, CloseCaseAction } from './src/actions/case.actions';
import { LogCallAction, ExportToCsvAction } from './src/actions/global.actions';

// ─── Dashboards ─────────────────────────────────────────────────────
import { SalesDashboard } from './src/dashboards/sales.dashboard';
import { ServiceDashboard } from './src/dashboards/service.dashboard';
import { ExecutiveDashboard } from './src/dashboards/executive.dashboard';

// ─── Reports ────────────────────────────────────────────────────────
import { OpportunitiesByStageReport, WonOpportunitiesByOwnerReport } from './src/reports/opportunity.report';
import { AccountsByIndustryTypeReport } from './src/reports/account.report';
import { CasesByStatusPriorityReport, SlaPerformanceReport } from './src/reports/case.report';
import { LeadsBySourceReport } from './src/reports/lead.report';
import { ContactsByAccountReport } from './src/reports/contact.report';
import { TasksByOwnerReport } from './src/reports/task.report';

// ─── Flows ──────────────────────────────────────────────────────────
import { LeadConversionFlow } from './src/flows/lead-conversion.flow';
import { OpportunityApprovalFlow } from './src/flows/opportunity-approval.flow';
import { CaseEscalationFlow } from './src/flows/case-escalation.flow';
import { QuoteGenerationFlow } from './src/flows/quote-generation.flow';
import { CampaignEnrollmentFlow } from './src/flows/campaign-enrollment.flow';

// ─── Agents ─────────────────────────────────────────────────────────
import { SalesAssistantAgent } from './src/agents/sales.agent';
import { ServiceAgent } from './src/agents/service.agent';
import { LeadEnrichmentAgent } from './src/agents/lead-enrichment.agent';
import { RevenueIntelligenceAgent } from './src/agents/revenue-intelligence.agent';
import { EmailCampaignAgent } from './src/agents/email-campaign.agent';

// ─── RAG Pipelines ─────────────────────────────────────────────────
import { SalesKnowledgeRAG } from './src/rag/sales-knowledge.rag';
import { SupportKnowledgeRAG } from './src/rag/support-knowledge.rag';
import { ProductInfoRAG } from './src/rag/product-info.rag';
import { CompetitiveIntelRAG } from './src/rag/competitive-intel.rag';

// ─── Profiles ───────────────────────────────────────────────────────
import { SalesRepProfile } from './src/profiles/sales-rep.profile';
import { SalesManagerProfile } from './src/profiles/sales-manager.profile';
import { ServiceAgentProfile } from './src/profiles/service-agent.profile';
import { MarketingUserProfile } from './src/profiles/marketing-user.profile';
import { SystemAdminProfile } from './src/profiles/system-admin.profile';

// ─── Sharing & Security ────────────────────────────────────────────
import { OrganizationDefaults } from './src/sharing/defaults.sharing';
import { AccountTeamSharingRule, TerritorySharingRules } from './src/sharing/account.sharing';
import { OpportunitySalesSharingRule } from './src/sharing/opportunity.sharing';
import { CaseEscalationSharingRule } from './src/sharing/case.sharing';
import { RoleHierarchy } from './src/sharing/role-hierarchy';

// ─── App ────────────────────────────────────────────────────────────
import { CrmApp } from './src/apps/crm.app';

export default defineStack({
  manifest: {
    id: 'com.example.crm',
    version: '3.0.0',
    type: 'app',
    name: 'Enterprise CRM',
    description: 'Comprehensive enterprise CRM demonstrating all ObjectStack Protocol features including AI, security, and automation',
    author: 'ObjectStack Team',
    repository: 'https://github.com/objectstack-ai/spec',
    license: 'MIT',
  },

  objects: [
    Account, Contact, Lead, Opportunity, Quote, Contract,
    Case, Task,
    Campaign,
    Product,
  ],

  apis: [
    PipelineStatsApi,
    LeadConvertApi,
  ],

  actions: [
    ConvertLeadAction, CreateCampaignAction,
    MarkPrimaryContactAction, SendEmailAction,
    CloneOpportunityAction, MassUpdateStageAction,
    EscalateCaseAction, CloseCaseAction,
    LogCallAction, ExportToCsvAction,
  ],

  dashboards: [
    SalesDashboard,
    ServiceDashboard,
    ExecutiveDashboard,
  ],

  reports: [
    OpportunitiesByStageReport, WonOpportunitiesByOwnerReport,
    AccountsByIndustryTypeReport,
    CasesByStatusPriorityReport, SlaPerformanceReport,
    LeadsBySourceReport,
    ContactsByAccountReport,
    TasksByOwnerReport,
  ],

  flows: [
    LeadConversionFlow,
    OpportunityApprovalFlow,
    CaseEscalationFlow,
    QuoteGenerationFlow,
    CampaignEnrollmentFlow,
  ],

  agents: [
    SalesAssistantAgent,
    ServiceAgent,
    LeadEnrichmentAgent,
    RevenueIntelligenceAgent,
    EmailCampaignAgent,
  ],

  ragPipelines: [
    SalesKnowledgeRAG,
    SupportKnowledgeRAG,
    ProductInfoRAG,
    CompetitiveIntelRAG,
  ],

  profiles: [
    SalesRepProfile,
    SalesManagerProfile,
    ServiceAgentProfile,
    MarketingUserProfile,
    SystemAdminProfile,
  ],

  sharingRules: [
    AccountTeamSharingRule,
    OpportunitySalesSharingRule,
    CaseEscalationSharingRule,
    ...TerritorySharingRules,
  ],
  roleHierarchy: RoleHierarchy,
  organizationDefaults: OrganizationDefaults,

  apps: [CrmApp],
});
