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
  
  // Metadata
  metadata: {
    displayName: 'Advanced CRM Suite',
    description: 'Enterprise-grade CRM with sales automation, analytics, and AI-powered insights',
    author: {
      name: 'Acme Corporation',
      email: 'plugins@acme.com',
      url: 'https://acme.com',
    },
    
    // Keywords for discovery
    keywords: [
      'crm',
      'sales',
      'customer-management',
      'analytics',
      'ai',
      'automation',
    ],
    
    // Categories
    categories: ['sales', 'analytics', 'productivity'],
    
    // Homepage and documentation
    homepage: 'https://acme.com/plugins/advanced-crm',
    documentation: 'https://docs.acme.com/advanced-crm',
    repository: 'https://github.com/acme/advanced-crm',
    
    // Support
    support: {
      email: 'support@acme.com',
      url: 'https://support.acme.com',
      chat: 'https://chat.acme.com',
    },
    
    // Screenshots
    screenshots: [
      {
        url: 'https://cdn.acme.com/screenshots/dashboard.png',
        caption: 'Sales Dashboard',
      },
      {
        url: 'https://cdn.acme.com/screenshots/pipeline.png',
        caption: 'Sales Pipeline',
      },
    ],
    
    // Demo
    demo: {
      url: 'https://demo.acme.com/crm',
      credentials: {
        username: 'demo',
        password: 'demo',
      },
    },
  },
  
  // Package information
  package: {
    // Package location
    registry: 'npm',
    name: '@acme/advanced-crm',
    version: '2.1.0',
    
    // Checksums for integrity
    checksums: {
      sha256: 'abc123...',
      sha512: 'def456...',
    },
    
    // Size
    size: 15728640, // 15MB
    
    // Bundle format
    format: 'esm',
  },
  
  // Dependencies
  dependencies: {
    // Required plugins
    required: {
      'com.objectstack.driver.postgres': '>=1.0.0',
      'com.objectstack.auth.oauth2': '^2.0.0',
    },
    
    // Optional plugins (enhanced features)
    optional: {
      'com.acme.analytics.basic': '>=1.5.0',
      'com.acme.ai.assistant': '>=3.0.0',
    },
    
    // Peer dependencies
    peer: {
      '@objectstack/core': '>=0.6.0',
    },
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
      },
      {
        protocol: {
          id: 'com.objectstack.protocol.analytics.v1',
          label: 'Analytics Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'partial',
        implementedFeatures: ['reporting', 'dashboards'],
      },
    ],
    
    // Services provided
    services: [
      {
        interface: 'CustomerService',
        version: '2.0.0',
      },
      {
        interface: 'OpportunityService',
        version: '2.0.0',
      },
    ],
    
    // Features
    // Note: This field would typically be removed or left empty as features are now in protocol.features
  },
  
  // Compatibility
  compatibility: {
    // ObjectStack version
    minObjectStackVersion: '0.6.0',
    maxObjectStackVersion: '1.0.0',
    
    // Node.js version
    nodeVersion: '>=18.0.0',
    
    // Platform support
    platforms: ['linux', 'darwin', 'win32'],
  },
  
  // Licensing
  license: 'SEE LICENSE IN LICENSE.txt',
  
  // Publishing information
  published: {
    date: '2024-01-15T10:00:00Z',
    by: 'acme-publisher',
  },
  
  // Stats
  stats: {
    downloads: {
      total: 125000,
      lastMonth: 15000,
      lastWeek: 3500,
    },
    
    // Ratings
    rating: {
      average: 4.7,
      count: 342,
    },
    
    // GitHub stars (if applicable)
    stars: 2100,
  },
  
  // Verification
  verification: {
    // Verified publisher
    verified: true,
    
    // Security scan
    securityScan: {
      passed: true,
      lastScan: '2024-01-15T08:00:00Z',
      vulnerabilities: 0,
    },
    
    // Code quality
    quality: {
      score: 92,
      coverage: 85,
    },
  },
};

/**
 * Example 2: Marketplace Listing
 * 
 * Marketplace listing extends registry entry with commercial information.
 */

