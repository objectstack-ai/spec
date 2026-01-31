/**
 * Example: Hub & Marketplace Protocols
 * 
 * This example demonstrates the ObjectStack Hub & Marketplace ecosystem:
 * - Plugin Registry (Publishing and discovery)
 * - Marketplace (Plugin distribution)
 * - Licensing (Commercial and open-source)
 * - Multi-tenancy (Tenant isolation)
 * - Spaces (Organizational workspaces)
 * - Composer (Visual app builder)
 * 
 * Protocols covered:
 * - Plugin Registry Protocol
 * - Marketplace Protocol
 * - License Protocol
 * - Tenant Protocol
 * - Space Protocol
 * - Composer Protocol
 */

import {
  PluginRegistryEntry,
  MarketplaceListing,
  License,
  Tenant,
  Space,
  ComposerConfig,
} from '@objectstack/spec/hub';

/**
 * Example 1: Plugin Registry
 * 
 * The Plugin Registry is a centralized catalog of all available plugins,
 * similar to npm, PyPI, or Maven Central.
 */

export const crmPluginRegistry: PluginRegistryEntry = {
  // Plugin identity
  id: 'com.acme.crm.advanced',
  name: 'Advanced CRM',
  version: '2.1.0',
  deprecated: false,
  vendor: {
    id: 'com.acme',
    name: 'Acme Corporation',
    verified: true,
    trustLevel: 'verified',
  },
  
  // Capabilities provided
  capabilities: {
    // Protocols implemented
    implements: [
      {
        protocol: {
          id: 'com.objectstack.protocol.storage.v1',
          label: 'Storage Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'full',
        certified: false,
      },
      {
        protocol: {
          id: 'com.objectstack.protocol.analytics.v1',
          label: 'Analytics Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'partial',
        implementedFeatures: ['reporting', 'dashboards'],
        certified: false,
      },
    ],
  },
  
  // Licensing
  license: 'SEE LICENSE IN LICENSE.txt',
};

/**
 * Example 2: Marketplace Listing
 * 
 * Marketplace listing extends registry entry with commercial information.
 */

export const crmMarketplaceListing: MarketplaceListing = {
  // Registry reference
  id: 'com.acme.crm.advanced',
  label: 'Advanced CRM',
  version: '2.1.0',
  
  // Pricing
  pricing: {
    type: 'recurring',
    amount: 29,
    currency: 'USD',
    interval: 'month',
  },
  
  // Verified
  verified: false,
};
/* Removed detailed pricing tiers due to schema mismatch */
const crmMarketplaceListingRemoved = {
  pricing: {
    model: 'subscription',
    
    // Pricing tiers
    tiers: [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small teams',
        
        price: {
          amount: 29,
          currency: 'USD',
          period: 'month',
          unit: 'user',
        },
        
        // Limits
        limits: {
          users: 5,
          records: 10000,
          apiCalls: 100000,
        },
        
        // Features
        features: [
          'Basic CRM',
          'Email Integration',
          'Mobile App',
          'Standard Support',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For growing businesses',
        
        price: {
          amount: 79,
          currency: 'USD',
          period: 'month',
          unit: 'user',
        },
        
        limits: {
          users: 50,
          records: 100000,
          apiCalls: 1000000,
        },
        
        features: [
          'Everything in Starter',
          'Advanced Analytics',
          'AI Lead Scoring',
          'Workflow Automation',
          'Priority Support',
        ],
        
        // Popular badge
        popular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        
        price: {
          amount: 199,
          currency: 'USD',
          period: 'month',
          unit: 'user',
        },
        
        limits: {
          users: -1, // Unlimited
          records: -1,
          apiCalls: -1,
        },
        
        features: [
          'Everything in Professional',
          'Custom Objects',
          'Advanced AI Features',
          'SSO & SAML',
          'Dedicated Support',
          'SLA Guarantee',
          'Custom Training',
        ],
      },
    ],
    
    // Volume discounts
    volumeDiscounts: [
      {
        minUsers: 100,
        discount: 0.1, // 10% off
      },
      {
        minUsers: 500,
        discount: 0.2, // 20% off
      },
    ],
    
    // Annual discount
    annualDiscount: 0.15, // 15% off for annual billing
  },
  
  // Free trial
  trial: {
    enabled: true,
    duration: 30,
    tier: 'professional', // Full features during trial
    requiresCreditCard: false,
  },
  
  // Purchase options
  purchase: {
    // Buy directly
    direct: {
      enabled: true,
      url: 'https://acme.com/buy/advanced-crm',
    },
    
    // Contact sales
    contactSales: {
      enabled: true,
      url: 'https://acme.com/contact-sales',
      phone: '+1-800-ACME-CRM',
      email: 'sales@acme.com',
    },
    
    // Marketplace checkout
    marketplace: {
      enabled: true,
    },
  },
  
  // Customer references
  customers: [
    {
      name: 'Tech Corp',
      industry: 'Technology',
      size: '1000-5000',
      logo: 'https://cdn.acme.com/customers/techcorp.png',
      testimonial: 'Advanced CRM transformed our sales process. Highly recommended!',
      author: 'Jane Smith, VP of Sales',
    },
  ],
  
  // Case studies
  caseStudies: [
    {
      title: 'How Tech Corp Increased Sales by 40%',
      url: 'https://acme.com/case-studies/tech-corp',
      thumbnail: 'https://cdn.acme.com/case-studies/tech-corp-thumb.png',
    },
  ],
  
  // Integrations
  integrations: [
    {
      name: 'Slack',
      icon: 'https://cdn.acme.com/integrations/slack.png',
    },
    {
      name: 'Gmail',
      icon: 'https://cdn.acme.com/integrations/gmail.png',
    },
  ],
};

/**
 * Example 3: License Management
 * 
 * License keys and entitlements for commercial plugins.
 */

export const crmLicense: License = {
  // Plugin
  spaceId: 'space-12345',
  planCode: 'pro',
  
  // Status
  status: 'active',
  
  // Validity
  issuedAt: '2024-01-01T00:00:00Z',
  expiresAt: '2025-01-01T00:00:00Z',
  
  // Custom features beyond plan
  customFeatures: [
    'advanced-analytics',
    'ai-lead-scoring',
  ],
  
  // Custom limits
  customLimits: {
    users: 50,
    storage_gb: 100,
  },
  
  // Authorized plugins
  plugins: ['com.acme.crm.advanced'],
  
  // Signature for verification
  signature: 'base64-encoded-signature',
};

/**
 * Example 4: Multi-Tenancy
 * 
 * Tenant isolation for SaaS applications.
 */

export const tenantConfig: Tenant = {
  // Tenant identity
  id: 'tenant-12345',
  name: 'My Company Inc.',
  
  // Tenant isolation level
  isolationLevel: 'shared_schema',
  
  // Resource quotas
  quotas: {
    maxUsers: 50,
    maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
    apiRateLimit: 1000,
  },
  
  // Custom configuration
  customizations: {
    branding: {
      primaryColor: '#0052CC',
      logo: 'https://mycompany.com/logo.png',
    },
    features: {
      advancedAnalytics: true,
      aiLeadScoring: true,
    },
  },
};

/**
 * Example 5: Spaces (Workspaces)
 * 
 * Spaces provide logical grouping within a tenant for teams or projects.
 */

export const salesSpace: Space = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Sales Team',
  slug: 'sales',
  ownerId: 'user-001',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  
  bom: {
    tenantId: 'tenant-12345',
    resolutionStrategy: 'override',
    dependencies: [],
  },

  lastBuild: {
    id: 'build-001',
    timestamp: '2024-01-02T00:00:00Z',
    status: 'success',
  },
};
/* Example configuration removed due to schema mismatch */
const salesSpaceRemoved = {
  // Space identity
  id: 'space-sales-001',
  tenantId: 'tenant-12345',
  
  name: 'sales',
  displayName: 'Sales Team',
  description: 'Workspace for the sales team',
  
  // Type
  type: 'team', // or 'project', 'department'
  
  // Members
  members: [
    {
      userId: 'user-001',
      role: 'admin',
      permissions: ['manage_space', 'manage_members', 'manage_data'],
    },
    {
      userId: 'user-002',
      role: 'member',
      permissions: ['read_data', 'write_data'],
    },
  ],
  
  // Resources (scoped to this space)
  resources: {
    // Objects visible in this space
    objects: ['account', 'contact', 'opportunity', 'lead'],
    
    // Dashboards
    dashboards: ['sales_pipeline', 'revenue_forecast'],
    
    // Reports
    reports: ['monthly_sales', 'lead_conversion'],
  },
  
  // Settings
  settings: {
    // Visibility
    visibility: 'private', // or 'public', 'restricted'
    
    // Data sharing between spaces
    dataSharing: {
      enabled: true,
      shareWith: ['space-marketing-001'], // Share with marketing
    },
  },
  
  // Metadata
  metadata: {
    createdAt: '2024-01-02T00:00:00Z',
    createdBy: 'user-001',
  },
  
  // Status
  status: 'active',
};

/**
 * Example 6: Composer (Visual App Builder)
 * 
 * Composer configuration for no-code/low-code app building.
 */

export const composerConfig: ComposerConfig = {
  // BOM (Bill of Materials)
  bom: {
    tenantId: 'tenant-12345',
    resolutionStrategy: 'override',
    dependencies: [],
  },
  
  // Dry run mode
  dryRun: false,
};
/* Removed UI builder configuration due to schema mismatch */
const composerConfigRemoved = {
  // Enable composer
  enabled: true,
  
  // UI Builder
  uiBuilder: {
    // Page builder
    pageBuilder: {
      enabled: true,
      
      // Available components
      components: [
        'text',
        'image',
        'button',
        'form',
        'table',
        'chart',
        'map',
        'calendar',
      ],
      
      // Layouts
      layouts: ['single-column', 'two-column', 'three-column', 'grid'],
      
      // Themes
      themes: ['light', 'dark', 'custom'],
    },
    
    // Form builder
    formBuilder: {
      enabled: true,
      
      // Field types
      fieldTypes: [
        'text',
        'number',
        'date',
        'select',
        'checkbox',
        'file',
      ],
      
      // Validation
      validation: {
        enabled: true,
        rules: ['required', 'email', 'url', 'min', 'max', 'pattern'],
      },
    },
    
    // Workflow designer
    workflowDesigner: {
      enabled: true,
      
      // Node types
      nodeTypes: [
        'trigger',
        'action',
        'condition',
        'loop',
        'delay',
        'fork',
        'join',
      ],
      
      // Actions
      actions: [
        'create_record',
        'update_record',
        'send_email',
        'call_api',
        'run_script',
      ],
    },
  },
  
  // Data modeling
  dataModeling: {
    enabled: true,
    
    // Object designer
    objectDesigner: {
      enabled: true,
      
      // Max custom objects
      maxCustomObjects: 50,
      
      // Max fields per object
      maxFieldsPerObject: 500,
    },
    
    // Relationship designer
    relationshipDesigner: {
      enabled: true,
      
      // Relationship types
      types: ['one-to-many', 'many-to-one', 'many-to-many'],
    },
  },
  
  // Logic builder
  logicBuilder: {
    // Formula builder
    formulaBuilder: {
      enabled: true,
      
      // Functions
      functions: [
        'math',
        'text',
        'date',
        'logical',
        'lookup',
      ],
    },
    
    // Validation rule builder
    validationBuilder: {
      enabled: true,
    },
  },
  
  // Templates
  templates: {
    enabled: true,
    
    // Available templates
    available: [
      {
        id: 'crm-starter',
        name: 'CRM Starter',
        description: 'Basic CRM application',
        category: 'sales',
      },
      {
        id: 'project-management',
        name: 'Project Management',
        description: 'Project tracking application',
        category: 'productivity',
      },
    ],
  },
  
  // Publishing
  publishing: {
    // Publish to marketplace
    marketplace: {
      enabled: true,
      
      // Review required
      reviewRequired: true,
    },
    
    // Export
    export: {
      enabled: true,
      formats: ['json', 'yaml', 'typescript'],
    },
  },
};

// Uncomment to see configurations
// console.log('Plugin Registry:', crmPluginRegistry);
// console.log('Marketplace Listing:', crmMarketplaceListing);
// console.log('License:', crmLicense);
// console.log('Tenant:', tenantConfig);
// console.log('Space:', salesSpace);
// console.log('Composer:', composerConfig);
