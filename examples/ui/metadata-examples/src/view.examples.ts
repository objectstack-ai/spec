// @ts-nocheck
import { ListView, FormView } from '@objectstack/spec/ui';

/**
 * View Examples - Demonstrating ObjectStack View Protocol
 * 
 * Views define how data is displayed and interacted with.
 * ObjectStack supports multiple view types for different use cases.
 */

// ============================================================================
// GRID VIEWS (Table/List Views)
// ============================================================================

/**
 * Example 1: Basic Grid View
 * Simple table view with essential columns and sorting
 * Use Case: Quick lists, simple data tables
 */
export const BasicGridView: ListView = {
  type: 'grid',
  columns: ['name', 'status', 'created_date'],
  sort: [{ field: 'created_date', order: 'desc' }],
};

/**
 * Example 2: Advanced Grid View with Detailed Column Configuration
 * Demonstrates column customization, widths, alignment, and types
 * Use Case: Complex business tables requiring precise layout control
 */
export const AdvancedGridView: ListView = {
  type: 'grid',
  columns: [
    {
      field: 'name',
      label: 'Account Name',
      width: 250,
      sortable: true,
      resizable: true,
    },
    {
      field: 'annual_revenue',
      label: 'Revenue',
      width: 150,
      align: 'right',
      type: 'currency',
      sortable: true,
    },
    {
      field: 'industry',
      label: 'Industry',
      width: 180,
      sortable: true,
    },
    {
      field: 'owner',
      label: 'Owner',
      width: 150,
      type: 'lookup',
    },
    {
      field: 'is_active',
      label: 'Active',
      width: 80,
      align: 'center',
      type: 'boolean',
    },
  ],
  filter: [
    { field: 'is_active', operator: '$eq', value: true },
  ],
  sort: [{ field: 'annual_revenue', order: 'desc' }],
  resizable: true,
  striped: true,
  bordered: true,
  selection: {
    type: 'multiple',
  },
  pagination: {
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
};

/**
 * Example 3: Grid View with Search and Filters
 * Demonstrates searchable columns and complex filtering
 * Use Case: Data discovery, user-driven filtering
 */
export const SearchableGridView: ListView = {
  type: 'grid',
  columns: ['subject', 'priority', 'status', 'due_date', 'assigned_to'],
  searchableFields: ['subject', 'description', 'assigned_to'],
  filter: [
    {
      $or: [
        { field: 'status', operator: '$eq', value: 'open' },
        { field: 'status', operator: '$eq', value: 'in_progress' },
      ],
    },
  ],
  sort: [
    { field: 'priority', order: 'desc' },
    { field: 'due_date', order: 'asc' },
  ],
  pagination: {
    pageSize: 50,
  },
};

/**
 * Example 4: Grid View with Custom API Data Source
 * Demonstrates using external API instead of ObjectStack metadata
 * Use Case: Integration with third-party systems, legacy APIs
 */
export const ExternalApiGridView: ListView = {
  type: 'grid',
  data: {
    provider: 'api',
    read: {
      url: 'https://api.example.com/external/customers',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {token}',
        'X-API-Version': '2.0',
      },
      params: {
        include: 'address,contacts',
        status: 'active',
      },
    },
  },
  columns: [
    { field: 'id', label: 'Customer ID', width: 100 },
    { field: 'company_name', label: 'Company', width: 200 },
    { field: 'contact_email', label: 'Email', width: 200 },
    { field: 'total_orders', label: 'Orders', width: 100, align: 'right' },
  ],
};

/**
 * Example 5: Grid View with Static Data (Value Provider)
 * Demonstrates hardcoded data for testing or simple lists
 * Use Case: Static configuration lists, mock data, testing
 */
export const StaticDataGridView: ListView = {
  type: 'grid',
  data: {
    provider: 'value',
    items: [
      { id: 1, name: 'Priority 1', color: '#FF0000', order: 1 },
      { id: 2, name: 'Priority 2', color: '#FFA500', order: 2 },
      { id: 3, name: 'Priority 3', color: '#FFFF00', order: 3 },
      { id: 4, name: 'Priority 4', color: '#00FF00', order: 4 },
      { id: 5, name: 'Priority 5', color: '#0000FF', order: 5 },
    ],
  },
  columns: [
    { field: 'order', label: '#', width: 60 },
    { field: 'name', label: 'Priority Level', width: 150 },
    { field: 'color', label: 'Color Code', width: 120, type: 'color' },
  ],
};

// ============================================================================
// KANBAN VIEWS (Board/Card Views)
// ============================================================================

