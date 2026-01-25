// @ts-nocheck
import { ServiceObject } from '@objectstack/spec/data';

/**
 * Object Examples - Demonstrating ObjectStack Data Protocol
 * 
 * Objects are the blueprints for business entities, defining their fields,
 * capabilities, indexes, and validation rules.
 * Inspired by Salesforce Objects and ServiceNow Tables.
 */

// ============================================================================
// BASIC OBJECTS
// ============================================================================

/**
 * Example 1: Simple Object
 * Basic object with minimal configuration
 * Use Case: Quick prototyping, simple data models
 */
export const SimpleObject: ServiceObject = {
  name: 'product',
  label: 'Product',
  pluralLabel: 'Products',
  description: 'Product catalog',
  icon: 'package',
  
  fields: {
    name: {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    sku: {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      unique: true,
      externalId: true,
    },
    price: {
      name: 'price',
      label: 'Price',
      type: 'currency',
      currencyConfig: {
        precision: 2,
        currencyMode: 'fixed',
        defaultCurrency: 'USD',
      },
    },
  },
};

/**
 * Example 2: Object with Full Capabilities
 * Object with all system features enabled
 * Use Case: Core business entities requiring full audit and collaboration
 */
export const FullFeaturedObject: ServiceObject = {
  name: 'account',
  label: 'Account',
  pluralLabel: 'Accounts',
  description: 'Customer and partner accounts',
  icon: 'building',
  
  fields: {
    name: {
      name: 'name',
      label: 'Account Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    account_number: {
      name: 'account_number',
      label: 'Account Number',
      type: 'autonumber',
      readonly: true,
    },
    type: {
      name: 'type',
      label: 'Account Type',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer', default: true },
        { label: 'Partner', value: 'partner' },
        { label: 'Vendor', value: 'vendor' },
      ],
    },
    annual_revenue: {
      name: 'annual_revenue',
      label: 'Annual Revenue',
      type: 'currency',
    },
    website: {
      name: 'website',
      label: 'Website',
      type: 'url',
    },
  },
  
  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    apiMethods: ['get', 'list', 'create', 'update', 'delete', 'search'],
    files: true,
    feeds: true,
    activities: true,
    trash: true,
    mru: true,
    clone: true,
  },
};

/**
 * Example 3: Object with Indexes
 * Object with custom database indexes for performance
 * Use Case: High-volume queries, optimized search
 */
export const IndexedObject: ServiceObject = {
  name: 'order',
  label: 'Order',
  pluralLabel: 'Orders',
  icon: 'shopping-cart',
  
  fields: {
    order_number: {
      name: 'order_number',
      label: 'Order Number',
      type: 'text',
      unique: true,
      externalId: true,
    },
    customer_id: {
      name: 'customer_id',
      label: 'Customer',
      type: 'lookup',
      reference: 'account',
      deleteBehavior: 'restrict',
    },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Fulfilled', value: 'fulfilled' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    order_date: {
      name: 'order_date',
      label: 'Order Date',
      type: 'date',
      required: true,
    },
    total_amount: {
      name: 'total_amount',
      label: 'Total Amount',
      type: 'currency',
    },
  },
  
  indexes: [
    {
      name: 'idx_customer_date',
      fields: ['customer_id', 'order_date'],
      type: 'btree',
    },
    {
      name: 'idx_status',
      fields: ['status'],
      type: 'btree',
    },
    {
      name: 'idx_order_number',
      fields: ['order_number'],
      unique: true,
      type: 'btree',
    },
  ],
};

/**
 * Example 4: Object with Search Configuration
 * Object optimized for full-text search
 * Use Case: Knowledge base, articles, documentation
 */
export const SearchableObject: ServiceObject = {
  name: 'article',
  label: 'Article',
  pluralLabel: 'Articles',
  icon: 'file-text',
  
  fields: {
    title: {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      searchable: true,
    },
    content: {
      name: 'content',
      label: 'Content',
      type: 'richtext',
      searchable: true,
    },
    category: {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Documentation', value: 'documentation' },
        { label: 'FAQ', value: 'faq' },
      ],
    },
    tags: {
      name: 'tags',
      label: 'Tags',
      type: 'select',
      multiple: true,
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Technical', value: 'technical' },
      ],
    },
    published: {
      name: 'published',
      label: 'Published',
      type: 'boolean',
      defaultValue: false,
    },
  },
  
  search: {
    fields: ['title', 'content', 'tags'],
    displayFields: ['title', 'category', 'published'],
    filters: ['published = true'],
  },
  
  enable: {
    searchable: true,
  },
};

