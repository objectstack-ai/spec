/**
 * Example: Advanced API Protocols
 * 
 * This example demonstrates advanced API protocols beyond REST:
 * - GraphQL API (Schema, Resolvers, Subscriptions)
 * - OData API (Query capabilities, Metadata)
 * - WebSocket/Realtime API (Pub/Sub, Live queries)
 * - Batch Operations (Bulk create/update/delete)
 * - API Rate Limiting & Throttling
 * - API Versioning
 * 
 * Protocols covered:
 * - GraphQL Protocol
 * - OData Protocol
 * - WebSocket Protocol
 * - Realtime Protocol
 * - Batch Protocol
 */

import {
  GraphQLConfig,
  ODataConfig,
  WebSocketConfig,
  RealtimeConfig,
  BatchConfig,
} from '@objectstack/spec/api';

/**
 * Example 1: GraphQL API Configuration
 * 
 * GraphQL provides a flexible query language alternative to REST,
 * allowing clients to request exactly the data they need.
 */

export const graphqlConfig: GraphQLConfig = {
  // Enable GraphQL endpoint
  enabled: true,
  
  // Endpoint path
  path: '/graphql',
  
  // GraphQL Playground (for development)
  playground: {
    enabled: true,
    path: '/playground',
  },
  
  // Schema generation
  schema: {
    // Auto-generate types from Objects
    autoGenerateTypes: true,
    
    // Custom types
    types: [
      {
        name: 'DateTime',
        object: 'scalar',
        description: 'ISO 8601 date-time string',
      },
      {
        name: 'JSON',
        object: 'scalar',
        description: 'JSON object',
      },
      {
        name: 'AggregationResult',
        object: 'aggregation_result',
        isInterface: false,
        fields: {
          mappings: {
            count: { graphqlType: 'Int!' },
            sum: { graphqlType: 'Float' },
            avg: { graphqlType: 'Float' },
            min: { graphqlType: 'Float' },
            max: { graphqlType: 'Float' },
          }
        }
      }
    ],

    // Custom mutations
    mutations: [
      {
        name: 'convertLead',
        object: 'lead',
        type: 'custom',
        description: 'Convert a lead to an account',
        input: {
          fields: {
            include: ['id', 'accountName']
          }
        }
      }
    ],

    // Custom subscriptions
    subscriptions: [
      {
        name: 'recordUpdated',
        object: 'record',
        events: ['updated'],
        authRequired: true,
        description: 'Subscribe to record updates',
        filter: {
          enabled: true,
          fields: ['object', 'recordId']
        }
      }
    ],

    // Custom directives
    directives: [
      {
        name: 'auth',
        description: 'Requires authentication',
        locations: ['FIELD_DEFINITION', 'OBJECT'],
        repeatable: false,
      },
      {
        name: 'permission',
        description: 'Requires specific permission',
        locations: ['FIELD_DEFINITION', 'OBJECT'],
        repeatable: false,
        args: {
          requires: { type: 'String!', description: 'Required permission' }
        }
      },
      {
        name: 'deprecated',
        description: 'Marks field as deprecated',
        locations: ['FIELD_DEFINITION'],
        repeatable: false,
        args: {
          reason: { type: 'String', description: 'Deprecation reason' }
        }
      },
    ],
  },
  
  // Security
  security: {
    // Query depth limiting
    depthLimit: {
      enabled: true,
      maxDepth: 10,
      onDepthExceeded: 'reject',
    },
    
    // Query complexity
    complexity: {
      enabled: true,
      maxComplexity: 1000,
      defaultFieldComplexity: 1,
      listMultiplier: 10,
      onComplexityExceeded: 'reject',
    },
    
    // Rate limiting
    rateLimit: {
      enabled: true,
      strategy: 'sliding_window',
      onLimitExceeded: 'reject',
      includeHeaders: true,
    },
    
    // Persisted queries
    persistedQueries: {
      enabled: true,
      mode: 'optional',
      security: {
        rejectIntrospection: true
      }
    },
  },
};

/**
 * Example 2: OData API Configuration
 * 
 * OData (Open Data Protocol) provides a standardized way to create
 * and consume RESTful APIs with rich query capabilities.
 */

