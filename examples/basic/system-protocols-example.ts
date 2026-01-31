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
  name: 'daily_sales_report',
  label: 'Daily Sales Report Generation',
  description: 'Generate and email daily sales reports to managers',
  
  // Job type
  type: 'scheduled',
  
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
  
  // Job parameters
  parameters: {
    reportType: 'sales_summary',
    recipientGroup: 'sales_managers',
    format: 'pdf',
  },
  
  // Execution settings
  execution: {
    timeout: 300000, // 5 minutes
    retries: 3,
    retryDelay: 60000, // 1 minute
    retryBackoff: 'exponential',
    
    // Concurrency control
    maxConcurrency: 1, // Don't run multiple instances
    queueIfRunning: false,
  },
  
  // Monitoring
  monitoring: {
    alertOnFailure: true,
    alertChannels: ['email', 'slack'],
    sla: {
      maxDuration: 600000, // 10 minutes
      alertOnBreach: true,
    },
  },
  
  // Logging
  logging: {
    level: 'info',
    includeParameters: true,
    retentionDays: 90,
  },
};

// Event-triggered job
export const onAccountCreatedJob: Job = {
  name: 'welcome_email_job',
  label: 'Send Welcome Email',
  description: 'Send welcome email when new account is created',
  
  type: 'event_triggered',
  
  // Trigger configuration
  trigger: {
    event: 'object.created',
    object: 'account',
    
    // Conditional execution
    condition: {
      field: 'status',
      operator: 'equals',
      value: 'active',
    },
  },
  
  handler: async () => {
    // Implementation: Send welcome email to new user
    console.log('Sending welcome email...');
  },
  
  execution: {
    timeout: 30000,
    retries: 2,
    
    // Debouncing to avoid duplicate jobs
    debounce: 5000, // 5 seconds
  },
};

// Recurring batch job
export const dataCleanupJob: Job = {
  name: 'cleanup_old_records',
  label: 'Data Cleanup Job',
  description: 'Archive and delete old records to maintain database performance',
  
  type: 'scheduled',
  
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
  
  execution: {
    timeout: 3600000, // 1 hour
    retries: 1,
  },
  
  monitoring: {
    metrics: {
      recordsProcessed: true,
      recordsArchived: true,
      duration: true,
    },
  },
};

/**
 * Example 2: Metrics & Monitoring
 * 
 * Configure application metrics, performance monitoring, and observability.
 */

export const metricsConfig: MetricsConfig = {
  // Enable metrics collection
  enabled: true,
  
  // Metrics backend
  backend: {
    type: 'prometheus',
    
    // Prometheus configuration
    prometheus: {
      // Expose metrics endpoint
      endpoint: '/metrics',
      port: 9090,
      
      // Default labels added to all metrics
      defaultLabels: {
        service: 'objectstack',
        environment: 'production',
        region: 'us-east-1',
      },
      
      // Pushgateway for batch jobs
      pushgateway: {
        enabled: true,
        url: 'http://pushgateway.example.com:9091',
        interval: 10000, // 10 seconds
      },
    },
  },
  
  // Metrics to collect
  metrics: [
    // Request metrics
    {
      name: 'http_requests_total',
      type: 'counter',
      description: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    },
    {
      name: 'http_request_duration_seconds',
      type: 'histogram',
      description: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    },
    
    // Database metrics
    {
      name: 'db_query_duration_seconds',
      type: 'histogram',
      description: 'Database query duration',
      labelNames: ['object', 'operation'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1],
    },
    {
      name: 'db_connection_pool_size',
      type: 'gauge',
      description: 'Database connection pool size',
      labelNames: ['database'],
    },
    
    // Business metrics
    {
      name: 'records_created_total',
      type: 'counter',
      description: 'Total records created',
      labelNames: ['object_type'],
    },
    {
      name: 'active_users',
      type: 'gauge',
      description: 'Number of active users',
    },
    
    // Job metrics
    {
      name: 'job_execution_duration_seconds',
      type: 'histogram',
      enabled: true,
      description: 'Job execution duration',
      labelNames: ['job_name', 'status'],
      histogram: {
        buckets: [1, 5, 10, 30, 60, 300, 600],
      },
    },
    {
      name: 'job_failures_total',
      type: 'counter',
      enabled: true,
      description: 'Total job failures',
      labelNames: ['job_name', 'error_type'],
    },
  ],
  
  // Collection interval
  collectInterval: 15000, // 15 seconds
  
  // Metric cardinality limits (prevent metric explosion)
  cardinality: {
    maxLabels: 10,
    maxLabelValueLength: 100,
  },
};

