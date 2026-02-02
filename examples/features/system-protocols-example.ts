/**
 * Example: System Protocols - Job Scheduling, Metrics, Tracing, Cache
 * 
 * This example demonstrates advanced system protocols for production
 * enterprise applications:
 * - Job Scheduling (Background tasks, Cron jobs)
 * - Metrics & Monitoring (Prometheus, StatsD)
 * - Distributed Tracing (OpenTelemetry, Jaeger)
 * - Caching (Redis, In-Memory)
 * - Audit Logging
 * - Compliance & Encryption
 * 
 * Protocols covered:
 * - Job Scheduling Protocol
 * - Metrics Protocol
 * - Tracing Protocol
 * - Cache Protocol
 * - Audit Protocol
 * - Compliance Protocol
 * - Encryption Protocol
 */

import {
  Job,
  JobSchedule,
  MetricsConfig,
  TracingConfig,
  CacheConfig,
  AuditConfig,
  ComplianceConfig,
  EncryptionConfig,
} from '@objectstack/spec/system';

/**
 * Example 1: Job Scheduling
 * 
 * Define background jobs, scheduled tasks, and asynchronous workflows.
 */

// Cron-based scheduled job
export const dailyReportJob: Job = {
  id: 'daily_sales_report_001',
  name: 'daily_sales_report',
  
  // Cron schedule (every day at 8:00 AM)
  schedule: {
    type: 'cron',
    expression: '0 8 * * *',
    timezone: 'America/New_York',
  },
  
  // Job handler
  handler: async () => {
    // Implementation: Generate and send daily sales report
    console.log('Generating daily sales report...');
  },
  
  // Retry policy
  retryPolicy: {
    maxRetries: 3,
    backoffMs: 60000, // 1 minute
    backoffMultiplier: 2,
  },
  
  // Timeout
  timeout: 300000, // 5 minutes
  
  enabled: true,
};

// Event-triggered job
export const onAccountCreatedJob: Job = {
  id: 'welcome_email_job_001',
  name: 'welcome_email_job',
  
  // Immediate execution when triggered
  schedule: {
    type: 'once',
    at: new Date(Date.now() + 1000).toISOString(),
  },
  
  handler: async () => {
    // Implementation: Send welcome email to new user
    console.log('Sending welcome email...');
  },
  
  timeout: 30000,
  
  retryPolicy: {
    maxRetries: 2,
    backoffMs: 1000,
    backoffMultiplier: 2,
  },
  
  enabled: true,
};

// Recurring batch job
export const dataCleanupJob: Job = {
  id: 'cleanup_old_records_001',
  name: 'cleanup_old_records',
  
  // Run weekly on Sunday at 2:00 AM
  schedule: {
    type: 'cron',
    expression: '0 2 * * 0',
    timezone: 'UTC',
  },
  
  handler: async () => {
    // Implementation: Archive closed cases
    console.log('Archiving closed cases...');
  },
  
  timeout: 3600000, // 1 hour
  
  retryPolicy: {
    maxRetries: 1,
    backoffMs: 1000,
    backoffMultiplier: 2,
  },
  
  enabled: true,
};

/**
 * Example 2: Metrics & Monitoring
 * 
 * Configure application metrics, performance monitoring, and observability.
 */

export const metricsConfig: MetricsConfig = {
  name: 'app_metrics',
  label: 'Application Metrics',
  
  // Enable metrics collection
  enabled: true,
  
  // Default labels added to all metrics
  defaultLabels: {
    service: 'objectstack',
    environment: 'production',
    region: 'us-east-1',
  },
  
  // Metrics to collect
  metrics: [
    // Request metrics
    {
      name: 'http_requests_total',
      type: 'counter',
      enabled: true,
      description: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    },
    {
      name: 'http_request_duration_seconds',
      type: 'histogram',
      enabled: true,
      description: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      histogram: {
        type: 'explicit',
        explicit: {
          boundaries: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
        },
      },
    },
    
    // Database metrics
    {
      name: 'db_query_duration_seconds',
      type: 'histogram',
      enabled: true,
      description: 'Database query duration',
      labelNames: ['object', 'operation'],
      histogram: {
        type: 'explicit',
        explicit: {
          boundaries: [0.001, 0.01, 0.1, 0.5, 1],
        },
      },
    },
    {
      name: 'db_connection_pool_size',
      type: 'gauge',
      enabled: true,
      description: 'Database connection pool size',
      labelNames: ['database'],
    },
    
    // Business metrics
    {
      name: 'records_created_total',
      type: 'counter',
      enabled: true,
      description: 'Total records created',
      labelNames: ['object_type'],
    },
    {
      name: 'active_users',
      type: 'gauge',
      enabled: true,
      description: 'Number of active users',
      labelNames: [],
    },
  ],
  
  // Aggregations
  aggregations: [],
  
  // SLIs
  slis: [],
  
  // SLOs
  slos: [],
  
  // Exports
  exports: [],
  
  // Collection interval
  collectionInterval: 15, // seconds
};

