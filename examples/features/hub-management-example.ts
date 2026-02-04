/**
 * # Hub Management API Example
 * 
 * This example demonstrates the complete Hub management ecosystem including:
 * - Space/Tenant management
 * - Plugin registry and marketplace
 * - License management
 * - Multi-region federation
 * - Security scanning and dependency resolution
 * - Composer/build service
 * 
 * The Hub is the unified cloud management center for ObjectStack,
 * managing all tenants, plugins, spaces, and infrastructure.
 */

import {
  // Space Management
  CreateSpaceRequest,
  SpaceResponse,
  ListSpacesResponse,
  
  // Tenant Management
  CreateTenantRequest,
  TenantResponse,
  
  // Plugin Registry
  PublishPluginRequest,
  PluginResponse,
  SearchPluginsResponse,
  
  // License Management
  IssueLicenseRequest,
  LicenseResponse,
  ValidateLicenseResponse,
  
  // Composer Service
  CompileManifestRequest,
  CompileManifestResponse,
  
  // Health & Monitoring
  HubHealthResponse,
  HubMetricsResponse,
} from '@objectstack/spec/api';

import {
  // Federation
  Region,
  FederationTopology,
  TenantPlacementPolicy,
  
  // Security
  SecurityScanResult,
  SecurityPolicy,
  DependencyResolutionResult,
  SBOM,
  PluginProvenance,
  PluginTrustScore,
} from '@objectstack/spec/hub';

// ============================================================================
// Example 1: Space Management
// ============================================================================

/**
 * Creating a new workspace/space for a team
 */
export const createSpaceExample: CreateSpaceRequest = {
  name: 'Sales Team Workspace',
  slug: 'sales-team',
  ownerId: 'user_abc123',
  
  // Define runtime configuration
  runtime: {
    isolation: 'shared_schema',  // Cost-effective shared schema isolation
    quotas: {
      maxUsers: 50,
      maxStorage: 107374182400,  // 100GB
      apiRateLimit: 10000,       // 10k requests per minute
    },
  },
  
  // Initial Bill of Materials (empty - will add plugins later)
  bom: {
    tenantId: 'tenant_abc123',
    dependencies: [],
    resolutionStrategy: 'override',
  },
};

/**
 * Space creation response
 */
