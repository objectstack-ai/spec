// @ts-nocheck
import { Dataset } from '@objectstack/spec/data';

/**
 * Dataset Examples - Demonstrating ObjectStack Dataset Protocol
 * 
 * Datasets provide seed data and fixtures for bootstrapping systems,
 * loading reference data, and creating demo/test environments.
 * Inspired by Rails Fixtures and Django Fixtures.
 */

// ============================================================================
// SIMPLE DATASETS
// ============================================================================

/**
 * Example 1: Simple Reference Data
 * Static list of countries
 * Use Case: Load standard country list
 */
export const CountryDataset: Dataset = {
  object: 'country',
  externalId: 'code',
  mode: 'upsert',
  env: ['prod', 'dev', 'test'],
  
  records: [
    { code: 'US', name: 'United States', continent: 'North America' },
    { code: 'GB', name: 'United Kingdom', continent: 'Europe' },
    { code: 'CA', name: 'Canada', continent: 'North America' },
    { code: 'AU', name: 'Australia', continent: 'Oceania' },
    { code: 'DE', name: 'Germany', continent: 'Europe' },
    { code: 'FR', name: 'France', continent: 'Europe' },
    { code: 'JP', name: 'Japan', continent: 'Asia' },
    { code: 'CN', name: 'China', continent: 'Asia' },
  ],
};

/**
 * Example 2: Currency Reference Data
 * Standard currency codes
 * Use Case: Multi-currency support
 */
export const CurrencyDataset: Dataset = {
  object: 'currency',
  externalId: 'code',
  mode: 'upsert',
  env: ['prod', 'dev', 'test'],
  
  records: [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimal_places: 2 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_places: 0 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimal_places: 2 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_places: 2 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_places: 2 },
  ],
};

/**
 * Example 3: System Roles Dataset
 * Bootstrap user roles
 * Use Case: Initial system setup
 */
export const SystemRolesDataset: Dataset = {
  object: 'user_role',
  externalId: 'name',
  mode: 'upsert',
  env: ['prod', 'dev', 'test'],
  
  records: [
    {
      name: 'system_admin',
      label: 'System Administrator',
      description: 'Full system access',
      permissions: {
        all: true,
      },
    },
    {
      name: 'sales_manager',
      label: 'Sales Manager',
      description: 'Sales team management',
      permissions: {
        objects: ['account', 'contact', 'lead', 'opportunity'],
        actions: ['read', 'create', 'update', 'delete'],
      },
    },
    {
      name: 'sales_rep',
      label: 'Sales Representative',
      description: 'Sales team member',
      permissions: {
        objects: ['account', 'contact', 'lead', 'opportunity'],
        actions: ['read', 'create', 'update'],
      },
    },
    {
      name: 'support_agent',
      label: 'Support Agent',
      description: 'Customer support',
      permissions: {
        objects: ['case', 'account', 'contact'],
        actions: ['read', 'create', 'update'],
      },
    },
  ],
};

// ============================================================================
// DEMO DATA DATASETS
// ============================================================================

/**
 * Example 4: Demo Accounts
 * Sample customer accounts for demo
 * Use Case: Demo environment, training
 */
export const DemoAccountsDataset: Dataset = {
  object: 'account',
  externalId: 'account_number',
  mode: 'upsert',
  env: ['dev', 'test'],
  
  records: [
    {
      account_number: 'ACC-001',
      name: 'Acme Corporation',
      type: 'customer',
      industry: 'Technology',
      annual_revenue: 5000000,
      employees: 250,
      website: 'https://acme.example.com',
      is_active: true,
    },
    {
      account_number: 'ACC-002',
      name: 'Global Industries',
      type: 'customer',
      industry: 'Manufacturing',
      annual_revenue: 15000000,
      employees: 500,
      website: 'https://globalindustries.example.com',
      is_active: true,
    },
    {
      account_number: 'ACC-003',
      name: 'Tech Startup Inc',
      type: 'customer',
      industry: 'Technology',
      annual_revenue: 500000,
      employees: 25,
      website: 'https://techstartup.example.com',
      is_active: true,
    },
  ],
};

/**
 * Example 5: Demo Products
 * Sample product catalog
 * Use Case: E-commerce demo
 */
export const DemoProductsDataset: Dataset = {
  object: 'product',
  externalId: 'sku',
  mode: 'upsert',
  env: ['dev', 'test'],
  
  records: [
    {
      sku: 'WIDGET-001',
      name: 'Premium Widget',
      description: 'High-quality widget for professional use',
      price: 99.99,
      cost: 45.00,
      stock_quantity: 150,
      is_active: true,
    },
    {
      sku: 'GADGET-001',
      name: 'Smart Gadget',
      description: 'Advanced gadget with AI capabilities',
      price: 249.99,
      cost: 125.00,
      stock_quantity: 75,
      is_active: true,
    },
    {
      sku: 'TOOL-001',
      name: 'Professional Tool Set',
      description: 'Complete tool set for professionals',
      price: 149.99,
      cost: 70.00,
      stock_quantity: 50,
      is_active: true,
    },
  ],
};

