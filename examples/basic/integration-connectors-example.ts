/**
 * Example: Integration Connectors
 * 
 * This example demonstrates how to configure external system connectors
 * for databases, file storage, message queues, and SaaS platforms.
 * 
 * Protocols covered:
 * - Integration Connector Protocol
 * - Database Connector (Postgres, MySQL, MongoDB)
 * - File Storage Connector (S3, Azure Blob, Local)
 * - Message Queue Connector (RabbitMQ, Kafka, Redis)
 * - SaaS Connector (Salesforce, HubSpot, etc.)
 */

import {
  Connector,
  DatabaseConnector,
  FileStorageConnector,
  MessageQueueConnector,
  SaaSConnector,
} from '@objectstack/spec/integration';

/**
 * Example 1: Database Connectors
 * 
 * Connect to external SQL and NoSQL databases for data synchronization,
 * federated queries, or ETL operations.
 */

// PostgreSQL Connector
export const postgresConnector: DatabaseConnector = {
  name: 'production_postgres',
  label: 'Production PostgreSQL Database',
  type: 'database',
  subtype: 'postgres',
  description: 'Main production database for legacy CRM system',
  
  // Connection configuration
  config: {
    host: 'db.production.example.com',
    port: 5432,
    database: 'crm_production',
    schema: 'public',
    
    // Authentication
    auth: {
      type: 'password',
      username: '${env:POSTGRES_USER}',
      password: '${env:POSTGRES_PASSWORD}',
    },
    
    // Connection pool settings
    pool: {
      min: 2,
      max: 10,
      idleTimeout: 30000,
    },
    
    // SSL configuration
    ssl: {
      enabled: true,
      rejectUnauthorized: true,
      ca: '${file:./certs/ca.pem}',
    },
  },
  
  // Query capabilities
  capabilities: {
    supportsTransactions: true,
    supportsJoins: true,
    supportsCTE: true,
    supportsWindowFunctions: true,
    maxQueryComplexity: 1000,
  },
  
  // Schema discovery
  schemaSync: {
    enabled: true,
    schedule: '0 */6 * * *', // Every 6 hours
    autoDiscoverTables: true,
    tableFilter: {
      include: ['accounts', 'contacts', 'opportunities'],
      exclude: ['_internal_*', 'temp_*'],
    },
  },
};

// MongoDB Connector
export const mongoConnector: DatabaseConnector = {
  name: 'analytics_mongo',
  label: 'Analytics MongoDB',
  type: 'database',
  subtype: 'mongodb',
  description: 'MongoDB cluster for analytics and reporting',
  
  config: {
    uri: '${env:MONGODB_URI}',
    database: 'analytics',
    
    // Replica set configuration
    replicaSet: 'rs0',
    readPreference: 'secondaryPreferred',
    
    // Authentication
    auth: {
      type: 'x509',
      certificate: '${file:./certs/mongodb-client.pem}',
    },
  },
  
  capabilities: {
    supportsAggregation: true,
    supportsFullTextSearch: true,
    supportsGeoQueries: true,
  },
};

/**
 * Example 2: File Storage Connectors
 * 
 * Connect to cloud storage providers for file uploads, document management,
 * and media asset storage.
 */

