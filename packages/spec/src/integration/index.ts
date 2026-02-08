/**
 * Integration Protocol Exports
 * 
 * External System Connection Protocols
 * - Connector configurations for SaaS, databases, file storage, message queues
 * - GitHub integration (version control, CI/CD)
 * - Vercel integration (deployment, hosting)
 * - Payment gateway integration (Stripe, PayPal)
 * - E-Signature integration (DocuSign, Adobe Sign)
 * - Communication integration (Slack, Discord, Microsoft Teams)
 * - Email integration (Gmail, Outlook)
 * - Accounting integration (QuickBooks, Xero, NetSuite)
 * - HRIS integration (BambooHR, Workday, ADP)
 * - Recruiting integration (LinkedIn, Greenhouse)
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
export * from './connector/github.zod';
export * from './connector/vercel.zod';

// CRM Ecosystem Connectors
export * from './connector/payment.zod';
export * from './connector/esign.zod';
export * from './connector/communication.zod';
export * from './connector/email.zod';
export * from './connector/accounting.zod';
export * from './connector/hris.zod';
export * from './connector/recruiting.zod';