export const odataConfig: ODataConfig = {
  // Enable OData endpoint
  enabled: true,
  
  // Base path
  path: '/odata',
  
  // Metadata endpoint
  metadata: {
    namespace: 'MyCompany.CRM',
    entityTypes: [
      {
        name: 'Account',
        key: ['id'],
        properties: [
          { name: 'id', type: 'Edm.String', nullable: false },
          { name: 'name', type: 'Edm.String', nullable: false },
        ]
      }
    ],
    entitySets: [
      { name: 'Accounts', entityType: 'MyCompany.CRM.Account' }
    ]
  },
};
/* Example configuration removed due to schema mismatch */
const odataConfigRemoved = {
  // Service document
  serviceDocument: {
    enabled: true,
    path: '/',
  },
  
  // Query options
  queryOptions: {
    // $filter (WHERE clause)
    filter: {
      enabled: true,
      
      // Filter functions
      functions: [
        'contains',
        'startswith',
        'endswith',
        'length',
        'indexof',
        'substring',
        'tolower',
        'toupper',
        'trim',
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
      ],
      
      // Operators
      operators: [
        'eq', 'ne', 'gt', 'ge', 'lt', 'le',
        'and', 'or', 'not',
        'in', 'has',
      ],
    },
    
    // $select (field selection)
    select: {
      enabled: true,
      defaultFields: '*',
    },
    
    // $expand (eager loading)
    expand: {
      enabled: true,
      maxDepth: 3,
      maxExpansions: 10,
    },
    
    // $orderby (sorting)
    orderby: {
      enabled: true,
      maxSortFields: 5,
    },
    
    // $top and $skip (pagination)
    pagination: {
      enabled: true,
      defaultTop: 20,
      maxTop: 1000,
    },
    
    // $count (total count)
    count: {
      enabled: true,
      inlineCount: true, // Include count in response
    },
    
    // $search (full-text search)
    search: {
      enabled: true,
      searchMode: 'any', // or 'all'
    },
    
    // $apply (aggregations)
    apply: {
      enabled: true,
      
      // Transformations
      transformations: [
        'aggregate',
        'groupby',
        'filter',
        'compute',
        'expand',
        'concat',
      ],
      
      // Aggregation functions
      aggregations: [
        'sum',
        'avg',
        'min',
        'max',
        'count',
        'countdistinct',
      ],
    },
  },
  
  // Batch requests
  batch: {
    enabled: true,
    path: '/$batch',
    maxBatchSize: 100,
    maxChangeSets: 10,
  },
  
  // Delta links (change tracking)
  delta: {
    enabled: true,
    tokenExpiration: 86400, // 24 hours
  },
  
  // Annotations
  annotations: {
    // Common annotations
    include: [
      'Org.OData.Core.V1',
      'Org.OData.Capabilities.V1',
      'Org.OData.Validation.V1',
    ],
  },
  
  // Response format
  format: {
    // Default format
    default: 'json',
    
    // Supported formats
    supported: ['json', 'xml', 'atom'],
    
    // JSON format options
    json: {
      // Metadata level
      metadata: 'minimal', // or 'full', 'none'
      
      // IEEE754 compatibility (for large numbers)
      ieee754Compatible: true,
      
      // Streaming
      streaming: true,
    },
  },
  
  // ETags (optimistic concurrency)
  etags: {
    enabled: true,
    algorithm: 'sha256',
  },
  
  // CORS
  cors: {
    enabled: true,
    origins: ['*'],
    credentials: true,
  },
};

/**
 * Example 3: WebSocket/Realtime Configuration
 * 
 * WebSocket provides full-duplex communication for real-time features
 * like live queries, notifications, and collaboration.
 */