/**
 * Example 6: Kanban Board View
 * Card-based workflow visualization grouped by status/stage
 * Use Case: Agile workflows, sales pipelines, support tickets
 * Inspired by: Salesforce Kanban, Trello, Jira boards
 */
export const OpportunityKanbanView: ListView = {
  type: 'kanban',
  data: {
    provider: 'object',
    object: 'opportunity',
  },
  columns: ['name', 'amount', 'close_date', 'account_name'],
  filter: [
    { field: 'stage', operator: '$nin', value: ['closed_won', 'closed_lost'] },
  ],
  kanban: {
    groupByField: 'stage', // Creates columns for each stage value
    summarizeField: 'amount', // Shows sum at top of each column
    columns: ['name', 'amount', 'account_name', 'close_date'], // Fields shown on cards
  },
};

/**
 * Example 7: Support Ticket Kanban
 * Demonstrates Kanban for support/service workflows
 * Use Case: Customer support, issue tracking
 */
export const SupportTicketKanban: ListView = {
  type: 'kanban',
  data: {
    provider: 'object',
    object: 'case',
  },
  columns: ['case_number', 'subject', 'priority', 'assigned_to'],
  filter: [
    { field: 'is_closed', operator: '$eq', value: false },
  ],
  kanban: {
    groupByField: 'status', // new, assigned, in_progress, waiting, resolved
    columns: ['case_number', 'subject', 'priority', 'customer_name'],
  },
  sort: [{ field: 'priority', order: 'desc' }],
};

// ============================================================================
// CALENDAR VIEWS (Time-based Views)
// ============================================================================

/**
 * Example 8: Calendar View for Events
 * Time-based visualization of events and activities
 * Use Case: Event management, scheduling, appointments
 * Inspired by: Salesforce Calendar, Google Calendar
 */
export const EventCalendarView: ListView = {
  type: 'calendar',
  data: {
    provider: 'object',
    object: 'event',
  },
  columns: ['title', 'location', 'attendees'],
  calendar: {
    startDateField: 'start_date',
    endDateField: 'end_date',
    titleField: 'title',
    colorField: 'event_type', // Color code by event type
  },
};

/**
 * Example 9: Task Calendar View
 * Calendar for tasks and deadlines (single date)
 * Use Case: Task management, deadline tracking
 */
export const TaskCalendarView: ListView = {
  type: 'calendar',
  data: {
    provider: 'object',
    object: 'task',
  },
  columns: ['subject', 'priority', 'assigned_to'],
  filter: [
    { field: 'is_completed', operator: '$eq', value: false },
  ],
  calendar: {
    startDateField: 'due_date',
    titleField: 'subject',
    colorField: 'priority',
  },
};

// ============================================================================
// GANTT VIEWS (Project Timeline Views)
// ============================================================================

/**
 * Example 10: Project Gantt View
 * Timeline visualization for project planning
 * Use Case: Project management, timeline planning, dependencies
 * Inspired by: MS Project, Asana Timeline, Monday.com Gantt
 */
export const ProjectGanttView: ListView = {
  type: 'gantt',
  data: {
    provider: 'object',
    object: 'project_task',
  },
  columns: ['name', 'assigned_to', 'status', 'progress'],
  filter: [
    { field: 'project_id', operator: '$eq', value: '{current_project}' },
  ],
  gantt: {
    startDateField: 'start_date',
    endDateField: 'end_date',
    titleField: 'name',
    progressField: 'progress_percentage', // 0-100
    dependenciesField: 'dependencies', // Array of task IDs
  },
  sort: [{ field: 'start_date', order: 'asc' }],
};

/**
 * Example 11: Release Planning Gantt
 * Timeline for software release planning
 * Use Case: Agile release planning, sprint visualization
 */
export const ReleaseGanttView: ListView = {
  type: 'gantt',
  data: {
    provider: 'object',
    object: 'sprint',
  },
  columns: ['name', 'team', 'status', 'story_points'],
  gantt: {
    startDateField: 'start_date',
    endDateField: 'end_date',
    titleField: 'name',
    progressField: 'completion_percentage',
  },
};

// ============================================================================
// FORM VIEWS (Edit/Create Views)
// ============================================================================

/**
 * Example 12: Simple Form View
 * Single-section form for basic data entry
 * Use Case: Simple objects with few fields
 */
export const SimpleFormView: FormView = {
  type: 'simple',
  sections: [
    {
      label: 'Contact Information',
      columns: '2',
      fields: ['first_name', 'last_name', 'email', 'phone'],
    },
    {
      label: 'Address',
      columns: '1',
      fields: ['street', 'city', 'state', 'postal_code', 'country'],
    },
  ],
};