/**
 * Example 5: Object with Validation Rules
 * Object with business logic validation
 * Use Case: Data quality enforcement, business rules
 */
export const ValidatedObject: ServiceObject = {
  name: 'opportunity',
  label: 'Opportunity',
  pluralLabel: 'Opportunities',
  icon: 'target',
  
  fields: {
    name: {
      name: 'name',
      label: 'Opportunity Name',
      type: 'text',
      required: true,
    },
    account_id: {
      name: 'account_id',
      label: 'Account',
      type: 'lookup',
      reference: 'account',
      required: true,
    },
    amount: {
      name: 'amount',
      label: 'Amount',
      type: 'currency',
      required: true,
    },
    close_date: {
      name: 'close_date',
      label: 'Close Date',
      type: 'date',
      required: true,
    },
    stage: {
      name: 'stage',
      label: 'Stage',
      type: 'select',
      required: true,
      options: [
        { label: 'Qualification', value: 'qualification' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Closed Won', value: 'closed_won' },
        { label: 'Closed Lost', value: 'closed_lost' },
      ],
    },
    probability: {
      name: 'probability',
      label: 'Probability (%)',
      type: 'percent',
    },
  },
  
  validations: [
    {
      type: 'script',
      name: 'amount_positive',
      message: 'Amount must be greater than zero',
      condition: 'amount <= 0',
      severity: 'error',
      active: true,
    },
    {
      type: 'cross_field',
      name: 'close_date_future',
      message: 'Close Date must be in the future',
      condition: 'close_date < TODAY()',
      fields: ['close_date'],
      severity: 'warning',
      active: true,
    },
    {
      type: 'state_machine',
      name: 'stage_transitions',
      message: 'Invalid stage transition',
      field: 'stage',
      transitions: {
        qualification: ['proposal', 'closed_lost'],
        proposal: ['negotiation', 'closed_lost'],
        negotiation: ['closed_won', 'closed_lost'],
        closed_won: [],
        closed_lost: [],
      },
      severity: 'error',
      active: true,
    },
  ],
};

// ============================================================================
// CRM OBJECTS
// ============================================================================

/**
 * Example 6: Contact Object
 * Standard CRM contact entity
 * Use Case: Contact management, CRM systems
 */
export const ContactObject: ServiceObject = {
  name: 'contact',
  label: 'Contact',
  pluralLabel: 'Contacts',
  description: 'Individual contacts and leads',
  icon: 'user',
  tags: ['crm', 'sales'],
  
  fields: {
    first_name: {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    last_name: {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    email: {
      name: 'email',
      label: 'Email',
      type: 'email',
      unique: true,
      searchable: true,
    },
    phone: {
      name: 'phone',
      label: 'Phone',
      type: 'phone',
      searchable: true,
    },
    account_id: {
      name: 'account_id',
      label: 'Account',
      type: 'lookup',
      reference: 'account',
      deleteBehavior: 'set_null',
    },
    title: {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    department: {
      name: 'department',
      label: 'Department',
      type: 'text',
    },
    mailing_address: {
      name: 'mailing_address',
      label: 'Mailing Address',
      type: 'address',
      addressFormat: 'international',
    },
  },
  
  titleFormat: '{first_name} {last_name}',
  compactLayout: ['first_name', 'last_name', 'email', 'phone', 'account_id'],
  
  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    activities: true,
    files: true,
    feeds: true,
    mru: true,
  },
};

/**
 * Example 7: Lead Object
 * CRM lead tracking
 * Use Case: Lead management, sales pipeline
 */
export const LeadObject: ServiceObject = {
  name: 'lead',
  label: 'Lead',
  pluralLabel: 'Leads',
  description: 'Potential customers and prospects',
  icon: 'user-plus',
  tags: ['crm', 'sales'],
  
  fields: {
    first_name: {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
    },
    last_name: {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      required: true,
    },
    company: {
      name: 'company',
      label: 'Company',
      type: 'text',
      required: true,
      searchable: true,
    },
    email: {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    phone: {
      name: 'phone',
      label: 'Phone',
      type: 'phone',
    },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'New', value: 'new', default: true },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Unqualified', value: 'unqualified' },
        { label: 'Converted', value: 'converted' },
      ],
    },
    lead_source: {
      name: 'lead_source',
      label: 'Lead Source',
      type: 'select',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Referral', value: 'referral' },
        { label: 'Trade Show', value: 'trade_show' },
        { label: 'Cold Call', value: 'cold_call' },
      ],
    },
    rating: {
      name: 'rating',
      label: 'Rating',
      type: 'select',
      options: [
        { label: 'Hot', value: 'hot', color: '#FF0000' },
        { label: 'Warm', value: 'warm', color: '#FFA500' },
        { label: 'Cold', value: 'cold', color: '#0066CC' },
      ],
    },
  },
  
  titleFormat: '{first_name} {last_name} - {company}',
  
  validations: [
    {
      type: 'unique',
      name: 'unique_email',
      message: 'A lead with this email already exists',
      fields: ['email'],
      scope: 'status != "converted"',
      caseSensitive: false,
      severity: 'error',
      active: true,
    },
  ],
  
  enable: {
    trackHistory: true,
    searchable: true,
    apiEnabled: true,
    activities: true,
    mru: true,
  },
};

