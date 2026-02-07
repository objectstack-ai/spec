/**
 * CRM Seed Data
 * 
 * Demo records for all core CRM objects.
 * Uses the DatasetSchema format with upsert mode for idempotent loading.
 */
import type { DatasetInput } from '@objectstack/spec/data';

// ─── Accounts ─────────────────────────────────────────────────────────
const accounts: DatasetInput = {
  object: 'account',
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: 'Acme Corporation',
      type: 'customer',
      industry: 'technology',
      annual_revenue: 5000000,
      number_of_employees: 250,
      phone: '+1-415-555-0100',
      website: 'https://acme.example.com',
    },
    {
      name: 'Globex Industries',
      type: 'prospect',
      industry: 'manufacturing',
      annual_revenue: 12000000,
      number_of_employees: 800,
      phone: '+1-312-555-0200',
      website: 'https://globex.example.com',
    },
    {
      name: 'Initech Solutions',
      type: 'customer',
      industry: 'finance',
      annual_revenue: 3500000,
      number_of_employees: 150,
      phone: '+1-212-555-0300',
      website: 'https://initech.example.com',
    },
    {
      name: 'Stark Medical',
      type: 'partner',
      industry: 'healthcare',
      annual_revenue: 8000000,
      number_of_employees: 400,
      phone: '+1-617-555-0400',
      website: 'https://starkmed.example.com',
    },
    {
      name: 'Wayne Enterprises',
      type: 'customer',
      industry: 'technology',
      annual_revenue: 25000000,
      number_of_employees: 2000,
      phone: '+1-650-555-0500',
      website: 'https://wayne.example.com',
    },
  ]
};

// ─── Contacts ─────────────────────────────────────────────────────────
const contacts: DatasetInput = {
  object: 'contact',
  mode: 'upsert',
  externalId: 'email',
  records: [
    {
      salutation: 'Mr.',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@acme.example.com',
      phone: '+1-415-555-0101',
      title: 'VP of Engineering',
      department: 'Engineering',
    },
    {
      salutation: 'Ms.',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.j@globex.example.com',
      phone: '+1-312-555-0201',
      title: 'Chief Procurement Officer',
      department: 'Executive',
    },
    {
      salutation: 'Dr.',
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'mchen@initech.example.com',
      phone: '+1-212-555-0301',
      title: 'Director of Operations',
      department: 'Operations',
    },
    {
      salutation: 'Ms.',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.d@starkmed.example.com',
      phone: '+1-617-555-0401',
      title: 'Head of Partnerships',
      department: 'Sales',
    },
    {
      salutation: 'Mr.',
      first_name: 'Robert',
      last_name: 'Wilson',
      email: 'rwilson@wayne.example.com',
      phone: '+1-650-555-0501',
      title: 'CTO',
      department: 'Engineering',
    },
  ]
};

// ─── Leads ────────────────────────────────────────────────────────────
const leads: DatasetInput = {
  object: 'lead',
  mode: 'upsert',
  externalId: 'email',
  records: [
    {
      first_name: 'Alice',
      last_name: 'Martinez',
      company: 'NextGen Retail',
      email: 'alice@nextgenretail.example.com',
      phone: '+1-503-555-0600',
      status: 'new',
      source: 'website',
      industry: 'Retail',
    },
    {
      first_name: 'David',
      last_name: 'Kim',
      company: 'EduTech Labs',
      email: 'dkim@edutechlabs.example.com',
      phone: '+1-408-555-0700',
      status: 'contacted',
      source: 'referral',
      industry: 'Education',
    },
    {
      first_name: 'Lisa',
      last_name: 'Thompson',
      company: 'CloudFirst Inc',
      email: 'lisa.t@cloudfirst.example.com',
      phone: '+1-206-555-0800',
      status: 'qualified',
      source: 'trade_show',
      industry: 'Technology',
    },
  ]
};

// ─── Opportunities ────────────────────────────────────────────────────
const opportunities: DatasetInput = {
  object: 'opportunity',
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: 'Acme Platform Upgrade',
      amount: 150000,
      stage: 'proposal',
      probability: 60,
      close_date: new Date(Date.now() + 86400000 * 30),
      type: 'existing_business',
      forecast_category: 'pipeline',
    },
    {
      name: 'Globex Manufacturing Suite',
      amount: 500000,
      stage: 'qualification',
      probability: 30,
      close_date: new Date(Date.now() + 86400000 * 60),
      type: 'new_business',
      forecast_category: 'pipeline',
    },
    {
      name: 'Wayne Enterprise License',
      amount: 1200000,
      stage: 'negotiation',
      probability: 75,
      close_date: new Date(Date.now() + 86400000 * 14),
      type: 'new_business',
      forecast_category: 'commit',
    },
    {
      name: 'Initech Cloud Migration',
      amount: 80000,
      stage: 'needs_analysis',
      probability: 25,
      close_date: new Date(Date.now() + 86400000 * 45),
      type: 'existing_business',
      forecast_category: 'best_case',
    },
  ]
};

// ─── Products ─────────────────────────────────────────────────────────
const products: DatasetInput = {
  object: 'product',
  mode: 'upsert',
  externalId: 'name',
  records: [
    {
      name: 'ObjectStack Platform',
      category: 'software',
      family: 'enterprise',
      list_price: 50000,
      is_active: true,
    },
    {
      name: 'Cloud Hosting (Annual)',
      category: 'subscription',
      family: 'cloud',
      list_price: 12000,
      is_active: true,
    },
    {
      name: 'Premium Support',
      category: 'support',
      family: 'services',
      list_price: 25000,
      is_active: true,
    },
    {
      name: 'Implementation Services',
      category: 'service',
      family: 'services',
      list_price: 75000,
      is_active: true,
    },
  ]
};

// ─── Tasks ────────────────────────────────────────────────────────────
const tasks: DatasetInput = {
  object: 'task',
  mode: 'upsert',
  externalId: 'subject',
  records: [
    {
      subject: 'Follow up with Acme on proposal',
      status: 'not_started',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000 * 2),
    },
    {
      subject: 'Schedule demo for Globex team',
      status: 'in_progress',
      priority: 'normal',
      due_date: new Date(Date.now() + 86400000 * 5),
    },
    {
      subject: 'Prepare contract for Wayne Enterprises',
      status: 'not_started',
      priority: 'urgent',
      due_date: new Date(Date.now() + 86400000),
    },
    {
      subject: 'Send welcome package to Stark Medical',
      status: 'completed',
      priority: 'low',
    },
    {
      subject: 'Update CRM pipeline report',
      status: 'not_started',
      priority: 'normal',
      due_date: new Date(Date.now() + 86400000 * 7),
    },
  ]
};

/** All CRM seed datasets */
export const CrmSeedData: DatasetInput[] = [
  accounts,
  contacts,
  leads,
  opportunities,
  products,
  tasks,
];
