import type { ReportInput } from '@objectstack/spec/ui';

// Sales Report - Opportunities by Stage
export const OpportunitiesByStageReport: ReportInput = {
  name: 'opportunities_by_stage',
  label: 'Opportunities by Stage',
  description: 'Summary of opportunities grouped by stage',
  
  objectName: 'opportunity',
  type: 'summary',
  
  columns: [
    {
      field: 'name',
      label: 'Opportunity Name',
    },
    {
      field: 'account',
      label: 'Account',
    },
    {
      field: 'amount',
      label: 'Amount',
      aggregate: 'sum',
    },
    {
      field: 'close_date',
      label: 'Close Date',
    },
    {
      field: 'probability',
      label: 'Probability',
      aggregate: 'avg',
    },
  ],
  
  groupingsDown: [
    {
      field: 'stage',
      sortOrder: 'asc',
    }
  ],
  
  filter: {
    stage: { $ne: 'closed_lost' },
    close_date: { $gte: '{current_year_start}' }
  },
  
  chart: {
    type: 'bar',
    title: 'Pipeline by Stage',
    showLegend: true,
    xAxis: 'stage',
    yAxis: 'amount',
  }
};

// Sales Report - Won Opportunities by Owner
export const WonOpportunitiesByOwnerReport: ReportInput = {
  name: 'won_opportunities_by_owner',
  label: 'Won Opportunities by Owner',
  description: 'Closed won opportunities grouped by owner',
  
  objectName: 'opportunity',
  type: 'summary',
  
  columns: [
    {
      field: 'name',
      label: 'Opportunity Name',
    },
    {
      field: 'account',
      label: 'Account',
    },
    {
      field: 'amount',
      label: 'Amount',
      aggregate: 'sum',
    },
    {
      field: 'close_date',
      label: 'Close Date',
    },
  ],
  
  groupingsDown: [
    {
      field: 'owner',
      sortOrder: 'desc',
    }
  ],
  
  filter: {
    stage: 'closed_won'
  },
  
  chart: {
    type: 'column',
    title: 'Revenue by Sales Rep',
    showLegend: false,
    xAxis: 'owner',
    yAxis: 'amount',
  }
};

// Account Report - Accounts by Industry and Type (Matrix)
export const AccountsByIndustryTypeReport: ReportInput = {
  name: 'accounts_by_industry_type',
  label: 'Accounts by Industry and Type',
  description: 'Matrix report showing accounts by industry and type',
  
  objectName: 'account',
  type: 'matrix',
  
  columns: [
    {
      field: 'name',
      aggregate: 'count',
    },
    {
      field: 'annual_revenue',
      aggregate: 'sum',
    },
  ],
  
  groupingsDown: [
    {
      field: 'industry',
      sortOrder: 'asc',
    }
  ],
  
  groupingsAcross: [
    {
      field: 'type',
      sortOrder: 'asc',
    }
  ],
  
  filter: {
    is_active: true
  },
};

// Support Report - Cases by Status and Priority
export const CasesByStatusPriorityReport: ReportInput = {
  name: 'cases_by_status_priority',
  label: 'Cases by Status and Priority',
  description: 'Summary of cases by status and priority',
  
  objectName: 'case',
  type: 'summary',
  
  columns: [
    {
      field: 'case_number',
      label: 'Case Number',
    },
    {
      field: 'subject',
      label: 'Subject',
    },
    {
      field: 'account',
      label: 'Account',
    },
    {
      field: 'owner',
      label: 'Owner',
    },
    {
      field: 'resolution_time_hours',
      label: 'Resolution Time',
      aggregate: 'avg',
    },
  ],
  
  groupingsDown: [
    {
      field: 'status',
      sortOrder: 'asc',
    },
    {
      field: 'priority',
      sortOrder: 'desc',
    }
  ],
  
  chart: {
    type: 'bar',
    title: 'Cases by Status',
    showLegend: true,
    xAxis: 'status',
    yAxis: 'case_number',
  }
};

// Support Report - SLA Performance
export const SlaPerformanceReport: ReportInput = {
  name: 'sla_performance',
  label: 'SLA Performance Report',
  description: 'Analysis of SLA compliance',
  
  objectName: 'case',
  type: 'summary',
  
  columns: [
    {
      field: 'case_number',
      aggregate: 'count',
    },
    {
      field: 'is_sla_violated',
      label: 'SLA Violated',
      aggregate: 'count',
    },
    {
      field: 'resolution_time_hours',
      label: 'Avg Resolution Time',
      aggregate: 'avg',
    },
  ],
  
  groupingsDown: [
    {
      field: 'priority',
      sortOrder: 'desc',
    }
  ],
  
  filter: {
    is_closed: true
  },
  
  chart: {
    type: 'column',
    title: 'SLA Violations by Priority',
    showLegend: false,
    xAxis: 'priority',
    yAxis: 'is_sla_violated',
  }
};

// Lead Report - Leads by Source and Status
export const LeadsBySourceReport: ReportInput = {
  name: 'leads_by_source',
  label: 'Leads by Source and Status',
  description: 'Lead pipeline analysis',
  
  objectName: 'lead',
  type: 'summary',
  
  columns: [
    {
      field: 'full_name',
      label: 'Name',
    },
    {
      field: 'company',
      label: 'Company',
    },
    {
      field: 'rating',
      label: 'Rating',
    },
  ],
  
  groupingsDown: [
    {
      field: 'lead_source',
      sortOrder: 'asc',
    },
    {
      field: 'status',
      sortOrder: 'asc',
    }
  ],
  
  filter: {
    is_converted: false
  },
  
  chart: {
    type: 'pie',
    title: 'Leads by Source',
    showLegend: true,
    xAxis: 'lead_source',
    yAxis: 'full_name',
  }
};

// Contact Report - Contacts by Account
export const ContactsByAccountReport: ReportInput = {
  name: 'contacts_by_account',
  label: 'Contacts by Account',
  description: 'List of contacts grouped by account',
  
  objectName: 'contact',
  type: 'summary',
  
  columns: [
    {
      field: 'full_name',
      label: 'Name',
    },
    {
      field: 'title',
      label: 'Title',
    },
    {
      field: 'email',
      label: 'Email',
    },
    {
      field: 'phone',
      label: 'Phone',
    },
    {
      field: 'is_primary',
      label: 'Primary Contact',
    },
  ],
  
  groupingsDown: [
    {
      field: 'account',
      sortOrder: 'asc',
    }
  ],
};

// Activity Report - Tasks by Owner
export const TasksByOwnerReport: ReportInput = {
  name: 'tasks_by_owner',
  label: 'Tasks by Owner',
  description: 'Task summary by owner',
  
  objectName: 'task',
  type: 'summary',
  
  columns: [
    {
      field: 'subject',
      label: 'Subject',
    },
    {
      field: 'status',
      label: 'Status',
    },
    {
      field: 'priority',
      label: 'Priority',
    },
    {
      field: 'due_date',
      label: 'Due Date',
    },
    {
      field: 'actual_hours',
      label: 'Hours',
      aggregate: 'sum',
    },
  ],
  
  groupingsDown: [
    {
      field: 'owner',
      sortOrder: 'asc',
    }
  ],
  
  filter: {
    is_completed: false
  },
};

export const CrmReports = {
  OpportunitiesByStageReport,
  WonOpportunitiesByOwnerReport,
  AccountsByIndustryTypeReport,
  CasesByStatusPriorityReport,
  SlaPerformanceReport,
  LeadsBySourceReport,
  ContactsByAccountReport,
  TasksByOwnerReport,
};