// AWS S3 Connector
export const s3Connector: FileStorageConnector = {
  name: 'aws_s3_documents',
  label: 'AWS S3 Document Storage',
  type: 'file_storage',
  subtype: 's3',
  description: 'S3 bucket for customer documents and attachments',
  
  config: {
    region: 'us-east-1',
    bucket: 'my-company-documents',
    
    // IAM authentication
    auth: {
      type: 'iam',
      accessKeyId: '${env:AWS_ACCESS_KEY_ID}',
      secretAccessKey: '${env:AWS_SECRET_ACCESS_KEY}',
    },
    
    // Optional: assume role for cross-account access
    assumeRole: {
      roleArn: 'arn:aws:iam::123456789012:role/DocumentAccess',
      sessionName: 'objectstack-session',
    },
    
    // Upload settings
    uploadOptions: {
      serverSideEncryption: 'AES256',
      storageClass: 'STANDARD_IA',
      acl: 'private',
    },
    
    // Presigned URL configuration
    presignedUrlExpiry: 3600, // 1 hour
  },
  
  capabilities: {
    supportsVersioning: true,
    supportsMetadata: true,
    supportsLifecyclePolicies: true,
    supportsCORS: true,
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  
  // Path structure for organizing files
  pathTemplate: '/{object_type}/{record_id}/{year}/{month}/{filename}',
};

// Azure Blob Storage Connector
export const azureBlobConnector: FileStorageConnector = {
  name: 'azure_blob_media',
  label: 'Azure Blob Media Storage',
  type: 'file_storage',
  subtype: 'azure_blob',
  description: 'Azure Blob Storage for media assets',
  
  config: {
    accountName: 'mycompanystorage',
    containerName: 'media-assets',
    
    // Authentication
    auth: {
      type: 'connection_string',
      connectionString: '${env:AZURE_STORAGE_CONNECTION_STRING}',
    },
    
    // CDN configuration
    cdn: {
      enabled: true,
      endpoint: 'https://cdn.example.com',
    },
  },
  
  capabilities: {
    supportsVersioning: false,
    supportsMetadata: true,
    supportsCDN: true,
    maxFileSize: 4.77 * 1024 * 1024 * 1024, // ~4.77TB
  },
};

// Local File System Connector (for development)
export const localFileConnector: FileStorageConnector = {
  name: 'local_dev_storage',
  label: 'Local Development Storage',
  type: 'file_storage',
  subtype: 'local',
  description: 'Local file system for development',
  
  config: {
    basePath: './storage/uploads',
    
    // Create directories if they don't exist
    autoCreateDirectories: true,
    
    // Permissions for created files/directories
    fileMode: 0o644,
    directoryMode: 0o755,
  },
  
  capabilities: {
    supportsVersioning: false,
    supportsMetadata: false,
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
};

/**
 * Example 3: Message Queue Connectors
 * 
 * Connect to message brokers for event-driven architecture,
 * background job processing, and inter-service communication.
 */

// RabbitMQ Connector
export const rabbitmqConnector: MessageQueueConnector = {
  name: 'rabbitmq_events',
  label: 'RabbitMQ Event Bus',
  type: 'message_queue',
  subtype: 'rabbitmq',
  description: 'RabbitMQ for event-driven workflows',
  
  config: {
    host: 'rabbitmq.example.com',
    port: 5672,
    virtualHost: '/production',
    
    // Authentication
    auth: {
      type: 'password',
      username: '${env:RABBITMQ_USER}',
      password: '${env:RABBITMQ_PASSWORD}',
    },
    
    // Connection settings
    heartbeat: 60,
    connectionTimeout: 10000,
    
    // Default exchange and queue configuration
    exchanges: [
      {
        name: 'objectstack.events',
        type: 'topic',
        durable: true,
        autoDelete: false,
      },
    ],
    
    queues: [
      {
        name: 'workflow.execution',
        durable: true,
        exclusive: false,
        autoDelete: false,
        arguments: {
          'x-max-priority': 10,
          'x-message-ttl': 86400000, // 24 hours
        },
      },
    ],
  },
  
  capabilities: {
    supportsPriority: true,
    supportsDelayedMessages: true,
    supportsDLQ: true, // Dead Letter Queue
    maxMessageSize: 128 * 1024 * 1024, // 128MB
  },
};

// Apache Kafka Connector
export const kafkaConnector: MessageQueueConnector = {
  name: 'kafka_analytics',
  label: 'Kafka Analytics Stream',
  type: 'message_queue',
  subtype: 'kafka',
  description: 'Kafka for real-time analytics streaming',
  
  config: {
    brokers: [
      'kafka-1.example.com:9092',
      'kafka-2.example.com:9092',
      'kafka-3.example.com:9092',
    ],
    
    // SASL authentication
    auth: {
      type: 'sasl',
      mechanism: 'SCRAM-SHA-512',
      username: '${env:KAFKA_USER}',
      password: '${env:KAFKA_PASSWORD}',
    },
    
    // SSL/TLS
    ssl: {
      enabled: true,
      rejectUnauthorized: true,
    },
    
    // Producer configuration
    producer: {
      idempotent: true,
      maxInFlightRequests: 5,
      compression: 'gzip',
      batchSize: 16384,
      linger: 10, // ms
    },
    
    // Consumer configuration
    consumer: {
      groupId: 'objectstack-analytics',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      autoCommit: false,
    },
    
    // Topics
    topics: [
      {
        name: 'crm.events',
        partitions: 12,
        replicationFactor: 3,
      },
    ],
  },
  
  capabilities: {
    supportsTransactions: true,
    supportsPartitioning: true,
    supportsCompaction: true,
  },
};

// Redis Connector (for pub/sub and queues)
export const redisConnector: MessageQueueConnector = {
  name: 'redis_cache_queue',
  label: 'Redis Cache & Queue',
  type: 'message_queue',
  subtype: 'redis',
  description: 'Redis for caching and lightweight queuing',
  
  config: {
    host: 'redis.example.com',
    port: 6379,
    db: 0,
    
    // Authentication
    auth: {
      type: 'password',
      password: '${env:REDIS_PASSWORD}',
    },
    
    // Sentinel for high availability
    sentinels: [
      { host: 'sentinel-1.example.com', port: 26379 },
      { host: 'sentinel-2.example.com', port: 26379 },
      { host: 'sentinel-3.example.com', port: 26379 },
    ],
    masterName: 'mymaster',
    
    // Connection pool
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    
    // TLS
    tls: {
      enabled: true,
    },
  },
  
  capabilities: {
    supportsPubSub: true,
    supportsStreams: true,
    supportsTTL: true,
  },
};

/**
 * Example 4: SaaS Connectors
 * 
 * Connect to external SaaS platforms for data synchronization,
 * integration workflows, and unified customer views.
 */

// Salesforce Connector
export const salesforceConnector: SaaSConnector = {
  name: 'salesforce_sync',
  label: 'Salesforce CRM',
  type: 'saas',
  subtype: 'salesforce',
  description: 'Salesforce integration for bi-directional sync',
  
  config: {
    instanceUrl: 'https://mycompany.my.salesforce.com',
    apiVersion: '58.0',
    
    // OAuth 2.0 authentication
    auth: {
      type: 'oauth2',
      clientId: '${env:SALESFORCE_CLIENT_ID}',
      clientSecret: '${env:SALESFORCE_CLIENT_SECRET}',
      
      // JWT bearer flow for server-to-server
      grantType: 'jwt_bearer',
      privateKey: '${file:./certs/salesforce-private-key.pem}',
      username: 'integration@mycompany.com',
    },
    
    // Sync configuration
    sync: {
      enabled: true,
      direction: 'bidirectional',
      
      // Object mappings
      mappings: [
        {
          local: 'account',
          remote: 'Account',
          fields: {
            name: 'Name',
            industry: 'Industry',
            annual_revenue: 'AnnualRevenue',
          },
        },
        {
          local: 'contact',
          remote: 'Contact',
          fields: {
            first_name: 'FirstName',
            last_name: 'LastName',
            email: 'Email',
          },
        },
      ],
      
      // Conflict resolution
      conflictResolution: 'remote_wins', // or 'local_wins', 'manual'
      
      // Schedule
      schedule: '*/15 * * * *', // Every 15 minutes
    },
  },
  
  capabilities: {
    supportsRealtime: true, // via Platform Events
    supportsBulkAPI: true,
    supportsMetadataAPI: true,
    rateLimit: {
      requests: 15000,
      window: 86400, // per day
    },
  },
};

// HubSpot Connector
export const hubspotConnector: SaaSConnector = {
  name: 'hubspot_marketing',
  label: 'HubSpot Marketing',
  type: 'saas',
  subtype: 'hubspot',
  description: 'HubSpot for marketing automation integration',
  
  config: {
    portalId: '12345678',
    
    // Private App authentication
    auth: {
      type: 'api_key',
      apiKey: '${env:HUBSPOT_API_KEY}',
    },
    
    // Webhook configuration for real-time updates
    webhooks: {
      enabled: true,
      endpoint: 'https://api.mycompany.com/webhooks/hubspot',
      events: [
        'contact.creation',
        'contact.propertyChange',
        'deal.creation',
      ],
      secret: '${env:HUBSPOT_WEBHOOK_SECRET}',
    },
  },
  
  capabilities: {
    supportsRealtime: true, // via webhooks
    supportsBatch: true,
    rateLimit: {
      requests: 100,
      window: 10, // per 10 seconds
    },
  },
};

// Stripe Connector
export const stripeConnector: SaaSConnector = {
  name: 'stripe_payments',
  label: 'Stripe Payments',
  type: 'saas',
  subtype: 'stripe',
  description: 'Stripe for payment processing and subscription management',
  
  config: {
    // API keys
    auth: {
      type: 'api_key',
      apiKey: '${env:STRIPE_SECRET_KEY}',
      publishableKey: '${env:STRIPE_PUBLISHABLE_KEY}',
    },
    
    // Webhook for events
    webhooks: {
      enabled: true,
      endpoint: 'https://api.mycompany.com/webhooks/stripe',
      events: [
        'payment_intent.succeeded',
        'customer.subscription.created',
        'invoice.payment_failed',
      ],
      secret: '${env:STRIPE_WEBHOOK_SECRET}',
    },
    
    // API version
    apiVersion: '2023-10-16',
  },
  
  capabilities: {
    supportsIdempotency: true,
    supportsWebhooks: true,
    rateLimit: {
      requests: 100,
      window: 1, // per second
    },
  },
};

/**
 * Example 5: Generic Connector Configuration
 * 
 * For custom integrations not covered by predefined types.
 */
export const customAPIConnector: Connector = {
  name: 'custom_erp',
  label: 'Custom ERP System',
  type: 'custom',
  description: 'Integration with legacy ERP system',
  
  config: {
    baseUrl: 'https://erp.mycompany.com/api/v2',
    
    // Authentication
    auth: {
      type: 'custom',
      headers: {
        'X-API-Key': '${env:ERP_API_KEY}',
        'X-Client-ID': '${env:ERP_CLIENT_ID}',
      },
    },
    
    // HTTP client configuration
    http: {
      timeout: 30000,
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoff: 'exponential',
        initialDelay: 1000,
      },
      
      // Custom headers
      headers: {
        'User-Agent': 'ObjectStack/1.0',
        'Accept': 'application/json',
      },
    },
    
    // Certificate pinning for security
    certificatePinning: {
      enabled: true,
      fingerprints: [
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      ],
    },
  },
  
  // Health check
  healthCheck: {
    enabled: true,
    endpoint: '/health',
    interval: 60000, // 1 minute
    timeout: 5000,
  },
};

/**
 * Usage Examples
 */

// Example: Using connectors in object definitions
export const exampleWithConnector = {
  // In an object definition, reference a connector for external lookups
  fields: {
    salesforce_account_id: {
      type: 'external_lookup' as const,
      label: 'Salesforce Account',
      connector: 'salesforce_sync',
      remoteObject: 'Account',
      displayField: 'Name',
    },
  },
};

// Example: Using connectors in ETL pipelines
export const exampleETLPipeline = {
  name: 'sync_from_postgres',
  source: {
    connector: 'production_postgres',
    query: 'SELECT * FROM accounts WHERE updated_at > :lastSync',
  },
  destination: {
    object: 'account',
  },
  schedule: '0 */2 * * *', // Every 2 hours
};

/**
 * Testing Connectors
 */

// Helper to test connector connectivity
export async function testConnector(connectorName: string): Promise<boolean> {
  // In production, this would actually test the connection
  console.log(`Testing connector: ${connectorName}`);
  return true;
}

// Uncomment to run examples
// console.log('PostgreSQL Connector:', postgresConnector);
// console.log('S3 Connector:', s3Connector);
// console.log('RabbitMQ Connector:', rabbitmqConnector);
// console.log('Salesforce Connector:', salesforceConnector);