// Alternative: StatsD backend
export const statsdMetricsConfig: MetricsConfig = {
  enabled: true,
  
  backend: {
    type: 'statsd',
    
    statsd: {
      host: 'statsd.example.com',
      port: 8125,
      protocol: 'udp',
      prefix: 'objectstack.',
      
      // Sampling for high-volume metrics
      sampleRate: 0.1, // 10% sampling
    },
  },
  
  metrics: [
    {
      name: 'api_request',
      type: 'counter',
      enabled: true,
      labelNames: [],
    },
    {
      name: 'api_latency',
      type: 'histogram',
      enabled: true,
      labelNames: [],
      histogram: {
        buckets: [0.1, 0.5, 1, 2, 5, 10],
      },
    },
  ],
};

/**
 * Example 3: Distributed Tracing
 * 
 * Configure distributed tracing for request flow visualization
 * and performance debugging across microservices.
 */

export const tracingConfig: TracingConfig = {
  // Enable tracing
  enabled: true,
  
  // Tracing backend
  backend: {
    type: 'opentelemetry',
    
    // OpenTelemetry configuration
    opentelemetry: {
      // OTLP exporter
      exporter: {
        type: 'otlp',
        endpoint: 'http://otel-collector.example.com:4318',
        protocol: 'http',
        
        // Headers for authentication
        headers: {
          'x-api-key': '${env:OTEL_API_KEY}',
        },
      },
      
      // Service information
      service: {
        name: 'objectstack-api',
        version: '1.0.0',
        namespace: 'production',
      },
      
      // Resource attributes
      resource: {
        'deployment.environment': 'production',
        'cloud.provider': 'aws',
        'cloud.region': 'us-east-1',
        'k8s.cluster.name': 'prod-cluster',
      },
    },
  },
  
  // Sampling strategy
  sampling: {
    type: 'probability',
    ratio: 0.1, // Sample 10% of traces
    
    // Always sample specific patterns
    rules: [
      { name: 'admin_paths', decision: 'record_and_sample', match: { path: '/api/admin/*' } },
      { name: 'errors', decision: 'record_and_sample', match: { statusCode: { gte: 500 } } },
      { name: 'slow_requests', decision: 'record_and_sample', match: { duration: { gte: 1000 } } },
    ],
    
    // Never sample specific patterns
    neverSample: [
      { path: '/health' },
      { path: '/metrics' },
    ],
  },
  
  // Instrumentation
  instrumentation: {
    // HTTP instrumentation
    http: {
      enabled: true,
      captureHeaders: true,
      captureRequestBody: false, // For security
      captureResponseBody: false,
    },
    
    // Database instrumentation
    database: {
      enabled: true,
      captureStatements: true,
      captureParameters: false, // For security
      maxStatementLength: 1000,
    },
    
    // External calls
    external: {
      enabled: true,
      capturePayload: false,
    },
  },
  
  // Span limits
  limits: {
    maxAttributes: 128,
    maxEvents: 128,
    maxLinks: 128,
    maxAttributeLength: 1024,
  },
  
  // Context propagation
  propagation: {
    // W3C Trace Context
    format: 'w3c',
    
    // Baggage for cross-service context
    baggage: {
      enabled: true,
      maxSize: 1024,
    },
  },
};

// Alternative: Jaeger backend
export const jaegerTracingConfig: TracingConfig = {
  enabled: true,
  
  backend: {
    type: 'jaeger',
    
    jaeger: {
      agentHost: 'jaeger-agent.example.com',
      agentPort: 6831,
      
      // Or use collector directly
      collectorEndpoint: 'http://jaeger-collector.example.com:14268/api/traces',
      
      service: 'objectstack-api',
    },
  },
  
  sampling: {
    type: 'rate_limiting',
    ratio: 0.1,
    rules: [],
  },
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
  // Enable audit logging
  enabled: true,
  
  // Audit events to capture
  events: [
    // Authentication events
    'user.login',
    'user.logout',
    'user.login.failed',
    'user.password.changed',
    
    // Authorization events
    'permission.granted',
    'permission.denied',
    'role.assigned',
    'role.removed',
    
    // Data events
    'record.created',
    'record.updated',
    'record.deleted',
    'record.viewed', // For sensitive data
    
    // Admin events
    'schema.modified',
    'plugin.installed',
    'plugin.uninstalled',
    'settings.changed',
    
    // Export/Import
    'data.exported',
    'data.imported',
  ],
  
  // Objects to audit (can be selective)
  objects: [
    {
      name: 'account',
      events: ['created', 'updated', 'deleted'],
      
      // Track field-level changes
      trackFields: ['name', 'owner_id', 'annual_revenue'],
    },
    {
      name: 'user',
      events: ['created', 'updated', 'deleted', 'viewed'],
      
      // Audit all field changes
      trackFields: '*',
      
      // Additional metadata
      captureMetadata: {
        ipAddress: true,
        userAgent: true,
        geolocation: true,
      },
    },
  ],
  
  // Audit log configuration
  auditLog: {
    enabled: true,
    events: ['create', 'read', 'update', 'delete', 'export', 'permission-change', 'login', 'logout', 'failed-login'],
    retentionDays: 2555,
    immutable: true,
    signLogs: true,
  },
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