/**
 * Example 3: Distributed Tracing
 * 
 * Configure distributed tracing for request flow visualization
 * and performance debugging across microservices.
 */

export const tracingConfig: TracingConfig = {
  name: 'app_tracing',
  label: 'Application Tracing',
  
  // Enable tracing
  enabled: true,
  
  // Sampling strategy
  sampling: {
    type: 'probability',
    ratio: 0.1, // Sample 10% of traces
    rules: [],
  },
  
  // Context propagation
  propagation: {
    formats: ['w3c'],
    extract: true,
    inject: true,
  },
  
  // Trace ID generator
  traceIdGenerator: 'random',
};

/**
 * Example 4: Cache Configuration
 * 
 * Configure multi-level caching for performance optimization.
 */

export const cacheConfig: CacheConfig = {
  // Enable caching
  enabled: true,
  
  // Cache tiers
  tiers: [
    // L1: In-memory cache (fastest)
    {
      name: 'memory',
      type: 'memory',
      ttl: 300,
      warmup: false,
      strategy: 'lru',
      maxSize: 10000,
    },
  ],
  
  // Encryption
  encryption: false,
  
  // Compression
  compression: false,
  
  // Invalidation
  invalidation: [],
  
  // Prefetch
  prefetch: false,
};
/* Removed detailed cache configuration due to schema complexity */
const cacheConfigRemoved = {
  // Default TTL
  defaultTTL: 300, // 5 minutes
  
  // Cache stores
  stores: [
    // L1: In-memory cache (fastest)
    {
      name: 'memory',
      type: 'memory',
      priority: 1,
      
      config: {
        maxSize: 100 * 1024 * 1024, // 100MB
        maxEntries: 10000,
        
        // Eviction policy
        evictionPolicy: 'lru', // Least Recently Used
      },
      
      // Cache specific patterns in memory
      patterns: [
        'object:*:schema',
        'user:*:permissions',
      ],
    },
    
    // L2: Redis cache (distributed)
    {
      name: 'redis',
      type: 'redis',
      priority: 2,
      
      config: {
        host: 'redis.example.com',
        port: 6379,
        db: 1,
        
        auth: {
          password: '${env:REDIS_PASSWORD}',
        },
        
        // Key prefix
        keyPrefix: 'cache:',
        
        // Connection pool
        pool: {
          min: 2,
          max: 10,
        },
      },
      
      // Cache everything in Redis
      patterns: ['*'],
    },
  ],
  
  // Cache strategies per object type
  strategies: {
    // Object schema caching (rarely changes)
    'object:schema': {
      ttl: 3600, // 1 hour
      stores: ['memory', 'redis'],
      
      // Invalidation rules
      invalidateOn: ['object.schema.updated'],
    },
    
    // User permissions (changes occasionally)
    'user:permissions': {
      ttl: 300, // 5 minutes
      stores: ['memory', 'redis'],
      invalidateOn: ['user.permissions.updated', 'role.updated'],
    },
    
    // Query results (short-lived)
    'query:result': {
      ttl: 60, // 1 minute
      stores: ['memory'],
      
      // Cache key includes query hash
      keyGenerator: (params: any) => {
        const hash = hashQuery(params.query);
        return `query:${params.object}:${hash}`;
      },
    },
    
    // API responses
    'api:response': {
      ttl: 120, // 2 minutes
      stores: ['redis'],
      
      // Vary by user
      varyBy: ['userId'],
      
      // Conditional caching
      condition: (response: any) => {
        return response.statusCode === 200;
      },
    },
  },
  
  // Cache warming (pre-populate cache)
  warming: {
    enabled: true,
    
    // Warm up strategies
    strategies: [
      {
        name: 'warm_object_schemas',
        pattern: 'object:*:schema',
        schedule: '0 */6 * * *', // Every 6 hours
      },
    ],
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    metrics: ['hit_rate', 'miss_rate', 'evictions', 'memory_usage'],
  },
};

