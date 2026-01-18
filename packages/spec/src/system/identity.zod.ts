import { z } from 'zod';

/**
 * Authentication Protocol
 * Defines supported authentication standards (OIDC, SAML, LDAP).
 */
export const AuthProtocol = z.enum([
  'oidc',       // OpenID Connect (Modern standard)
  'saml',       // SAML 2.0 (Legacy Enterprise)
  'ldap',       // LDAP/Active Directory (On-premise)
  'oauth2',     // Generic OAuth2
  'local',      // Database username/password
  'mock'        // Testing
]);

/**
 * OIDC / OAuth2 Config (Standard)
 */
export const OIDCConfigSchema = z.object({
  issuer: z.string().url().describe('OIDC Issuer URL (.well-known/openid-configuration)'),
  clientId: z.string(),
  clientSecret: z.string(), // Usually value is ENV reference
  scopes: z.array(z.string()).default(['openid', 'profile', 'email']),
  attributeMapping: z.record(z.string()).optional().describe('Map IdP claims to User fields'),
});

/**
 * SAML 2.0 Config (Enterprise)
 */
export const SAMLConfigSchema = z.object({
  entryPoint: z.string().url().describe('IdP SSO URL'),
  cert: z.string().describe('IdP Public Certificate'), // PEM format
  issuer: z.string().describe('Entity ID of the IdP'),
  signatureAlgorithm: z.enum(['sha256', 'sha512']).default('sha256'),
  attributeMapping: z.record(z.string()).optional(),
});

/**
 * LDAP / AD Config (On-premise)
 */
export const LDAPConfigSchema = z.object({
  url: z.string().url().describe('LDAP Server URL (ldap:// or ldaps://)'),
  bindDn: z.string(),
  bindCredentials: z.string(),
  searchBase: z.string(),
  searchFilter: z.string(),
  groupSearchBase: z.string().optional(),
});

/**
 * Identity Provider (IdP) Schema
 * Connects the OS to an external source of truth for identities.
 */
export const AuthProviderSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Provider ID'),
  label: z.string().describe('Button Label (e.g. "Login with Okta")'),
  type: AuthProtocol,
  
  /** Configuration (Polymorphic based on type) */
  config: z.union([
    OIDCConfigSchema,
    SAMLConfigSchema,
    LDAPConfigSchema,
    z.record(z.any()) // Fallback
  ]).describe('Provider specific configuration'),

  /** Visuals */
  icon: z.string().optional().describe('Icon URL or helper class'),
  
  /** Policies */
  active: z.boolean().default(true),
  registrationEnabled: z.boolean().default(false).describe('Allow new users to sign up via this provider'),
});

export type AuthProvider = z.infer<typeof AuthProviderSchema>;
