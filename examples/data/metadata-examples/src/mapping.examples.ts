// @ts-nocheck
import { Mapping } from '@objectstack/spec/data';

/**
 * Mapping Examples - Demonstrating ObjectStack Mapping Protocol
 * 
 * Mappings define ETL (Extract, Transform, Load) rules for importing
 * and exporting data between ObjectStack and external sources.
 * Inspired by Salesforce Data Loader and ServiceNow Import Sets.
 */

// ============================================================================
// SIMPLE MAPPINGS
// ============================================================================

/**
 * Example 1: Simple CSV Import
 * Basic field mapping from CSV to object
 * Use Case: Import customer list from spreadsheet
 */
export const SimpleCsvImportMapping: Mapping = {
  name: 'import_customers_csv',
  label: 'Import Customers from CSV',
  sourceFormat: 'csv',
  targetObject: 'account',
  mode: 'insert',
  
  fieldMapping: [
    {
      source: 'Company Name',
      target: 'name',
      transform: 'none',
    },
    {
      source: 'Email',
      target: 'email',
      transform: 'none',
    },
    {
      source: 'Phone',
      target: 'phone',
      transform: 'none',
    },
    {
      source: 'Website',
      target: 'website',
      transform: 'none',
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 1000,
};

/**
 * Example 2: JSON Import Mapping
 * Import from JSON API response
 * Use Case: Sync products from e-commerce API
 */
export const JsonImportMapping: Mapping = {
  name: 'import_products_json',
  label: 'Import Products from JSON',
  sourceFormat: 'json',
  targetObject: 'product',
  mode: 'upsert',
  upsertKey: ['sku'],
  
  fieldMapping: [
    {
      source: 'product_name',
      target: 'name',
      transform: 'none',
    },
    {
      source: 'product_sku',
      target: 'sku',
      transform: 'none',
    },
    {
      source: 'price',
      target: 'price',
      transform: 'none',
    },
    {
      source: 'in_stock',
      target: 'stock_quantity',
      transform: 'none',
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 500,
};

// ============================================================================
// TRANSFORMATION MAPPINGS
// ============================================================================

/**
 * Example 3: Constant Value Mapping
 * Set constant values during import
 * Use Case: Tag all imports with source identifier
 */
export const ConstantValueMapping: Mapping = {
  name: 'import_leads_with_source',
  label: 'Import Leads with Source Tag',
  sourceFormat: 'csv',
  targetObject: 'lead',
  mode: 'insert',
  
  fieldMapping: [
    {
      source: 'First Name',
      target: 'first_name',
      transform: 'none',
    },
    {
      source: 'Last Name',
      target: 'last_name',
      transform: 'none',
    },
    {
      source: 'Email',
      target: 'email',
      transform: 'none',
    },
    {
      source: 'Company',
      target: 'company',
      transform: 'none',
    },
    {
      source: null,
      target: 'lead_source',
      transform: 'constant',
      params: {
        value: 'trade_show_2024',
      },
    },
    {
      source: null,
      target: 'status',
      transform: 'constant',
      params: {
        value: 'new',
      },
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 1000,
};

/**
 * Example 4: Value Mapping (Translation)
 * Map source values to target values
 * Use Case: Convert external codes to internal codes
 */
export const ValueMappingTransform: Mapping = {
  name: 'import_orders_with_mapping',
  label: 'Import Orders with Status Mapping',
  sourceFormat: 'csv',
  targetObject: 'order',
  mode: 'upsert',
  upsertKey: ['order_number'],
  
  fieldMapping: [
    {
      source: 'Order ID',
      target: 'order_number',
      transform: 'none',
    },
    {
      source: 'Customer Email',
      target: 'customer_email',
      transform: 'none',
    },
    {
      source: 'Status',
      target: 'status',
      transform: 'map',
      params: {
        valueMap: {
          'New': 'draft',
          'Processing': 'processing',
          'Shipped': 'shipped',
          'Delivered': 'fulfilled',
          'Cancelled': 'cancelled',
        },
      },
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 500,
};

/**
 * Example 5: Lookup Mapping
 * Resolve foreign keys by name
 * Use Case: Import contacts with account name (not ID)
 */
export const LookupMapping: Mapping = {
  name: 'import_contacts_with_lookup',
  label: 'Import Contacts with Account Lookup',
  sourceFormat: 'csv',
  targetObject: 'contact',
  mode: 'upsert',
  upsertKey: ['email'],
  
  fieldMapping: [
    {
      source: 'First Name',
      target: 'first_name',
      transform: 'none',
    },
    {
      source: 'Last Name',
      target: 'last_name',
      transform: 'none',
    },
    {
      source: 'Email',
      target: 'email',
      transform: 'none',
    },
    {
      source: 'Account Name',
      target: 'account_id',
      transform: 'lookup',
      params: {
        object: 'account',
        fromField: 'name',
        toField: 'id',
        autoCreate: true,
      },
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 500,
};

/**
 * Example 6: Split Field Mapping
 * Split one field into multiple
 * Use Case: Split full name into first/last
 */
export const SplitFieldMapping: Mapping = {
  name: 'import_users_split_name',
  label: 'Import Users (Split Name)',
  sourceFormat: 'csv',
  targetObject: 'user',
  mode: 'insert',
  
  fieldMapping: [
    {
      source: 'Full Name',
      target: ['first_name', 'last_name'],
      transform: 'split',
      params: {
        separator: ' ',
      },
    },
    {
      source: 'Email',
      target: 'email',
      transform: 'none',
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 1000,
};

/**
 * Example 7: Join Field Mapping
 * Combine multiple fields into one
 * Use Case: Create full address from components
 */
export const JoinFieldMapping: Mapping = {
  name: 'import_addresses_join',
  label: 'Import Addresses (Join Fields)',
  sourceFormat: 'csv',
  targetObject: 'customer',
  mode: 'upsert',
  upsertKey: ['email'],
  
  fieldMapping: [
    {
      source: 'Email',
      target: 'email',
      transform: 'none',
    },
    {
      source: ['Street', 'City', 'State', 'Zip'],
      target: 'full_address',
      transform: 'join',
      params: {
        separator: ', ',
      },
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 500,
};

// ============================================================================
// EXPORT MAPPINGS
// ============================================================================

/**
 * Example 8: Export to CSV
 * Define extraction query and field mapping
 * Use Case: Export customer list for analysis
 */
export const ExportToCsvMapping: Mapping = {
  name: 'export_customers_csv',
  label: 'Export Customers to CSV',
  sourceFormat: 'csv',
  targetObject: 'account',
  mode: 'insert',
  
  extractQuery: {
    object: 'account',
    fields: ['name', 'email', 'phone', 'website', 'annual_revenue'],
    where: {
      is_active: true,
      type: 'customer',
    },
    orderBy: [
      { field: 'name', order: 'asc' },
    ],
  },
  
  fieldMapping: [
    {
      source: 'name',
      target: 'Company Name',
      transform: 'none',
    },
    {
      source: 'email',
      target: 'Email Address',
      transform: 'none',
    },
    {
      source: 'phone',
      target: 'Phone Number',
      transform: 'none',
    },
    {
      source: 'website',
      target: 'Website URL',
      transform: 'none',
    },
    {
      source: 'annual_revenue',
      target: 'Revenue',
      transform: 'none',
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 1000,
};

/**
 * Example 9: Complex Import with Multiple Lookups
 * Import opportunities with account and owner lookup
 * Use Case: Import sales pipeline from external CRM
 */
export const ComplexImportMapping: Mapping = {
  name: 'import_opportunities_complex',
  label: 'Import Opportunities (Complex)',
  sourceFormat: 'csv',
  targetObject: 'opportunity',
  mode: 'upsert',
  upsertKey: ['external_id'],
  
  fieldMapping: [
    {
      source: 'External ID',
      target: 'external_id',
      transform: 'none',
    },
    {
      source: 'Opportunity Name',
      target: 'name',
      transform: 'none',
    },
    {
      source: 'Account Name',
      target: 'account_id',
      transform: 'lookup',
      params: {
        object: 'account',
        fromField: 'name',
        toField: 'id',
        autoCreate: false,
      },
    },
    {
      source: 'Owner Email',
      target: 'owner_id',
      transform: 'lookup',
      params: {
        object: 'user',
        fromField: 'email',
        toField: 'id',
        autoCreate: false,
      },
    },
    {
      source: 'Amount',
      target: 'amount',
      transform: 'none',
    },
    {
      source: 'Stage',
      target: 'stage',
      transform: 'map',
      params: {
        valueMap: {
          'Qualify': 'qualification',
          'Propose': 'proposal',
          'Negotiate': 'negotiation',
          'Won': 'closed_won',
          'Lost': 'closed_lost',
        },
      },
    },
    {
      source: 'Close Date',
      target: 'close_date',
      transform: 'none',
    },
  ],
  
  errorPolicy: 'skip',
  batchSize: 500,
};

/**
 * Example 10: Migration Mapping
 * Migrate data from legacy system
 * Use Case: One-time data migration with cleanup
 */
export const MigrationMapping: Mapping = {
  name: 'migrate_legacy_products',
  label: 'Migrate Products from Legacy System',
  sourceFormat: 'json',
  targetObject: 'product',
  mode: 'replace',
  
  fieldMapping: [
    {
      source: 'legacy_id',
      target: 'external_id',
      transform: 'none',
    },
    {
      source: 'prod_name',
      target: 'name',
      transform: 'none',
    },
    {
      source: 'sku_code',
      target: 'sku',
      transform: 'none',
    },
    {
      source: 'category_name',
      target: 'category_id',
      transform: 'lookup',
      params: {
        object: 'product_category',
        fromField: 'name',
        toField: 'id',
        autoCreate: true,
      },
    },
    {
      source: 'unit_price',
      target: 'price',
      transform: 'none',
    },
    {
      source: 'active_flag',
      target: 'is_active',
      transform: 'map',
      params: {
        valueMap: {
          'Y': true,
          'N': false,
          '1': true,
          '0': false,
        },
      },
    },
  ],
  
  errorPolicy: 'abort',
  batchSize: 100,
};