/**
 * Example 5: Audit Logging
 * 
 * Configure comprehensive audit trails for compliance and security.
 */

export const auditConfig: AuditConfig = {
  name: 'main_audit',
  label: 'Main Audit Configuration',
  
  // Enable audit logging
  enabled: true,
  
  // Minimum severity
  minimumSeverity: 'info',
  
  // Storage configuration
  storage: {
    type: 'database',
    bufferEnabled: false,
    bufferSize: 1000,
    flushIntervalSeconds: 60,
    compression: true,
  },
  
  // Retention policy
  retentionPolicy: {
    retentionDays: 180,
    archiveAfterRetention: true,
  },
  
  // Suspicious activity rules
  suspiciousActivityRules: [],
  
  // Include sensitive data
  includeSensitiveData: false,
  
  // Redact fields
  redactFields: [
    'password',
    'passwordHash',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
  ],
  
  // Log reads
  logReads: false,
  
  // Read sampling rate
  readSamplingRate: 0.1,
  
  // Log system events
  logSystemEvents: true,
  
  // Event types to audit
  eventTypes: [
    // Authentication events
    'auth.login',
    'auth.logout',
    'auth.login_failed',
    'auth.password_changed',
    
    // Authorization events
    'authz.permission_granted',
    'authz.permission_revoked',
    'authz.role_assigned',
    'authz.role_removed',
    
    // Data events
    'data.create',
    'data.update',
    'data.delete',
  ],
};
/* Removed audit storage configuration due to schema mismatch */
const auditConfigRemoved = {
  // Audit storage
  storage: {
    // Primary storage
    primary: {
      type: 'database',
      table: 'audit_logs',
      
      // Partition by date for performance
      partitioning: {
        enabled: true,
        strategy: 'monthly',
      },
    },
    
    // Secondary storage for compliance
    secondary: {
      type: 'object_storage',
      connector: 'aws_s3_documents',
      path: 'audit-logs/{year}/{month}/{day}/',
      
      // Encrypt audit logs
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
      },
      
      // Compress for storage efficiency
      compression: 'gzip',
    },
  },
  
  // Retention policy
  retention: {
    // Keep in database for 90 days
    database: 90,
    
    // Keep in object storage for 7 years (compliance)
    objectStorage: 2555, // ~7 years
    
    // Automatic archival
    archival: {
      enabled: true,
      schedule: '0 0 * * *', // Daily
    },
  },
  
  // Tamper protection
  integrity: {
    // Hash each audit entry
    hashing: {
      enabled: true,
      algorithm: 'SHA-256',
    },
    
    // Chain audit entries
    chaining: {
      enabled: true,
      includeTimestamp: true,
    },
  },
  
  // Alerting for suspicious activity
  alerting: {
    enabled: true,
    
    rules: [
      {
        name: 'multiple_failed_logins',
        condition: {
          event: 'user.login.failed',
          threshold: 5,
          window: 300, // 5 minutes
        },
        actions: ['email', 'slack'],
      },
      {
        name: 'bulk_data_export',
        condition: {
          event: 'data.exported',
          recordCount: { gte: 10000 },
        },
        actions: ['email', 'pagerduty'],
      },
    ],
  },
};

/**
 * Example 6: Compliance Configuration
 * 
 * Configure compliance controls for GDPR, HIPAA, SOC 2, etc.
 */

