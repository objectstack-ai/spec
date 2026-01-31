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
  provider: 'postgresql',
  description: 'Main production database for legacy CRM system',
  
  // Authentication
  authentication: {
    type: 'basic',
    username: '${env:POSTGRES_USER}',
    password: '${env:POSTGRES_PASSWORD}',
  },
  
  // Connection configuration
  connectionConfig: {
    host: 'db.production.example.com',
    port: 5432,
    database: 'crm_production',
    username: '${env:POSTGRES_USER}',
    password: '${env:POSTGRES_PASSWORD}',
    options: {
      schema: 'public',
    },
  },
  
  // Connection pool settings
  poolConfig: {
    min: 2,
    max: 10,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 10000,
    acquireTimeoutMs: 30000,
    evictionRunIntervalMs: 30000,
    testOnBorrow: true,
  },
  
  // SSL configuration
  sslConfig: {
    enabled: true,
    rejectUnauthorized: true,
    ca: '${file:./certs/ca.pem}',
  },
  
  // Tables to sync
  tables: [
    {
      name: 'accounts',
      label: 'Accounts',
      tableName: 'accounts',
      primaryKey: 'id',
      enabled: true,
    },
    {
      name: 'contacts',
      label: 'Contacts',
      tableName: 'contacts',
      primaryKey: 'id',
      enabled: true,
    },
  ],
  
  // Query timeout
  queryTimeoutMs: 30000,
  
  // Enable query logging
  enableQueryLogging: false,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// MongoDB Connector
