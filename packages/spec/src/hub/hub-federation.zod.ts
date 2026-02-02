import { z } from 'zod';

/**
 * # Hub Federation Protocol
 * 
 * Enables distributed ObjectStack Hub deployments across multiple regions,
 * data centers, or cloud providers. Supports:
 * - Multi-region plugin distribution
 * - Federated identity and tenant management
 * - Cross-region data replication
 * - Global load balancing
 * - Disaster recovery
 * 
 * Use cases:
 * - Global SaaS deployments with regional data residency
 * - Multi-cloud resilience
 * - Edge computing with central management
 * - Hybrid cloud deployments
 */

// ============================================================================
// Region & Deployment Topology
// ============================================================================

/**
 * Geographic Region
 */
export const RegionSchema = z.object({
  /**
   * Region identifier (e.g., us-east-1, eu-west-1, ap-southeast-1)
   */
  id: z.string().regex(/^[a-z]{2}-[a-z]+-\d+$/).describe('Region identifier'),
  
  /**
   * Display name
   */
  name: z.string().describe('Human-readable region name'),
  
  /**
   * Geographic location
   */
  location: z.object({
    continent: z.enum(['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN']),
    country: z.string().regex(/^[A-Z]{2}$/).describe('ISO 3166-1 alpha-2 country code'),
    city: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  
  /**
   * Cloud provider and region mapping
   */
  provider: z.object({
    name: z.enum(['aws', 'azure', 'gcp', 'cloudflare', 'vercel', 'self-hosted']),
    region: z.string().describe('Provider-specific region identifier'),
  }).optional(),
  
  /**
   * Region capabilities
   */
  capabilities: z.object({
    databases: z.array(z.enum(['postgres', 'mysql', 'mongodb', 'redis'])).default([]),
    storage: z.array(z.enum(['s3', 'azure-blob', 'gcs'])).default([]),
    compute: z.array(z.enum(['containers', 'serverless', 'vm'])).default([]),
    cdn: z.boolean().default(false),
  }).optional(),
  
  /**
   * Compliance and certifications
   */
  compliance: z.array(z.enum(['gdpr', 'hipaa', 'soc2', 'iso27001', 'pci-dss'])).default([]),
  
  /**
   * Region status
   */
  status: z.enum(['active', 'read-only', 'maintenance', 'deprecated']).default('active'),
  
  /**
   * Resource limits for this region
   */
  limits: z.object({
    maxSpaces: z.number().int().positive().optional(),
    maxTenants: z.number().int().positive().optional(),
    maxStorage: z.number().int().positive().optional().describe('Bytes'),
  }).optional(),
});

export type Region = z.infer<typeof RegionSchema>;

/**
 * Hub Instance
 * Represents a single Hub deployment in a region
 */
export const HubInstanceSchema = z.object({
  /**
   * Instance identifier
   */
  id: z.string().uuid(),
  
  /**
   * Region where this hub is deployed
   */
  regionId: z.string(),
  
  /**
   * Hub role in federation
   */
  role: z.enum([
    'primary',      // Primary/master hub
    'secondary',    // Read-replica hub
    'edge',         // Edge location for caching
  ]),
  
  /**
   * Endpoint URLs
   */
  endpoints: z.object({
    api: z.string().url().describe('Public API endpoint'),
    admin: z.string().url().optional().describe('Admin console'),
    grpc: z.string().optional().describe('gRPC endpoint for inter-hub communication'),
  }),
  
  /**
   * Replication configuration
   */
  replication: z.object({
    /**
     * Source hub for replication (if this is a secondary)
     */
    primaryHubId: z.string().uuid().optional(),
    
    /**
     * Replication lag tolerance in seconds
     */
    lagTolerance: z.number().int().positive().default(5),
    
    /**
     * Replication mode
     */
    mode: z.enum(['sync', 'async', 'semi-sync']).default('async'),
  }).optional(),
  
  /**
   * Health status
   */
  health: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    lastCheck: z.string().datetime(),
    uptime: z.number().describe('Seconds'),
  }).optional(),
  
  /**
   * Version
   */
  version: z.string(),
  
  /**
   * Metadata
   */
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type HubInstance = z.infer<typeof HubInstanceSchema>;

// ============================================================================
// Federation Topology
// ============================================================================

/**
 * Federation Topology
 * Defines the global hub network architecture
 */
export const FederationTopologySchema = z.object({
  /**
   * Federation identifier
   */
  id: z.string().uuid(),
  
  /**
   * Federation name
   */
  name: z.string(),
  
  /**
   * Regions in this federation
   */
  regions: z.array(RegionSchema),
  
  /**
   * Hub instances
   */
  hubs: z.array(HubInstanceSchema),
  
  /**
   * Routing strategy
   */
  routing: z.object({
    /**
     * How to route tenant requests
     */
    strategy: z.enum([
      'geo-proximity',     // Route to nearest region
      'data-residency',    // Route based on tenant data location
      'least-loaded',      // Route to least busy hub
      'custom',            // Custom routing logic
    ]).default('geo-proximity'),
    
    /**
     * Failover behavior
     */
    failover: z.object({
      enabled: z.boolean().default(true),
      maxRetries: z.number().int().min(0).default(3),
      timeout: z.number().int().positive().default(5000).describe('Milliseconds'),
    }),
  }),
  
  /**
   * Data synchronization settings
   */
  synchronization: z.object({
    /**
     * What data to sync across regions
     */
    scope: z.object({
      /**
       * Sync plugin registry
       */
      plugins: z.boolean().default(true),
      
      /**
       * Sync tenant metadata (not data)
       */
      tenants: z.boolean().default(true),
      
      /**
       * Sync spaces metadata
       */
      spaces: z.boolean().default(false),
      
      /**
       * Sync licenses
       */
      licenses: z.boolean().default(true),
    }),
    
    /**
     * Sync frequency
     */
    frequency: z.enum(['realtime', 'hourly', 'daily']).default('realtime'),
    
    /**
     * Conflict resolution
     */
    conflictResolution: z.enum(['last-write-wins', 'primary-wins', 'manual']).default('last-write-wins'),
  }),
});

export type FederationTopology = z.infer<typeof FederationTopologySchema>;

// ============================================================================
// Tenant Placement
// ============================================================================

/**
 * Tenant Placement Policy
 * Determines where a tenant's data and runtime reside
 */
export const TenantPlacementPolicySchema = z.object({
  /**
   * Tenant identifier
   */
  tenantId: z.string(),
  
  /**
   * Primary region (where tenant data lives)
   */
  primaryRegion: z.string(),
  
  /**
   * Replica regions (for disaster recovery)
   */
  replicaRegions: z.array(z.string()).default([]),
  
  /**
   * Data residency constraints
   */
  dataResidency: z.object({
    /**
     * Allowed regions for data storage
     */
    allowedRegions: z.array(z.string()).optional(),
    
    /**
     * Prohibited regions
     */
    prohibitedRegions: z.array(z.string()).default([]),
    
    /**
     * Continent restriction
     */
    continent: z.enum(['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN']).optional(),
  }).optional(),
  
  /**
   * Failover policy
   */
  failover: z.object({
    /**
     * Enable automatic failover
     */
    enabled: z.boolean().default(true),
    
    /**
     * Preferred failover order (region IDs)
     */
    preferredOrder: z.array(z.string()).default([]),
    
    /**
     * Maximum acceptable latency for failover target (ms)
     */
    maxLatency: z.number().int().positive().default(100),
  }).optional(),
  
  /**
   * Latency requirements
   */
  latency: z.object({
    /**
     * Maximum acceptable latency for primary region (ms)
     */
    maxPrimaryLatency: z.number().int().positive().default(50),
    
    /**
     * Maximum acceptable latency for replicas (ms)
     */
    maxReplicaLatency: z.number().int().positive().default(200),
  }).optional(),
});

export type TenantPlacementPolicy = z.infer<typeof TenantPlacementPolicySchema>;

// ============================================================================
// Cross-Region Operations
// ============================================================================

/**
 * Cross-Region Replication Job
 */
export const ReplicationJobSchema = z.object({
  /**
   * Job identifier
   */
  id: z.string().uuid(),
  
  /**
   * Job type
   */
  type: z.enum([
    'initial-sync',      // First-time full sync
    'incremental',       // Delta sync
    'conflict-resolution', // Resolve conflicts
  ]),
  
  /**
   * Source hub
   */
  sourceHubId: z.string().uuid(),
  
  /**
   * Target hub(s)
   */
  targetHubIds: z.array(z.string().uuid()),
  
  /**
   * Resource scope
   */
  scope: z.object({
    /**
     * Resource type
     */
    resourceType: z.enum(['plugin', 'tenant', 'space', 'license', 'all']),
    
    /**
     * Specific resource IDs (empty = all)
     */
    resourceIds: z.array(z.string()).default([]),
  }),
  
  /**
   * Job status
   */
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  /**
   * Progress
   */
  progress: z.object({
    total: z.number().int().min(0),
    completed: z.number().int().min(0),
    failed: z.number().int().min(0),
  }).optional(),
  
  /**
   * Timestamps
   */
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  
  /**
   * Errors
   */
  errors: z.array(z.object({
    timestamp: z.string().datetime(),
    resourceId: z.string(),
    error: z.string(),
  })).default([]),
});

export type ReplicationJob = z.infer<typeof ReplicationJobSchema>;

/**
 * Global Registry Entry
 * Tracks where a resource exists across regions
 */
export const GlobalRegistryEntrySchema = z.object({
  /**
   * Resource identifier
   */
  resourceId: z.string(),
  
  /**
   * Resource type
   */
  resourceType: z.enum(['plugin', 'tenant', 'space', 'license']),
  
  /**
   * Regions where this resource exists
   */
  locations: z.array(z.object({
    regionId: z.string(),
    hubId: z.string().uuid(),
    isPrimary: z.boolean().default(false),
    lastSyncedAt: z.string().datetime().optional(),
    version: z.string().optional(),
  })),
  
  /**
   * Global version vector clock (for conflict detection)
   */
  versionVector: z.record(z.string(), z.number().int()).optional(),
});

export type GlobalRegistryEntry = z.infer<typeof GlobalRegistryEntrySchema>;

// ============================================================================
// Edge Computing
// ============================================================================

/**
 * Edge Location
 * Represents a CDN/edge cache location
 */
export const EdgeLocationSchema = z.object({
  /**
   * Location identifier
   */
  id: z.string(),
  
  /**
   * Parent region
   */
  regionId: z.string(),
  
  /**
   * Location details
   */
  location: RegionSchema.shape.location,
  
  /**
   * Caching configuration
   */
  cache: z.object({
    /**
     * What to cache at edge
     */
    resources: z.array(z.enum(['plugins', 'static-assets', 'api-responses'])).default([]),
    
    /**
     * TTL in seconds
     */
    ttl: z.number().int().positive().default(3600),
    
    /**
     * Cache size limit (bytes)
     */
    maxSize: z.number().int().positive().optional(),
  }),
  
  /**
   * Status
   */
  status: z.enum(['active', 'inactive']).default('active'),
});

export type EdgeLocation = z.infer<typeof EdgeLocationSchema>;

// ============================================================================
// Export All
// ============================================================================

export const HubFederationProtocol = {
  Region: RegionSchema,
  HubInstance: HubInstanceSchema,
  FederationTopology: FederationTopologySchema,
  TenantPlacementPolicy: TenantPlacementPolicySchema,
  ReplicationJob: ReplicationJobSchema,
  GlobalRegistryEntry: GlobalRegistryEntrySchema,
  EdgeLocation: EdgeLocationSchema,
} as const;