/**
 * Example 6: Product Categories
 * Product taxonomy
 * Use Case: E-commerce categorization
 */
export const ProductCategoriesDataset: Dataset = {
  object: 'product_category',
  externalId: 'slug',
  mode: 'upsert',
  env: ['dev', 'test'],
  
  records: [
    {
      slug: 'electronics',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      is_active: true,
    },
    {
      slug: 'software',
      name: 'Software',
      description: 'Software products and licenses',
      is_active: true,
    },
    {
      slug: 'hardware',
      name: 'Hardware',
      description: 'Computer hardware and components',
      is_active: true,
    },
    {
      slug: 'services',
      name: 'Services',
      description: 'Professional services and consulting',
      is_active: true,
    },
  ],
};

// ============================================================================
// CONFIGURATION DATASETS
// ============================================================================

/**
 * Example 7: System Settings
 * Bootstrap system configuration
 * Use Case: Initial system setup
 */
export const SystemSettingsDataset: Dataset = {
  object: 'system_setting',
  externalId: 'key',
  mode: 'upsert',
  env: ['prod', 'dev', 'test'],
  
  records: [
    {
      key: 'company_name',
      value: 'ObjectStack Demo',
      category: 'general',
      description: 'Company name displayed in UI',
    },
    {
      key: 'default_currency',
      value: 'USD',
      category: 'localization',
      description: 'Default currency for the system',
    },
    {
      key: 'default_timezone',
      value: 'America/New_York',
      category: 'localization',
      description: 'Default timezone for the system',
    },
    {
      key: 'max_file_upload_size',
      value: '10485760',
      category: 'limits',
      description: 'Maximum file upload size in bytes (10MB)',
    },
    {
      key: 'session_timeout',
      value: '3600',
      category: 'security',
      description: 'Session timeout in seconds (1 hour)',
    },
  ],
};

/**
 * Example 8: Email Templates
 * Standard notification templates
 * Use Case: Email automation
 */
export const EmailTemplatesDataset: Dataset = {
  object: 'email_template',
  externalId: 'code',
  mode: 'upsert',
  env: ['prod', 'dev', 'test'],
  
  records: [
    {
      code: 'welcome_email',
      name: 'Welcome Email',
      subject: 'Welcome to {{company_name}}',
      body: '<h1>Welcome {{user_name}}</h1><p>Thank you for joining us!</p>',
      is_active: true,
    },
    {
      code: 'password_reset',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      body: '<p>Click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p>',
      is_active: true,
    },
    {
      code: 'order_confirmation',
      name: 'Order Confirmation',
      subject: 'Order Confirmation - {{order_number}}',
      body: '<h2>Order Confirmed</h2><p>Your order {{order_number}} has been confirmed.</p>',
      is_active: true,
    },
  ],
};

// ============================================================================
// TEST DATA DATASETS
// ============================================================================

/**
 * Example 9: Test Users
 * Test user accounts
 * Use Case: Automated testing, QA
 */
export const TestUsersDataset: Dataset = {
  object: 'user',
  externalId: 'username',
  mode: 'upsert',
  env: ['test'],
  
  records: [
    {
      username: 'admin_test',
      email: 'admin@test.example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'system_admin',
      is_active: true,
    },
    {
      username: 'sales_test',
      email: 'sales@test.example.com',
      first_name: 'Sales',
      last_name: 'Rep',
      role: 'sales_rep',
      is_active: true,
    },
    {
      username: 'support_test',
      email: 'support@test.example.com',
      first_name: 'Support',
      last_name: 'Agent',
      role: 'support_agent',
      is_active: true,
    },
  ],
};

/**
 * Example 10: Test Orders
 * Sample orders for testing
 * Use Case: Order processing tests
 */
export const TestOrdersDataset: Dataset = {
  object: 'order',
  externalId: 'order_number',
  mode: 'replace',
  env: ['test'],
  
  records: [
    {
      order_number: 'ORD-TEST-001',
      customer_email: 'customer1@test.example.com',
      status: 'draft',
      total_amount: 299.97,
      order_date: '2024-01-15',
      items: [
        { sku: 'WIDGET-001', quantity: 2, price: 99.99 },
        { sku: 'GADGET-001', quantity: 1, price: 99.99 },
      ],
    },
    {
      order_number: 'ORD-TEST-002',
      customer_email: 'customer2@test.example.com',
      status: 'submitted',
      total_amount: 149.99,
      order_date: '2024-01-16',
      items: [
        { sku: 'TOOL-001', quantity: 1, price: 149.99 },
      ],
    },
  ],
};