export const websocketConfig: WebSocketConfig = {
  url: 'ws://localhost:3000/ws',
  protocols: ['graphql-ws'],
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer ...'
  }
};
/* Example configuration removed due to schema mismatch */
const websocketConfigRemoved = {
  // Enable WebSocket server
  enabled: true,
  
  // WebSocket path
  path: '/ws',
  
  // Transport options
  transport: {
    // Use Socket.IO, WS, or native WebSocket
    type: 'socket.io',
    
    // Socket.IO configuration
    socketio: {
      // Path
      path: '/socket.io',
      
      // Transports (fallback order)
      transports: ['websocket', 'polling'],
      
      // CORS
      cors: {
        origin: '*',
        credentials: true,
      },
      
      // Ping configuration
      pingTimeout: 60000,
      pingInterval: 25000,
      
      // Connection limits
      maxHttpBufferSize: 1024 * 1024, // 1MB
      
      // Adapter (for scaling)
      adapter: {
        type: 'redis',
        config: {
          host: 'redis.example.com',
          port: 6379,
        },
      },
    },
  },
  
  // Authentication
  authentication: {
    required: true,
    
    // Auth methods
    methods: ['token', 'session'],
    
    // Token validation
    token: {
      header: 'Authorization',
      prefix: 'Bearer ',
      
      // JWT validation
      jwt: {
        secret: '${env:JWT_SECRET}',
        algorithms: ['HS256'],
      },
    },
  },
  
  // Namespaces (for logical grouping)
  namespaces: [
    {
      name: '/notifications',
      description: 'User notifications',
      
      // Namespace-level auth
      authentication: {
        required: true,
      },
    },
    {
      name: '/collaboration',
      description: 'Real-time collaboration',
    },
    {
      name: '/admin',
      description: 'Admin dashboard',
      
      // Require admin permission
      authentication: {
        required: true,
        permissions: ['admin'],
      },
    },
  ],
  
  // Events
  events: {
    // Client -> Server events
    clientEvents: [
      'subscribe',
      'unsubscribe',
      'query',
      'mutation',
      'ping',
    ],
    
    // Server -> Client events
    serverEvents: [
      'data',
      'error',
      'connected',
      'disconnected',
      'pong',
    ],
  },
  
  // Rooms (for broadcasting)
  rooms: {
    enabled: true,
    
    // Auto-create rooms
    autoCreate: true,
    
    // Room naming
    naming: {
      // Pattern: {object}:{recordId}
      pattern: '{object}:{id}',
    },
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    
    // Per connection
    perConnection: {
      maxMessages: 100,
      window: 60000, // 1 minute
    },
    
    // Per namespace
    perNamespace: {
      maxConnections: 10000,
    },
  },
  
  // Heartbeat/Keep-alive
  heartbeat: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 60000, // 1 minute
  },
  
  // Compression
  compression: {
    enabled: true,
    threshold: 1024, // 1KB
  },
  
  // Binary data
  binary: {
    enabled: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

/**
 * Example 4: Realtime Protocol Configuration
 * 
 * Realtime protocol for live queries, subscriptions, and pub/sub patterns.
 */

export const realtimeConfig: RealtimeConfig = {
  // Enable real-time features
  enabled: true,
  
  // Transport (uses WebSocket)
  transport: 'websocket',
  
  // Live queries (auto-updating queries)
  liveQueries: {
    enabled: true,
    
    // Query subscriptions
    subscriptions: {
      // Maximum subscriptions per connection
      maxPerConnection: 50,
      
      // Query throttling
      throttle: {
        enabled: true,
        minInterval: 100, // ms
      },
      
      // Query caching
      cache: {
        enabled: true,
        ttl: 60000, // 1 minute
      },
    },
    
    // Change detection
    changeDetection: {
      // Strategy: 'poll', 'push', 'hybrid'
      strategy: 'push',
      
      // Polling interval (if using poll strategy)
      pollInterval: 1000,
      
      // Debounce rapid changes
      debounce: 200, // ms
    },
    
    // Supported objects
    objects: {
      include: ['account', 'contact', 'opportunity'],
      exclude: ['_internal_*'],
    },
  },
  
  // Pub/Sub channels
  pubsub: {
    enabled: true,
    
    // Channel patterns
    channels: [
      {
        pattern: 'object:{objectName}:created',
        description: 'New record created',
      },
      {
        pattern: 'object:{objectName}:updated',
        description: 'Record updated',
      },
      {
        pattern: 'object:{objectName}:deleted',
        description: 'Record deleted',
      },
      {
        pattern: 'user:{userId}:notification',
        description: 'User notification',
      },
      {
        pattern: 'dashboard:{dashboardId}:refresh',
        description: 'Dashboard refresh',
      },
    ],
    
    // Backend (for distributed systems)
    backend: {
      type: 'redis',
      config: {
        host: 'redis.example.com',
        port: 6379,
      },
    },
  },
  
  // Presence (online/offline status)
  presence: {
    enabled: true,
    
    // Heartbeat interval
    heartbeatInterval: 30000, // 30 seconds
    
    // Offline timeout
    offlineTimeout: 60000, // 1 minute
    
    // Broadcast presence changes
    broadcast: true,
  },
  
  // Conflict resolution (for collaborative editing)
  conflictResolution: {
    strategy: 'last_write_wins', // or 'operational_transform', 'crdt'
    
    // Version tracking
    versioning: {
      enabled: true,
      field: '_version',
    },
  },
  
  // Message ordering
  ordering: {
    guaranteed: true,
    
    // Sequence numbers
    sequencing: {
      enabled: true,
    },
  },
  
  // Scalability
  scaling: {
    // Horizontal scaling with Redis
    redis: {
      enabled: true,
      config: {
        cluster: [
          { host: 'redis-1.example.com', port: 6379 },
          { host: 'redis-2.example.com', port: 6379 },
          { host: 'redis-3.example.com', port: 6379 },
        ],
      },
    },
  },
};

/**
 * Example 5: Batch Operations Configuration
 * 
 * Batch API for efficient bulk operations (create, update, delete).
 */

export const batchConfig: BatchConfig = {
  // Enable batch operations
  enabled: true,
  maxRecordsPerBatch: 200,
  defaultOptions: {
    atomic: true,
    validateOnly: false,
    continueOnError: false,
    returnRecords: true,
  },
};
/* Example configuration removed due to schema mismatch */
const batchConfigRemoved = {
  // Batch endpoint
  path: '/api/v1/batch',
  
  // Batch size limits
  limits: {
    // Maximum requests per batch
    maxBatchSize: 200,
    
    // Maximum total payload size
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    
    // Maximum operations per object
    maxPerObject: 100,
  },
  
  // Operations
  operations: {
    // Supported operations
    supported: ['create', 'update', 'delete', 'upsert'],
    
    // Create
    create: {
      enabled: true,
      
      // Return created records
      returnRecords: true,
      
      // All-or-nothing
      atomic: false, // Continue on error
    },
    
    // Update
    update: {
      enabled: true,
      
      // Partial updates
      partial: true,
      
      // Return updated records
      returnRecords: false,
    },
    
    // Delete
    delete: {
      enabled: true,
      
      // Soft delete
      soft: true,
      
      // Cascade delete
      cascade: false,
    },
    
    // Upsert (insert or update)
    upsert: {
      enabled: true,
      
      // Match fields for finding existing record
      matchFields: ['external_id', 'email'],
      
      // Return records
      returnRecords: true,
    },
  },
  
  // Transaction control
  transactions: {
    // Enable transactions
    enabled: true,
    
    // Transaction mode
    mode: 'optimistic', // or 'pessimistic'
    
    // Rollback on error
    rollbackOnError: false, // Process all, report errors
  },
  
  // Execution
  execution: {
    // Parallel execution
    parallel: {
      enabled: true,
      maxConcurrency: 10,
    },
    
    // Timeout per operation
    operationTimeout: 5000, // 5 seconds
    
    // Total batch timeout
    batchTimeout: 300000, // 5 minutes
  },
  
  // Response format
  response: {
    // Include details for each operation
    includeDetails: true,
    
    // Summary
    summary: {
      total: true,
      successful: true,
      failed: true,
      duration: true,
    },
    
    // Error reporting
    errors: {
      // Include error details
      includeDetails: true,
      
      // Include stack traces (development only)
      includeStackTrace: false,
    },
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    
    // Per user
    perUser: {
      maxBatches: 100,
      window: 3600, // 1 hour
    },
    
    // Per IP
    perIP: {
      maxBatches: 1000,
      window: 3600,
    },
  },
  
  // Monitoring
  monitoring: {
    // Log batch operations
    logging: {
      enabled: true,
      level: 'info',
    },
    
    // Metrics
    metrics: {
      enabled: true,
      track: ['duration', 'size', 'success_rate'],
    },
  },
};

/**
 * Usage Examples
 */

// Example GraphQL query
const exampleGraphQLQuery = `
  query GetAccounts($filter: AccountFilter, $limit: Int) {
    accounts(filter: $filter, limit: $limit) {
      edges {
        node {
          id
          name
          industry
          annualRevenue
          contacts {
            id
            firstName
            lastName
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// Example GraphQL subscription
const exampleGraphQLSubscription = `
  subscription OnAccountUpdated($accountId: ID!) {
    accountUpdated(id: $accountId) {
      id
      name
      updatedAt
      updatedBy {
        id
        name
      }
    }
  }
`;

// Example OData query
const exampleODataQuery = `
  GET /odata/Accounts?
    $filter=AnnualRevenue gt 1000000 and Industry eq 'Technology'&
    $expand=Contacts($select=FirstName,LastName,Email)&
    $orderby=Name asc&
    $top=20&
    $count=true
`;

// Example WebSocket subscription
const exampleWebSocketSubscription = {
  event: 'subscribe',
  data: {
    channel: 'object:account:created',
    filter: {
      industry: 'Technology',
    },
  },
};

// Example batch request
const exampleBatchRequest = {
  operations: [
    {
      method: 'POST',
      url: '/api/v1/data/account',
      body: {
        name: 'Acme Corp',
        industry: 'Technology',
      },
    },
    {
      method: 'PATCH',
      url: '/api/v1/data/account/123',
      body: {
        annualRevenue: 5000000,
      },
    },
    {
      method: 'DELETE',
      url: '/api/v1/data/account/456',
    },
  ],
};

// Uncomment to see configurations
// console.log('GraphQL Config:', graphqlConfig);
// console.log('OData Config:', odataConfig);
// console.log('WebSocket Config:', websocketConfig);
// console.log('Realtime Config:', realtimeConfig);
// console.log('Batch Config:', batchConfig);