export const complianceConfig: ComplianceConfig = {
  // Audit log configuration
  auditLog: {
    enabled: true,
    events: ['create', 'read', 'update', 'delete', 'export', 'permission-change', 'login', 'logout', 'failed-login'],
    retentionDays: 2555,
    immutable: true,
    signLogs: true,
  },
};
/* Removed frameworks and other detailed configuration due to schema mismatch */
const complianceConfigRemoved = {
  // Compliance frameworks
  frameworks: ['gdpr', 'hipaa', 'soc2'],
  
  // Data classification
  dataClassification: {
    enabled: true,
    
    // Classification levels
    levels: [
      {
        level: 'public',
        description: 'Publicly available information',
        controls: [],
      },
      {
        level: 'internal',
        description: 'Internal business information',
        controls: ['access_control'],
      },
      {
        level: 'confidential',
        description: 'Sensitive business information',
        controls: ['access_control', 'encryption_at_rest', 'audit_logging'],
      },
      {
        level: 'restricted',
        description: 'Highly sensitive (PII, PHI, financial)',
        controls: [
          'access_control',
          'encryption_at_rest',
          'encryption_in_transit',
          'audit_logging',
          'data_masking',
          'mfa_required',
        ],
      },
    ],
    
    // Automatic classification based on field types
    autoClassify: {
      email: 'confidential',
      ssn: 'restricted',
      credit_card: 'restricted',
      medical_record: 'restricted',
      phone: 'confidential',
    },
  },
  
  // Data residency
  dataResidency: {
    enabled: true,
    
    // Regional data storage requirements
    regions: [
      {
        name: 'EU',
        countries: ['FR', 'DE', 'ES', 'IT', 'NL'],
        storage: {
          connector: 'eu_database',
          location: 'eu-west-1',
        },
        restrictions: {
          allowCrossBorderTransfer: false,
          requireDataProcessingAgreement: true,
        },
      },
    ],
  },
  
  // Right to be forgotten (GDPR)
  dataErasure: {
    enabled: true,
    
    // Retention periods
    retentionPeriods: {
      'user': 365, // 1 year after account closure
      'case': 2555, // 7 years (legal requirement)
    },
    
    // Anonymization strategy
    anonymization: {
      strategy: 'pseudonymization',
      fields: {
        email: (value: any) => `user-${hash(value)}@anonymized.com`,
        name: () => '[Redacted]',
        ssn: () => '***-**-****',
      },
    },
  },
  
  // Consent management
  consent: {
    enabled: true,
    
    purposes: [
      {
        id: 'marketing',
        name: 'Marketing Communications',
        required: false,
        
      },
      {
        id: 'analytics',
        name: 'Analytics and Performance',
        required: false,
      },
      {
        id: 'essential',
        name: 'Essential Service Operation',
        required: true,
      },
    ],
    
    // Consent tracking
    tracking: {
      logAllChanges: true,
      requireExplicitConsent: true,
    },
  },
};

/**
 * Example 7: Encryption Configuration
 * 
 * Configure encryption for data at rest and in transit.
 */

export const encryptionConfig: EncryptionConfig = {
  // Enable encryption
  enabled: true,
  
  // Encryption algorithm
  algorithm: 'aes-256-gcm',
  
  // Key management
  keyManagement: {
    provider: 'local',
  },
  
  // Scope
  scope: 'database',
  
  // Deterministic encryption
  deterministicEncryption: false,
  
  // Searchable encryption
  searchableEncryption: false,
};
/* Removed detailed encryption configuration due to schema complexity */
const encryptionConfigRemoved = {
  // Encryption at rest
  atRest: {
    enabled: true,
    
    // Encryption algorithm
    algorithm: 'AES-256-GCM',
    
    // Key management
    keyManagement: {
      type: 'aws_kms',
      
      kms: {
        region: 'us-east-1',
        keyId: 'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
        
        // Key rotation
        rotation: {
          enabled: true,
          intervalDays: 90,
        },
      },
    },
    
    // Field-level encryption
    fields: [
      {
        object: 'user',
        field: 'ssn',
        algorithm: 'AES-256-GCM',
      },
      {
        object: 'payment',
        field: 'credit_card_number',
        algorithm: 'AES-256-GCM',
        tokenize: true, // Store token instead of encrypted value
      },
    ],
  },
  
  // Encryption in transit
  inTransit: {
    enabled: true,
    
    // TLS configuration
    tls: {
      minVersion: '1.3',
      cipherSuites: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
      ],
      
      // Certificate configuration
      certificate: {
        path: '${file:./certs/server.crt}',
        keyPath: '${file:./certs/server.key}',
        caPath: '${file:./certs/ca.crt}',
      },
      
      // Client certificate verification
      clientCertificates: {
        enabled: true,
        required: false,
      },
    },
    
    // HTTPS enforcement
    enforceHTTPS: true,
    
    // HSTS (HTTP Strict Transport Security)
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },
};

/**
 * Helper Functions
 */

function hashQuery(query: any): string {
  // In production, use a proper hash function
  return JSON.stringify(query);
}

function hash(value: string): string {
  // In production, use crypto.createHash
  return value.split('').reverse().join('');
}

// Uncomment to see example configurations
// console.log('Daily Report Job:', dailyReportJob);
// console.log('Metrics Config:', metricsConfig);
// console.log('Tracing Config:', tracingConfig);
// console.log('Cache Config:', cacheConfig);
// console.log('Audit Config:', auditConfig);
// console.log('Compliance Config:', complianceConfig);
// console.log('Encryption Config:', encryptionConfig);