export const crmMarketplaceListing: MarketplaceListing = {
  // Registry reference
  pluginId: 'com.acme.crm.advanced',
  version: '2.1.0',
  
  // Pricing
  pricing: {
    model: 'paid',
    price: 29,
    currency: 'USD',
    billingPeriod: 'monthly',
  },
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
  
  // License type
  type: 'subscription',
  
  // Licensee
  licensee: {
    organization: 'My Company Inc.',
    email: 'admin@mycompany.com',
    
    // Contact
    contact: {
      name: 'John Admin',
      email: 'john@mycompany.com',
    },
  },
  
  // Tier
  tier: 'professional',
  
  // Entitlements
  entitlements: {
    users: 50,
    records: 100000,
    apiCalls: 1000000,
    
    // Features
    features: [
      'advanced-analytics',
      'ai-lead-scoring',
      'workflow-automation',
      'priority-support',
    ],
  },
  
  // Validity period
  validity: {
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2025-01-01T00:00:00Z',
    
    // Auto-renewal
    autoRenew: true,
  },
  
  // Usage tracking
  usage: {
    currentUsers: 35,
    currentRecords: 45000,
    currentApiCalls: 250000,
    
    // Last reset (monthly)
    lastReset: '2024-01-01T00:00:00Z',
  },
  
  // Restrictions
  restrictions: {
    // Deployment restrictions
    deployment: {
      // Cloud or on-premise
      type: 'cloud',
      
      // Geographic restrictions
      regions: ['us', 'eu'],
    },
    
    // Installation limits
    installations: {
      max: 1, // Single production instance
      current: 1,
    },
  },
  
  // Support entitlement
  support: {
    level: 'priority',
    sla: {
      responseTime: 4, // hours
      resolutionTime: 24, // hours
    },
  },
  
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
  
  // Subscription
  subscription: {
    plan: 'enterprise',
    status: 'active',
    
    // Billing
    billing: {
      cycle: 'annual',
      startDate: '2024-01-01T00:00:00Z',
      nextBillingDate: '2025-01-01T00:00:00Z',
      
      amount: 9540, // $199 * 50 users * 0.9 (10% discount)
      currency: 'USD',
    },
  },
  
  // Limits and quotas
  limits: {
    users: 50,
    records: 100000,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    apiCalls: 1000000,
    
    // Custom objects
    customObjects: 50,
    
    // Plugins
    plugins: 20,
  },
  
  // Current usage
  usage: {
    users: 35,
    records: 45000,
    storage: 25 * 1024 * 1024 * 1024, // 25GB
    apiCalls: 250000,
    
    customObjects: 12,
    plugins: 8,
  },
  
  // Data isolation
  isolation: {
    // Database isolation
    database: {
      strategy: 'schema', // or 'database', 'row_level'
      
      // Dedicated schema
      schema: 'tenant_my_company',
      
      // Connection pool
      pool: {
        min: 2,
        max: 10,
      },
    },
    
    // Storage isolation
    storage: {
      // S3 bucket path
      path: 'tenants/tenant-12345/',
      
      // Encryption
      encryption: {
        enabled: true,
        keyId: 'tenant-12345-encryption-key',
      },
    },
  },
  
  // Configuration
  configuration: {
    // Branding
    branding: {
      logo: 'https://mycompany.com/logo.png',
      primaryColor: '#0066CC',
      secondaryColor: '#FF6600',
    },
    
    // Domain
    domain: {
      // Custom domain
      custom: 'crm.mycompany.com',
      
      // Default domain
      default: 'my-company.objectstack.app',
      
      // SSL certificate
      ssl: {
        enabled: true,
        certificate: 'auto', // or custom certificate
      },
    },
    
    // Features
    features: {
      enabled: [
        'advanced-analytics',
        'ai-features',
        'custom-objects',
        'api-access',
        'sso',
      ],
      disabled: [
        'public-api',
      ],
    },
    
    // Security
    security: {
      // SSO
      sso: {
        enabled: true,
        provider: 'okta',
        config: {
          domain: 'mycompany.okta.com',
          clientId: '${env:OKTA_CLIENT_ID}',
          clientSecret: '${env:OKTA_CLIENT_SECRET}',
        },
      },
      
      // IP whitelist
      ipWhitelist: {
        enabled: true,
        ranges: [
          '192.168.1.0/24',
          '10.0.0.0/8',
        ],
      },
      
      // MFA requirement
      mfa: {
        required: true,
        methods: ['totp', 'sms'],
      },
    },
  },
  
  // Metadata
  metadata: {
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system',
    
    // Onboarding
    onboarding: {
      completed: true,
      completedAt: '2024-01-05T10:30:00Z',
    },
  },
  
  // Status
  status: 'active', // or 'suspended', 'terminated'
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
