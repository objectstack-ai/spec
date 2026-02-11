// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Better-Auth Configuration Protocol
 * 
 * Defines the configuration required to initialize the Better-Auth kernel.
 * Used in server-side configuration injection.
 */

export const AuthProviderConfigSchema = z.object({
  id: z.string().describe('Provider ID (github, google)'),
  clientId: z.string().describe('OAuth Client ID'),
  clientSecret: z.string().describe('OAuth Client Secret'),
  scope: z.array(z.string()).optional().describe('Requested permissions'),
});

export const AuthPluginConfigSchema = z.object({
  organization: z.boolean().default(false).describe('Enable Organization/Teams support'),
  twoFactor: z.boolean().default(false).describe('Enable 2FA'),
  passkeys: z.boolean().default(false).describe('Enable Passkey support'),
  magicLink: z.boolean().default(false).describe('Enable Magic Link login'),
});

/**
 * Mutual TLS (mTLS) Configuration Schema
 * 
 * Enables client certificate authentication for zero-trust architectures.
 */
export const MutualTLSConfigSchema = z.object({
  /** Enable mutual TLS authentication */
  enabled: z.boolean()
    .default(false)
    .describe('Enable mutual TLS authentication'),

  /** Require client certificates for all connections */
  clientCertRequired: z.boolean()
    .default(false)
    .describe('Require client certificates for all connections'),

  /** PEM-encoded CA certificates or file paths for trust validation */
  trustedCAs: z.array(z.string())
    .describe('PEM-encoded CA certificates or file paths'),

  /** Certificate Revocation List URL */
  crlUrl: z.string()
    .optional()
    .describe('Certificate Revocation List (CRL) URL'),

  /** Online Certificate Status Protocol URL */
  ocspUrl: z.string()
    .optional()
    .describe('Online Certificate Status Protocol (OCSP) URL'),

  /** Certificate validation strictness level */
  certificateValidation: z.enum(['strict', 'relaxed', 'none'])
    .describe('Certificate validation strictness level'),

  /** Allowed Common Names on client certificates */
  allowedCNs: z.array(z.string())
    .optional()
    .describe('Allowed Common Names (CN) on client certificates'),

  /** Allowed Organizational Units on client certificates */
  allowedOUs: z.array(z.string())
    .optional()
    .describe('Allowed Organizational Units (OU) on client certificates'),

  /** Certificate pinning configuration */
  pinning: z.object({
    /** Enable certificate pinning */
    enabled: z.boolean().describe('Enable certificate pinning'),
    /** Array of pinned certificate hashes */
    pins: z.array(z.string()).describe('Pinned certificate hashes'),
  })
    .optional()
    .describe('Certificate pinning configuration'),
});

export type MutualTLSConfig = z.infer<typeof MutualTLSConfigSchema>;

export const AuthConfigSchema = z.object({
  secret: z.string().optional().describe('Encryption secret'),
  baseUrl: z.string().optional().describe('Base URL for auth routes'),
  databaseUrl: z.string().optional().describe('Database connection string'),
  providers: z.array(AuthProviderConfigSchema).optional(),
  plugins: AuthPluginConfigSchema.optional(),
  session: z.object({
    expiresIn: z.number().default(60 * 60 * 24 * 7).describe('Session duration in seconds'),
    updateAge: z.number().default(60 * 60 * 24).describe('Session update frequency'),
  }).optional(),
  mutualTls: MutualTLSConfigSchema.optional().describe('Mutual TLS (mTLS) configuration'),
}).catchall(z.unknown());

export type AuthProviderConfig = z.infer<typeof AuthProviderConfigSchema>;
export type AuthPluginConfig = z.infer<typeof AuthPluginConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