// ============================================================================
// E-COMMERCE OBJECTS
// ============================================================================

/**
 * Example 8: Product Catalog Object
 * E-commerce product with variants
 * Use Case: Online stores, catalogs
 */
export const ProductCatalogObject: ServiceObject = {
  name: 'product_catalog',
  label: 'Product',
  pluralLabel: 'Products',
  icon: 'shopping-bag',
  tags: ['ecommerce', 'catalog'],
  
  fields: {
    name: {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    sku: {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      required: true,
      unique: true,
      externalId: true,
    },
    description: {
      name: 'description',
      label: 'Description',
      type: 'richtext',
      searchable: true,
    },
    price: {
      name: 'price',
      label: 'Price',
      type: 'currency',
      required: true,
    },
    cost: {
      name: 'cost',
      label: 'Cost',
      type: 'currency',
    },
    margin: {
      name: 'margin',
      label: 'Margin',
      type: 'formula',
      expression: '(price - cost) / price * 100',
      readonly: true,
    },
    stock_quantity: {
      name: 'stock_quantity',
      label: 'Stock Quantity',
      type: 'number',
      defaultValue: 0,
    },
    category_id: {
      name: 'category_id',
      label: 'Category',
      type: 'lookup',
      reference: 'product_category',
    },
    images: {
      name: 'images',
      label: 'Product Images',
      type: 'image',
      multiple: true,
    },
    is_active: {
      name: 'is_active',
      label: 'Active',
      type: 'boolean',
      defaultValue: true,
    },
  },
  
  indexes: [
    {
      name: 'idx_sku',
      fields: ['sku'],
      unique: true,
    },
    {
      name: 'idx_category_active',
      fields: ['category_id', 'is_active'],
    },
  ],
  
  enable: {
    searchable: true,
    apiEnabled: true,
    files: true,
  },
};

// ============================================================================
// PROJECT MANAGEMENT OBJECTS
// ============================================================================

/**
 * Example 9: Project Task Object
 * Task tracking with dependencies
 * Use Case: Project management, task tracking
 */
export const ProjectTaskObject: ServiceObject = {
  name: 'project_task',
  label: 'Task',
  pluralLabel: 'Tasks',
  icon: 'check-square',
  tags: ['project', 'task'],
  
  fields: {
    name: {
      name: 'name',
      label: 'Task Name',
      type: 'text',
      required: true,
      searchable: true,
    },
    description: {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    project_id: {
      name: 'project_id',
      label: 'Project',
      type: 'master_detail',
      reference: 'project',
      required: true,
      deleteBehavior: 'cascade',
    },
    assigned_to: {
      name: 'assigned_to',
      label: 'Assigned To',
      type: 'lookup',
      reference: 'user',
    },
    status: {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'To Do', value: 'todo', default: true },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Done', value: 'done' },
      ],
    },
    priority: {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium', default: true },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    due_date: {
      name: 'due_date',
      label: 'Due Date',
      type: 'date',
    },
    estimated_hours: {
      name: 'estimated_hours',
      label: 'Estimated Hours',
      type: 'number',
    },
    actual_hours: {
      name: 'actual_hours',
      label: 'Actual Hours',
      type: 'number',
    },
  },
  
  enable: {
    trackHistory: true,
    activities: true,
    files: true,
    feeds: true,
  },
};

/**
 * Example 10: System Object
 * Protected system object
 * Use Case: System configuration, core entities
 */
export const SystemObject: ServiceObject = {
  name: 'user_role',
  label: 'User Role',
  pluralLabel: 'User Roles',
  icon: 'shield',
  tags: ['system', 'security'],
  isSystem: true,
  
  fields: {
    name: {
      name: 'name',
      label: 'Role Name',
      type: 'text',
      required: true,
      unique: true,
    },
    description: {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    permissions: {
      name: 'permissions',
      label: 'Permissions',
      type: 'code',
      language: 'json',
    },
  },
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
    apiMethods: ['get', 'list'],
    trash: false,
  },
};
