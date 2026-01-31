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
    settings: {
      'editor.theme': 'dark',
      'editor.reuseHeaders': true,
      'request.credentials': 'include',
    },
  },
  
  // Schema generation
  schema: {
    // Auto-generate from objects
    autoGenerate: true,
    
    // Custom scalars
    customScalars: {
      DateTime: {
        description: 'ISO 8601 date-time string',
        serialize: (value: Date) => value.toISOString(),
        parseValue: (value: string) => new Date(value),
        parseLiteral: (ast: any) => new Date(ast.value),
      },
      JSON: {
        description: 'JSON object',
      },
      Upload: {
        description: 'File upload',
      },
    },
    
    // Include/exclude objects
    objects: {
      include: ['account', 'contact', 'opportunity', 'lead'],
      exclude: ['_internal_*'],
    },
    
    // Custom types
    customTypes: `
      type AggregationResult {
        count: Int!
        sum: Float
        avg: Float
        min: Float
        max: Float
      }
      
      type SearchResult {
        id: ID!
        score: Float!
        highlights: [String!]!
        object: ObjectUnion!
      }
      
      union ObjectUnion = Account | Contact | Opportunity | Lead
    `,
  },
  
  // Query configuration
  query: {
    // Maximum query depth to prevent abuse
    maxDepth: 10,
    
    // Maximum query complexity
    maxComplexity: 1000,
    
    // Pagination
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
    },
    
    // Enable query batching
    batching: {
      enabled: true,
      maxBatchSize: 10,
    },
    
    // Query cost analysis
    costAnalysis: {
      enabled: true,
      
      // Cost per field
      fieldCost: 1,
      
      // Cost per object in list
      objectCost: 10,
      
      // Maximum total cost
      maxCost: 10000,
    },
  },
  
  // Mutations
  mutation: {
    // Enable mutations
    enabled: true,
    
    // Auto-generate CRUD mutations
    autoGenerate: {
      create: true,
      update: true,
      delete: true,
      upsert: true,
    },
    
    // Custom mutations
    customMutations: `
      convertLead(id: ID!, accountName: String!): ConvertLeadResult!
      mergeAccounts(sourceId: ID!, targetId: ID!): Account!
      sendEmail(to: [String!]!, subject: String!, body: String!): Boolean!
    `,
  },
  
  // Subscriptions (real-time)
  subscriptions: {
    enabled: true,
    
    // Transport
    transport: 'websocket',
    
    // Auto-generate subscriptions for object changes
    autoGenerate: {
      created: true,
      updated: true,
      deleted: true,
    },
    
    // Custom subscriptions
    customSubscriptions: `
      recordUpdated(object: String!, recordId: ID!): RecordUpdateEvent!
      notificationReceived(userId: ID!): Notification!
      dashboardRefresh(dashboardId: ID!): Dashboard!
    `,
    
    // Subscription filters
    filters: {
      enabled: true,
      maxFilters: 10,
    },
  },
  
  // Directives
  directives: [
    {
      name: 'auth',
      description: 'Requires authentication',
      locations: ['FIELD_DEFINITION', 'OBJECT'],
    },
    {
      name: 'permission',
      description: 'Requires specific permission',
      locations: ['FIELD_DEFINITION', 'OBJECT'],
      args: {
        requires: { type: 'String!' },
      },
    },
    {
      name: 'deprecated',
      description: 'Marks field as deprecated',
      locations: ['FIELD_DEFINITION'],
      args: {
        reason: { type: 'String' },
      },
    },
    {
      name: 'cost',
      description: 'Query cost weight',
      locations: ['FIELD_DEFINITION'],
      args: {
        complexity: { type: 'Int!' },
      },
    },
  ],
  
  // Introspection
  introspection: {
    // Disable in production for security
    enabled: true,
  },
  
  // Performance
  performance: {
    // DataLoader for batching and caching
    dataloader: {
      enabled: true,
      cacheEnabled: true,
      batchScheduleFn: (callback) => setTimeout(callback, 16), // ~60fps
    },
    
    // Query result caching
    cache: {
      enabled: true,
      ttl: 300, // 5 minutes
    },
    
    // Persisted queries
    persistedQueries: {
      enabled: true,
      hashAlgorithm: 'sha256',
    },
  },
  
  // Security
  security: {
    // CSRF protection
    csrf: {
      enabled: true,
    },
    
    // Query whitelisting (for production)
    queryWhitelist: {
      enabled: false,
      queries: [],
    },
    
    // Disable introspection in production
    disableIntrospectionInProduction: true,
  },
  
  // Error handling
  errorHandling: {
    // Include stack traces (development only)
    includeStackTrace: false,
    
    // Custom error formatter
    formatError: (error) => ({
      message: error.message,
      code: error.extensions?.code,
      path: error.path,
    }),
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
  
  // OData version
  version: '4.0',
  
  // Metadata endpoint
  metadata: {
    enabled: true,
    path: '/$metadata',
    
    // Entity Data Model (EDM)
    edmx: {
      // Auto-generate from objects
      autoGenerate: true,
      
      // Namespaces
      namespace: 'MyCompany.CRM',
      
      // Schema version
      version: '1.0',
    },
  },
  
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
