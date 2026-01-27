import { z } from 'zod';

/**
 * MongoDB Driver Configuration Schema
 * Defines the connection settings specific to MongoDB.
 */
export const MongoConfigSchema = z.object({
  /**
   * Connection URI.
   * If provided, it takes precedence over host/port/database.
   * Format: mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
   */
  url: z.string().optional().describe('Connection URI'),

  /**
   * Database Name.
   * Required to identify which database to use within the cluster.
   */
  database: z.string().describe('Database Name'),

  /**
   * Hostname or IP address.
   * Defaults to localhost if not specified.
   */
  host: z.string().default('127.0.0.1').describe('Host address'),

  /**
   * Port number.
   * Defaults to 27017.
   */
  port: z.number().default(27017).describe('Port number'),

  /**
   * Authentication Username.
   */
  username: z.string().optional().describe('Auth User'),

  /**
   * Authentication Password.
   */
  password: z.string().optional().describe('Auth Password'),

  /**
   * Authentication Database.
   * The database where the user credentials are stored (defaults to 'admin' or the target database).
   */
  authSource: z.string().optional().describe('Authentication Database'),

  /**
   * Enable SSL/TLS.
   */
  ssl: z.boolean().default(false).describe('Enable SSL'),

  /**
   * Replica Set Name.
   * Required if connecting to a replica set.
   */
  replicaSet: z.string().optional().describe('Replica Set Name'),

  /**
   * Read Preference.
   * Controls which members of the replica set usually receive read operations.
   */
  readPreference: z.enum(['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'])
    .default('primary')
    .describe('Read Preference'),

  /**
   * Connection Pool Size.
   * The maximum number of connections in the connection pool.
   */
  maxPoolSize: z.number().optional().describe('Max Connection Pool Size'),

  /**
   * Min Connection Pool Size.
   * The minimum number of connections in the connection pool.
   */
  minPoolSize: z.number().optional().describe('Min Connection Pool Size'),
  
  /**
   * Connect Timeout (ms).
   * How long to wait for a connection to be established before timing out.
   */
  connectTimeoutMS: z.number().optional().describe('Connection Timeout (ms)'),

  /**
   * Socket Timeout (ms).
   * How long a socket can remain idle before being closed.
   */
  socketTimeoutMS: z.number().optional().describe('Socket Timeout (ms)'),
});

export type MongoConfig = z.infer<typeof MongoConfigSchema>;