/**
 * Example 13: Advanced Form View with Field Configuration
 * Detailed form with field customization and validation
 * Use Case: Complex forms requiring precise control
 */
export const AdvancedFormView: FormView = {
  type: 'simple',
  sections: [
    {
      label: 'Account Details',
      collapsible: false,
      columns: '2',
      fields: [
        {
          field: 'name',
          label: 'Account Name',
          required: true,
          colSpan: 2,
          placeholder: 'Enter company name',
        },
        {
          field: 'account_type',
          label: 'Type',
          required: true,
          helpText: 'Select the type of account',
        },
        {
          field: 'industry',
          label: 'Industry',
        },
        {
          field: 'annual_revenue',
          label: 'Annual Revenue',
          colSpan: 2,
          helpText: 'Estimated annual revenue in USD',
        },
      ],
    },
    {
      label: 'Contact Information',
      collapsible: true,
      collapsed: false,
      columns: '2',
      fields: [
        { field: 'phone', label: 'Phone' },
        { field: 'website', label: 'Website' },
        { field: 'billing_address', colSpan: 2 },
      ],
    },
  ],
};

/**
 * Example 14: Tabbed Form View
 * Multi-tab form for organizing many fields
 * Use Case: Complex objects with many field groups
 * Inspired by: Salesforce Lightning Record Pages
 */
export const TabbedFormView: FormView = {
  type: 'tabbed',
  sections: [
    {
      label: 'Overview',
      columns: '2',
      fields: ['name', 'status', 'owner', 'priority'],
    },
    {
      label: 'Details',
      columns: '2',
      fields: ['description', 'notes', 'attachments'],
    },
    {
      label: 'Related Information',
      columns: '1',
      fields: ['related_accounts', 'related_contacts', 'related_opportunities'],
    },
  ],
};

/**
 * Example 15: Wizard Form View
 * Step-by-step form for guided processes
 * Use Case: Onboarding, complex workflows, guided setup
 */
export const WizardFormView: FormView = {
  type: 'wizard',
  sections: [
    {
      label: 'Step 1: Basic Information',
      columns: '1',
      fields: ['company_name', 'company_type', 'industry'],
    },
    {
      label: 'Step 2: Contact Details',
      columns: '2',
      fields: ['primary_contact', 'email', 'phone'],
    },
    {
      label: 'Step 3: Preferences',
      columns: '2',
      fields: ['timezone', 'language', 'currency'],
    },
    {
      label: 'Step 4: Review & Submit',
      columns: '1',
      fields: ['terms_accepted', 'privacy_accepted'],
    },
  ],
};

/**
 * Example 16: Form View with Conditional Fields
 * Demonstrates field visibility based on other field values
 * Use Case: Dynamic forms, cascading fields
 */
export const ConditionalFormView: FormView = {
  type: 'simple',
  sections: [
    {
      label: 'Lead Information',
      columns: '2',
      fields: [
        { field: 'name', required: true },
        { field: 'company', required: true },
        { field: 'lead_source' },
        {
          field: 'lead_source_detail',
          visibleOn: 'lead_source = "other"',
          helpText: 'Please specify the lead source',
        },
        { field: 'status' },
        {
          field: 'converted_account',
          visibleOn: 'status = "converted"',
          readonly: true,
        },
        {
          field: 'converted_contact',
          visibleOn: 'status = "converted"',
          readonly: true,
        },
      ],
    },
  ],
};

/**
 * Example 17: Form View with Custom API Data Source
 * Form that submits to external API instead of ObjectStack
 * Use Case: Integration with legacy systems, external services
 */
export const ExternalApiFormView: FormView = {
  type: 'simple',
  data: {
    provider: 'api',
    read: {
      url: 'https://api.example.com/users/{id}',
      method: 'GET',
    },
    write: {
      url: 'https://api.example.com/users/{id}',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {token}',
      },
    },
  },
  sections: [
    {
      label: 'User Profile',
      columns: '2',
      fields: ['username', 'email', 'first_name', 'last_name', 'bio'],
    },
  ],
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const ViewExamples = {
  // Grid Views
  BasicGridView,
  AdvancedGridView,
  SearchableGridView,
  ExternalApiGridView,
  StaticDataGridView,
  
  // Kanban Views
  OpportunityKanbanView,
  SupportTicketKanban,
  
  // Calendar Views
  EventCalendarView,
  TaskCalendarView,
  
  // Gantt Views
  ProjectGanttView,
  ReleaseGanttView,
  
  // Form Views
  SimpleFormView,
  AdvancedFormView,
  TabbedFormView,
  WizardFormView,
  ConditionalFormView,
  ExternalApiFormView,
};