export const spaceCreatedResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Sales Team Workspace',
  slug: 'sales-team',
  ownerId: 'user_abc123',
  runtime: {
    isolation: 'shared_schema',
    quotas: {
      maxUsers: 50,
      maxStorage: 107374182400,
      apiRateLimit: 10000,
    },
  },
  bom: {
    tenantId: 'tenant_abc123',
    dependencies: [],
    resolutionStrategy: 'override',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Listing all spaces for an organization
 */
export const listSpacesExample: ListSpacesResponse = {
  data: [
    spaceCreatedResponse,
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      name: 'Marketing Team',
      slug: 'marketing-team',
      ownerId: 'user_abc123',
      bom: {
        tenantId: 'tenant_abc123',
        dependencies: [],
        resolutionStrategy: 'override',
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ],
  pagination: {
    page: 1,
    perPage: 20,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// ============================================================================
// Example 2: Plugin Publishing & Marketplace
// ============================================================================

/**
 * Publishing a new plugin to the registry
 */
export const publishPluginExample: PublishPluginRequest = {
  id: 'com.acme.advanced-crm',
  version: '2.0.0',
  name: 'Advanced CRM Suite',
  description: 'Enterprise-grade CRM with AI-powered insights and automation',
  category: 'data',
  tags: ['crm', 'sales', 'automation', 'ai'],
  
  vendor: {
    id: 'com.acme',
    name: 'Acme Corporation',
    website: 'https://acme.com',
    email: 'support@acme.com',
    verified: true,
    trustLevel: 'verified',
  },
  
  capabilities: {
    implements: [
      {
        protocol: {
          id: 'com.objectstack.protocol.data.v1',
          label: 'Data Protocol',
          version: { major: 1, minor: 0, patch: 0 },
        },
        conformance: 'full',
        certified: false,
      },
    ],
  },
  
  compatibility: {
    minObjectStackVersion: '1.0.0',
    nodeVersion: '>=18.0.0',
    platforms: ['linux', 'darwin', 'win32'],
  },
  
  links: {
    homepage: 'https://acme.com/products/advanced-crm',
    repository: 'https://github.com/acme/advanced-crm',
    documentation: 'https://docs.acme.com/advanced-crm',
    bugs: 'https://github.com/acme/advanced-crm/issues',
  },
  
  media: {
    icon: 'https://cdn.acme.com/icons/crm.png',
    screenshots: [
      'https://cdn.acme.com/screenshots/crm-dashboard.png',
      'https://cdn.acme.com/screenshots/crm-pipeline.png',
    ],
  },
  
  license: 'SEE LICENSE IN LICENSE.txt',
  
  pricing: {
    model: 'freemium',
    price: 29,
    currency: 'USD',
    billingPeriod: 'monthly',
  },
  
  deprecated: false,
  flags: {
    experimental: false,
    beta: false,
    featured: true,
    verified: true,
  },
};

/**
 * Searching plugins in the marketplace
 */
export const searchPluginsExample: SearchPluginsResponse = {
  success: true,
  data: [
    {
      ...publishPluginExample,
      publishedAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      statistics: {
        downloads: 15420,
        downloadsLastMonth: 1250,
        activeInstallations: 850,
        ratings: {
          average: 4.7,
          count: 120,
          distribution: {
            '5': 85,
            '4': 25,
            '3': 8,
            '2': 1,
            '1': 1,
          },
        },
        stars: 345,
        dependents: 12,
      },
      quality: {
        testCoverage: 92,
        documentationScore: 88,
        codeQuality: 85,
        securityScan: {
          lastScanDate: '2024-01-15T00:00:00Z',
          vulnerabilities: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
          },
          passed: true,
        },
      },
    },
  ],
  pagination: {
    page: 1,
    perPage: 20,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// ============================================================================
// Example 3: License Management
// ============================================================================

/**
 * Issuing a license for a space
 */
export const issueLicenseExample: IssueLicenseRequest = {
  spaceId: '550e8400-e29b-41d4-a716-446655440000',
  planCode: 'enterprise_v1',
  expiresAt: '2025-12-31T23:59:59Z',
  
  // Custom features beyond the plan
  customFeatures: [
    'advanced_analytics',
    'ai_insights',
    'custom_integrations',
  ],
  
  // Custom limits
  customLimits: {
    storage_gb: 500,
    api_calls_monthly: 10000000,
    users: 200,
  },
  
  // Authorized plugins
  plugins: [
    'com.acme.advanced-crm',
    'com.acme.analytics-pro',
  ],
};

/**
 * License issued response
 */
export const licenseIssuedExample: LicenseResponse = {
  success: true,
  data: {
    spaceId: '550e8400-e29b-41d4-a716-446655440000',
    planCode: 'enterprise_v1',
    status: 'active',
    issuedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
    customFeatures: ['advanced_analytics', 'ai_insights'],
    customLimits: {
      storage_gb: 500,
      api_calls_monthly: 10000000,
    },
    plugins: ['com.acme.advanced-crm'],
    signature: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  }
};

/**
 * Validating a license
 */
export const validateLicenseExample: ValidateLicenseResponse = {
  success: true,
  data: {
    valid: true,
    license: (licenseIssuedExample as any).data,
    errors: [],
    warnings: [],
  }
};

// ============================================================================
// Example 4: Multi-Region Federation
// ============================================================================

/**
 * Defining a multi-region deployment topology
 */
export const federationTopologyExample: FederationTopology = {
  id: '750e8400-e29b-41d4-a716-446655440000',
  name: 'ObjectStack Global Federation',
  
  regions: [
    {
      id: 'us-east-1',
      name: 'US East (N. Virginia)',
      location: {
        continent: 'NA',
        country: 'US',
        city: 'Virginia',
        latitude: 37.5407,
        longitude: -77.4360,
      },
      provider: {
        name: 'aws',
        region: 'us-east-1',
      },
      capabilities: {
        databases: ['postgres', 'redis'],
        storage: ['s3'],
        compute: ['containers', 'serverless'],
        cdn: true,
      },
      compliance: ['soc2', 'iso27001'],
      status: 'active',
    },
    {
      id: 'eu-west-1',
      name: 'EU West (Ireland)',
      location: {
        continent: 'EU',
        country: 'IE',
      },
      provider: {
        name: 'aws',
        region: 'eu-west-1',
      },
      capabilities: {
        databases: ['postgres', 'redis'],
        storage: ['s3'],
        compute: ['containers'],
        cdn: true,
      },
      compliance: ['gdpr', 'soc2', 'iso27001'],
      status: 'active',
    },
  ],
  
  hubs: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      regionId: 'us-east-1',
      role: 'primary',
      endpoints: {
        api: 'https://api.objectstack.com',
        admin: 'https://admin.objectstack.com',
        grpc: 'grpc://hub.objectstack.com:443',
      },
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440000',
      regionId: 'eu-west-1',
      role: 'secondary',
      endpoints: {
        api: 'https://eu-api.objectstack.com',
      },
      replication: {
        primaryHubId: '550e8400-e29b-41d4-a716-446655440000',
        lagTolerance: 5,
        mode: 'async',
      },
      version: '1.0.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  
  routing: {
    strategy: 'geo-proximity',
    failover: {
      enabled: true,
      maxRetries: 3,
      timeout: 5000,
    },
  },
  
  synchronization: {
    scope: {
      plugins: true,
      tenants: true,
      spaces: false,  // Spaces stay in their region
      licenses: true,
    },
    frequency: 'realtime',
    conflictResolution: 'last-write-wins',
  },
};

/**
 * Tenant placement policy for GDPR compliance
 */
export const tenantPlacementExample: TenantPlacementPolicy = {
  tenantId: 'tenant_eu_corp',
  primaryRegion: 'eu-west-1',
  replicaRegions: ['eu-central-1'],
  
  dataResidency: {
    continent: 'EU',
    prohibitedRegions: ['us-east-1', 'us-west-1'],  // No data in US
  },
  
  failover: {
    enabled: true,
    preferredOrder: ['eu-central-1', 'eu-north-1'],
    maxLatency: 50,
  },
};

// ============================================================================
// Example 5: Plugin Security & Scanning
// ============================================================================

/**
 * Security scan result for a plugin
 */
export const securityScanExample: SecurityScanResult = {
  scanId: '850e8400-e29b-41d4-a716-446655440000',
  plugin: {
    id: 'com.acme.advanced-crm',
    version: '2.0.0',
  },
  scannedAt: '2024-01-15T00:00:00Z',
  scanner: {
    name: 'snyk',
    version: '1.1200.0',
  },
  status: 'passed',
  vulnerabilities: [],
  summary: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    total: 0,
  },
  licenseIssues: [],
  codeQuality: {
    score: 85,
    issues: [],
  },
  nextScanAt: '2024-01-16T00:00:00Z',
};

/**
 * Security policy for the hub
 */
export const securityPolicyExample: SecurityPolicy = {
  id: 'strict-policy',
  name: 'Strict Security Policy',
  
  autoScan: {
    enabled: true,
    frequency: 'daily',
  },
  
  thresholds: {
    maxCritical: 0,   // Block any critical vulnerabilities
    maxHigh: 0,       // Block any high vulnerabilities
    maxMedium: 2,     // Allow up to 2 medium vulnerabilities
  },
  
  allowedLicenses: [
    'MIT',
    'Apache-2.0',
    'BSD-3-Clause',
    'ISC',
  ],
  
  prohibitedLicenses: [
    'GPL-3.0',
    'AGPL-3.0',
  ],
  
  codeSigning: {
    required: true,
    allowedSigners: ['release-bot@acme.com'],
  },
  
  sandbox: {
    networkAccess: 'allowlist',
    allowedDestinations: [
      'api.openai.com',
      'api.stripe.com',
    ],
    filesystemAccess: 'temp-only',
    maxMemoryMB: 512,
    maxCPUSeconds: 30,
  },
};

/**
 * Dependency resolution result
 */
export const dependencyResolutionExample: DependencyResolutionResult = {
  status: 'success',
  graph: {
    root: {
      id: 'com.acme.advanced-crm',
      version: '2.0.0',
    },
    nodes: [
      {
        id: 'com.acme.advanced-crm',
        version: '2.0.0',
        dependencies: [
          {
            name: 'lodash',
            versionConstraint: '^4.17.0',
            type: 'required',
            resolvedVersion: '4.17.21',
          },
        ],
        depth: 0,
        isDirect: true,
      },
      {
        id: 'lodash',
        version: '4.17.21',
        dependencies: [],
        depth: 1,
        isDirect: false,
      },
    ],
    edges: [
      {
        from: 'com.acme.advanced-crm',
        to: 'lodash',
        constraint: '^4.17.0',
      },
    ],
    stats: {
      totalDependencies: 2,
      directDependencies: 1,
      maxDepth: 1,
    },
  },
  conflicts: [],
  errors: [],
  installOrder: ['lodash', 'com.acme.advanced-crm'],
  resolvedIn: 245,
};

/**
 * Software Bill of Materials (SBOM)
 */
export const sbomExample: SBOM = {
  format: 'cyclonedx',
  version: '1.4',
  plugin: {
    id: 'com.acme.advanced-crm',
    version: '2.0.0',
    name: 'Advanced CRM Suite',
  },
  components: [
    {
      name: 'lodash',
      version: '4.17.21',
      purl: 'pkg:npm/lodash@4.17.21',
      license: 'MIT',
      hashes: {
        sha256: 'e1fad89e53a49396e81d64bce753c43c5089f1b54e8e5c34e8e7e3f8ff5c17d5',
      },
      supplier: {
        name: 'John-David Dalton',
        url: 'https://lodash.com',
      },
      externalRefs: [
        {
          type: 'repository',
          url: 'https://github.com/lodash/lodash',
        },
      ],
    },
  ],
  generatedAt: '2024-01-15T00:00:00Z',
  generator: {
    name: 'cyclonedx-node-npm',
    version: '1.0.0',
  },
};

/**
 * Plugin provenance (supply chain security)
 */
export const pluginProvenanceExample: PluginProvenance = {
  pluginId: 'com.acme.advanced-crm',
  version: '2.0.0',
  build: {
    timestamp: '2024-01-15T10:30:00Z',
    environment: {
      os: 'linux',
      arch: 'x64',
      nodeVersion: '18.19.0',
    },
    source: {
      repository: 'https://github.com/acme/advanced-crm',
      commit: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      branch: 'main',
      tag: 'v2.0.0',
    },
    builder: {
      name: 'GitHub Actions',
      email: 'ci@acme.com',
    },
  },
  artifacts: [
    {
      filename: 'advanced-crm-2.0.0.tgz',
      sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      size: 15728640,  // 15MB
    },
  ],
  signatures: [
    {
      algorithm: 'rsa',
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkq...\n-----END PUBLIC KEY-----',
      signature: 'base64-encoded-signature',
      signedBy: 'release-bot@acme.com',
      timestamp: '2024-01-15T10:35:00Z',
    },
  ],
  attestations: [
    {
      type: 'security-scan',
      status: 'passed',
      url: 'https://scans.acme.com/850e8400',
      timestamp: '2024-01-15T10:32:00Z',
    },
    {
      type: 'test-results',
      status: 'passed',
      url: 'https://ci.github.com/acme/advanced-crm/runs/123',
      timestamp: '2024-01-15T10:28:00Z',
    },
  ],
};

/**
 * Plugin trust score
 */
export const pluginTrustScoreExample: PluginTrustScore = {
  pluginId: 'com.acme.advanced-crm',
  score: 88,
  components: {
    vendorReputation: 95,
    securityScore: 90,
    codeQuality: 85,
    communityScore: 82,
    maintenanceScore: 88,
  },
  level: 'trusted',
  badges: [
    'verified-vendor',
    'security-scanned',
    'code-signed',
    'popular',
  ],
  updatedAt: '2024-01-15T00:00:00Z',
};

// ============================================================================
// Example 6: Composer Build Service
// ============================================================================

/**
 * Compiling a manifest from Bill of Materials
 */
export const compileManifestExample: CompileManifestRequest = {
  bom: {
    tenantId: 'tenant_abc123',
    dependencies: [
      {
        id: 'com.objectstack.core',
        version: '1.0.0',
      },
      {
        id: 'com.acme.advanced-crm',
        version: '2.0.0',
        configuration: {
          currency: 'USD',
          region: 'us-east-1',
          apiKey: '${ACME_API_KEY}',  // Resolved from vault
        },
        features: {
          'advanced-analytics': true,
          'ai-insights': true,
        },
      },
    ],
    environment: {
      ACME_API_KEY: 'vault://secrets/acme/api-key',
    },
    resolutionStrategy: 'override',
  },
  runtimeVersion: '1.5.0',
  dryRun: false,
};

/**
 * Manifest compilation result
 */
export const compileManifestResultExample: CompileManifestResponse = {
  success: true,
  data: {
    buildId: 'build_abc123',
    timestamp: '2024-01-15T12:00:00Z',
    duration: 5420,  // 5.4 seconds
    
    manifestUrl: 'https://cdn.objectstack.com/manifests/build_abc123.json',
    
    conflicts: [],
    errors: [],
  }
};

// ============================================================================
// Example 7: Hub Health & Metrics
// ============================================================================

/**
 * Hub health check
 */
export const hubHealthExample: HubHealthResponse = {
  success: true,
  data: {
    status: 'healthy',
    version: '1.0.0',
    uptime: 2592000,  // 30 days
    services: {
      database: {
        status: 'healthy',
        latency: 3,
      },
      cache: {
        status: 'healthy',
        latency: 1,
      },
      composer: {
        status: 'healthy',
        latency: 12,
      },
      'plugin-registry': {
        status: 'healthy',
        latency: 8,
      },
    },
    timestamp: '2024-01-15T12:00:00Z',
  }
};

/**
 * Hub metrics
 */
export const hubMetricsExample: HubMetricsResponse = {
  success: true,
  data: {
    metrics: {
      spaces: {
        total: 2450,
        active: 1980,
        created_last_30d: 125,
      },
      tenants: {
        total: 580,
        active: 485,
      },
      plugins: {
        total: 342,
        published_last_30d: 18,
        total_downloads: 1245678,
      },
      api: {
        requests_per_minute: 1250,
        avg_response_time: 85,
        error_rate: 0.0012,
      },
    },
    timestamp: '2024-01-15T12:00:00Z',
  }
};

// Uncomment to see the examples
// console.log('Space Creation:', JSON.stringify(createSpaceExample, null, 2));
// console.log('Plugin Publishing:', JSON.stringify(publishPluginExample, null, 2));
// console.log('Federation Topology:', JSON.stringify(federationTopologyExample, null, 2));
// console.log('Security Scan:', JSON.stringify(securityScanExample, null, 2));