export const mongoConnector: DatabaseConnector = {
  name: 'analytics_mongo',
  label: 'Analytics MongoDB',
  type: 'database',
  provider: 'mongodb',
  description: 'MongoDB cluster for analytics and reporting',
  
  // Authentication
  authentication: {
    type: 'none',
  },
  
  // Connection configuration
  connectionConfig: {
    host: 'mongo.example.com',
    port: 27017,
    database: 'analytics',
    username: 'analytics_user',
    password: '${env:MONGODB_PASSWORD}',
    options: {
      replicaSet: 'rs0',
      readPreference: 'secondaryPreferred',
    },
  },
  
  // Tables (collections) to sync
  tables: [
    {
      name: 'events',
      label: 'Events',
      tableName: 'events',
      primaryKey: '_id',
      enabled: true,
    },
  ],
  
  // Query timeout
  queryTimeoutMs: 30000,
  
  // Enable query logging
  enableQueryLogging: false,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
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
  provider: 's3',
  description: 'S3 bucket for customer documents and attachments',
  
  // Authentication
  authentication: {
    type: 'api-key',
    key: '${env:AWS_ACCESS_KEY_ID}:${env:AWS_SECRET_ACCESS_KEY}',
    headerName: 'Authorization',
  },
  
  // Storage configuration
  storageConfig: {
    region: 'us-east-1',
    pathStyle: false,
  },
  
  // Buckets to sync
  buckets: [
    {
      name: 'documents',
      bucketName: 'my-company-documents',
      label: 'Documents',
      enabled: true,
    },
  ],
  
  // Encryption
  encryption: {
    enabled: true,
    algorithm: 'AES256',
  },
  
  // Transfer acceleration
  transferAcceleration: false,
  
  // Buffer size
  bufferSize: 64 * 1024,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// Azure Blob Storage Connector
export const azureBlobConnector: FileStorageConnector = {
  name: 'azure_blob_media',
  label: 'Azure Blob Media Storage',
  type: 'file_storage',
  provider: 'azure_blob',
  description: 'Azure Blob Storage for media assets',
  
  // Authentication
  authentication: {
    type: 'api-key',
    key: '${env:AZURE_STORAGE_CONNECTION_STRING}',
    headerName: 'Authorization',
  },
  
  // Buckets (containers) to sync
  buckets: [
    {
      name: 'media_assets',
      bucketName: 'media-assets',
      label: 'Media Assets',
      enabled: true,
    },
  ],
  
  // Transfer acceleration
  transferAcceleration: false,
  
  // Buffer size
  bufferSize: 64 * 1024,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// Local File System Connector (for development)
export const localFileConnector: FileStorageConnector = {
  name: 'local_dev_storage',
  label: 'Local Development Storage',
  type: 'file_storage',
  provider: 'local',
  description: 'Local file system for development',
  
  // Authentication (not needed for local)
  authentication: {
    type: 'none',
  },
  
  // Buckets (directories) to use
  buckets: [
    {
      name: 'uploads',
      bucketName: './storage/uploads',
      label: 'Uploads',
      enabled: true,
    },
  ],
  
  // Transfer acceleration
  transferAcceleration: false,
  
  // Buffer size
  bufferSize: 64 * 1024,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
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
  provider: 'rabbitmq',
  description: 'RabbitMQ for event-driven workflows',
  
  // Authentication
  authentication: {
    type: 'basic',
    username: '${env:RABBITMQ_USER}',
    password: '${env:RABBITMQ_PASSWORD}',
  },
  
  // Broker configuration
  brokerConfig: {
    brokers: ['rabbitmq.example.com:5672'],
    connectionTimeoutMs: 10000,
    requestTimeoutMs: 30000,
  },
  
  // Topics/queues to sync
  topics: [
    {
      name: 'workflow_execution',
      topicName: 'workflow.execution',
      label: 'Workflow Execution',
      enabled: true,
      mode: 'both',
      messageFormat: 'json',
    },
  ],
  
  // Delivery guarantee
  deliveryGuarantee: 'at_least_once',
  
  // Message ordering
  preserveOrder: true,
  
  // Enable metrics
  enableMetrics: true,
  
  // Enable distributed tracing
  enableTracing: false,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// Apache Kafka Connector
export const kafkaConnector: MessageQueueConnector = {
  name: 'kafka_analytics',
  label: 'Kafka Analytics Stream',
  type: 'message_queue',
  provider: 'kafka',
  description: 'Kafka for real-time analytics streaming',
  
  // Authentication
  authentication: {
    type: 'none',
  },
  
  // Broker configuration
  brokerConfig: {
    brokers: [
      'kafka-1.example.com:9092',
      'kafka-2.example.com:9092',
      'kafka-3.example.com:9092',
    ],
    connectionTimeoutMs: 30000,
    requestTimeoutMs: 30000,
  },
  
  // SASL authentication (Kafka-specific)
  saslConfig: {
    mechanism: 'scram-sha-512',
    username: '${env:KAFKA_USER}',
    password: '${env:KAFKA_PASSWORD}',
  },
  
  // Topics to sync
  topics: [
    {
      name: 'crm_events',
      topicName: 'crm.events',
      label: 'CRM Events',
      enabled: true,
      mode: 'both',
      messageFormat: 'json',
    },
  ],
  
  // SSL/TLS
  sslConfig: {
    enabled: true,
    rejectUnauthorized: true,
  },
  
  // Delivery guarantee
  deliveryGuarantee: 'at_least_once',
  
  // Message ordering
  preserveOrder: true,
  
  // Enable metrics
  enableMetrics: true,
  
  // Enable distributed tracing
  enableTracing: false,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// Redis Connector (for pub/sub and queues)
export const redisConnector: MessageQueueConnector = {
  name: 'redis_cache_queue',
  label: 'Redis Cache & Queue',
  type: 'message_queue',
  provider: 'redis_pubsub',
  description: 'Redis for caching and lightweight queuing',
  
  // Authentication
  authentication: {
    type: 'basic',
    username: 'default',
    password: '${env:REDIS_PASSWORD}',
  },
  
  // Broker configuration
  brokerConfig: {
    brokers: ['redis.example.com:6379'],
    connectionTimeoutMs: 30000,
    requestTimeoutMs: 30000,
  },
  
  // Topics (channels) to sync
  topics: [
    {
      name: 'notifications',
      topicName: 'notifications',
      label: 'Notifications',
      enabled: true,
      mode: 'both',
      messageFormat: 'json',
    },
  ],
  
  // Delivery guarantee
  deliveryGuarantee: 'at_least_once',
  
  // Message ordering
  preserveOrder: true,
  
  // Enable metrics
  enableMetrics: true,
  
  // Enable distributed tracing
  enableTracing: false,
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
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
  provider: 'salesforce',
  description: 'Salesforce integration for bi-directional sync',
  
  // Authentication
  authentication: {
    type: 'oauth2',
    clientId: '${env:SALESFORCE_CLIENT_ID}',
    clientSecret: '${env:SALESFORCE_CLIENT_SECRET}',
    authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    scopes: ['api', 'refresh_token'],
  },
  
  // Base URL
  baseUrl: 'https://mycompany.my.salesforce.com',
  
  // API version
  apiVersion: {
    version: '58.0',
    isDefault: false,
  },
  
  // Object types to sync
  objectTypes: [
    {
      name: 'account',
      apiName: 'Account',
      label: 'Accounts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'contact',
      apiName: 'Contact',
      label: 'Contacts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// HubSpot Connector
export const hubspotConnector: SaaSConnector = {
  name: 'hubspot_marketing',
  label: 'HubSpot Marketing',
  type: 'saas',
  provider: 'hubspot',
  description: 'HubSpot for marketing automation integration',
  
  // Authentication
  authentication: {
    type: 'api-key',
    key: '${env:HUBSPOT_API_KEY}',
    headerName: 'Authorization',
  },
  
  // Base URL
  baseUrl: 'https://api.hubapi.com',
  
  // Object types to sync
  objectTypes: [
    {
      name: 'contact',
      apiName: 'contacts',
      label: 'Contacts',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'deal',
      apiName: 'deals',
      label: 'Deals',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
};

// Stripe Connector
export const stripeConnector: SaaSConnector = {
  name: 'stripe_payments',
  label: 'Stripe Payments',
  type: 'saas',
  provider: 'stripe',
  description: 'Stripe for payment processing and subscription management',
  
  // Authentication
  authentication: {
    type: 'api-key',
    key: '${env:STRIPE_SECRET_KEY}',
    headerName: 'Authorization',
  },
  
  // Base URL
  baseUrl: 'https://api.stripe.com',
  
  // API version
  apiVersion: {
    version: '2023-10-16',
    isDefault: false,
  },
  
  // Object types to sync
  objectTypes: [
    {
      name: 'customer',
      apiName: 'customers',
      label: 'Customers',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
    {
      name: 'subscription',
      apiName: 'subscriptions',
      label: 'Subscriptions',
      enabled: true,
      supportsCreate: true,
      supportsUpdate: true,
      supportsDelete: true,
    },
  ],
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
  status: 'active',
  enabled: true,
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
  status: 'active',
  enabled: true,
  
  // Authentication
  authentication: {
    type: 'api-key',
    key: '${env:ERP_API_KEY}',
    headerName: 'X-API-Key',
  },
  
  metadata: {
    baseUrl: 'https://erp.mycompany.com/api/v2',
    clientId: '${env:ERP_CLIENT_ID}',
  },
  
  // Connection timeouts
  connectionTimeoutMs: 30000,
  requestTimeoutMs: 30000,
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
