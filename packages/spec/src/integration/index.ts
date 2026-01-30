/**
 * Integration Protocol Exports
 * 
 * External System Connection Protocols
 * - Connector configurations for SaaS, databases, file storage, message queues
 * - Authentication methods (OAuth2, API Key, JWT, SAML)
 * - Data synchronization and field mapping
 * - Webhooks, rate limiting, and retry strategies
 */

// Core Connector Protocol
export * from './connector.zod';

// Connector Templates
export * from './connector/saas.zod';
export * from './connector/database.zod';
export * from './connector/file-storage.zod';
export * from './connector/message-queue.zod';
