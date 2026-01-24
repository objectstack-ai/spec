import { z } from 'zod';

/**
 * Webhook Trigger Event
 * When should this webhook fire?
 */
export const WebhookTriggerType = z.enum([
  'create', 
  'update', 
  'delete', 
  'undelete',
  'api' // Manually triggered
]);

/**
 * Webhook Schema
 * outbound Integration: Push data to external URL when events happen.
 */
export const WebhookSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  label: z.string().optional(),
  
  /** Scope */
  object: z.string().describe('Object to listen to'),
  triggers: z.array(WebhookTriggerType).describe('Events that trigger execution'),
  
  /** Target */
  url: z.string().url().describe('External URL payload'),
  method: z.enum(['POST', 'PUT', 'GET']).default('POST'),
  
  /** Security */
  secret: z.string().optional().describe('Signing secret (HMAC)'),
  headers: z.record(z.string()).optional().describe('Custom headers (Auth)'),
  
  /** Payload Configuration */
  payloadFields: z.array(z.string()).optional().describe('Fields to include. Empty = All'),
  includeSession: z.boolean().default(false).describe('Include user session info'),
  
  /** Reliability */
  retryCount: z.number().default(3),
  isActive: z.boolean().default(true)
});

/**
 * Webhook Receiver Schema (Inbound)
 * Handling incoming HTTP hooks from Stripe, Slack, etc.
 */
export const WebhookReceiverSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/),
  path: z.string().describe('URL Path (e.g. /webhooks/stripe)'),
  
  /** Verification */
  verificationType: z.enum(['none', 'header_token', 'hmac', 'ip_whitelist']).default('none'),
  verificationParams: z.object({
    header: z.string().optional(),
    secret: z.string().optional(),
    ips: z.array(z.string()).optional()
  }).optional(),
  
  /** Action */
  action: z.enum(['trigger_flow', 'script', 'upsert_record']).default('trigger_flow'),
  target: z.string().describe('Flow ID or Script name'),
});

export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookReceiver = z.infer<typeof WebhookReceiverSchema>;
