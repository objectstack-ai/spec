import { z } from 'zod';

/**
 * Authentication Protocol
 * 
 * Defines the standard authentication specification for the ObjectStack ecosystem.
 * This protocol supports multiple authentication strategies, session management,
 * and comprehensive security features.
 * 
 * This is a framework-agnostic specification that can be implemented with any
 * authentication library (better-auth, Auth.js, Passport, etc.)
 */

/**
 * Supported authentication strategies
 */
export const AuthStrategy = z.enum([
  'email_password',  // Traditional email & password authentication
  'magic_link',      // Passwordless email magic link
  'oauth',           // OAuth2 providers (Google, GitHub, etc.)
  'passkey',         // WebAuthn / FIDO2 passkeys
  'otp',             // One-time password (SMS, Email)
  'anonymous',       // Anonymous/guest sessions
]);

export type AuthStrategy = z.infer<typeof AuthStrategy>;

/**
 * OAuth Provider Configuration
 * Supports popular OAuth2 providers
 */
export const OAuthProviderSchema = z.object({
  provider: z.enum([
    'google',
    'github',
    'facebook',
    'twitter',
    'linkedin',
    'microsoft',
    'apple',
    'discord',
    'gitlab',
    'custom',
  ]).describe('OAuth provider type'),
  
  clientId: z.string().describe('OAuth client ID'),
  clientSecret: z.string().describe('OAuth client secret (typically from ENV)'),
  
  scopes: z.array(z.string()).optional().describe('Requested OAuth scopes'),
  
  redirectUri: z.string().url().optional().describe('OAuth callback URL'),
  
  enabled: z.boolean().default(true).describe('Whether this provider is enabled'),
  
  displayName: z.string().optional().describe('Display name for the provider button'),
  
  icon: z.string().optional().describe('Icon URL or identifier'),
});

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

/**
 * Email & Password Strategy Configuration
 */
export const EmailPasswordConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  requireEmailVerification: z.boolean().default(true).describe('Require email verification before login'),
  
  minPasswordLength: z.number().min(6).max(128).default(8).describe('Minimum password length'),
  
  requirePasswordComplexity: z.boolean().default(true).describe('Require uppercase, lowercase, numbers, symbols'),
  
  allowPasswordReset: z.boolean().default(true).describe('Enable password reset functionality'),
  
  passwordResetExpiry: z.number().default(3600).describe('Password reset token expiry in seconds'),
});

export type EmailPasswordConfig = z.infer<typeof EmailPasswordConfigSchema>;

/**
 * Magic Link Strategy Configuration
 */
export const MagicLinkConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  expiryTime: z.number().default(900).describe('Magic link expiry time in seconds (default 15 min)'),
  
  sendEmail: z.function()
    .args(z.object({
      to: z.string().email(),
      link: z.string().url(),
      token: z.string(),
    }))
    .returns(z.promise(z.void()))
    .optional()
    .describe('Custom email sending function'),
});

export type MagicLinkConfig = z.infer<typeof MagicLinkConfigSchema>;

/**
 * Passkey (WebAuthn) Strategy Configuration
 */
export const PasskeyConfigSchema = z.object({
  enabled: z.boolean().default(false),
  
  rpName: z.string().describe('Relying Party name'),
  
  rpId: z.string().optional().describe('Relying Party ID (defaults to domain)'),
  
  allowedOrigins: z.array(z.string().url()).optional().describe('Allowed origins for WebAuthn'),
  
  userVerification: z.enum(['required', 'preferred', 'discouraged']).default('preferred'),
  
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).default('none'),
});

export type PasskeyConfig = z.infer<typeof PasskeyConfigSchema>;

/**
 * Session Configuration
 */
export const SessionConfigSchema = z.object({
  expiresIn: z.number().default(86400 * 7).describe('Session expiry in seconds (default 7 days)'),
  
  updateAge: z.number().default(86400).describe('Session update interval in seconds (default 1 day)'),
  
  cookieName: z.string().default('session_token').describe('Session cookie name'),
  
  cookieSecure: z.boolean().default(true).describe('Use secure cookies (HTTPS only)'),
  
  cookieSameSite: z.enum(['strict', 'lax', 'none']).default('lax').describe('SameSite cookie attribute'),
  
  cookieDomain: z.string().optional().describe('Cookie domain'),
  
  cookiePath: z.string().default('/').describe('Cookie path'),
  
  cookieHttpOnly: z.boolean().default(true).describe('HttpOnly cookie attribute'),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

/**
 * Rate Limiting Configuration
 */
export const RateLimitConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  maxAttempts: z.number().default(5).describe('Maximum login attempts'),
  
  windowMs: z.number().default(900000).describe('Time window in milliseconds (default 15 min)'),
  
  blockDuration: z.number().default(900000).describe('Block duration after max attempts in ms'),
  
  skipSuccessfulRequests: z.boolean().default(false).describe('Only count failed requests'),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

/**
 * CSRF Protection Configuration
 */
export const CSRFConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  tokenLength: z.number().default(32).describe('CSRF token length'),
  
  cookieName: z.string().default('csrf_token').describe('CSRF cookie name'),
  
  headerName: z.string().default('X-CSRF-Token').describe('CSRF header name'),
});

export type CSRFConfig = z.infer<typeof CSRFConfigSchema>;

/**
 * Account Linking Configuration
 * Allows linking multiple auth methods to a single user account
 */
export const AccountLinkingConfigSchema = z.object({
  enabled: z.boolean().default(true).describe('Allow account linking'),
  
  autoLink: z.boolean().default(false).describe('Automatically link accounts with same email'),
  
  requireVerification: z.boolean().default(true).describe('Require email verification before linking'),
});

export type AccountLinkingConfig = z.infer<typeof AccountLinkingConfigSchema>;

/**
 * Two-Factor Authentication (2FA) Configuration
 */
export const TwoFactorConfigSchema = z.object({
  enabled: z.boolean().default(false),
  
  issuer: z.string().optional().describe('TOTP issuer name'),
  
  qrCodeSize: z.number().default(200).describe('QR code size in pixels'),
  
  backupCodes: z.object({
    enabled: z.boolean().default(true),
    count: z.number().default(10).describe('Number of backup codes to generate'),
  }).optional(),
});

export type TwoFactorConfig = z.infer<typeof TwoFactorConfigSchema>;

/**
 * OIDC / OAuth2 Enterprise Configuration
 * OpenID Connect configuration for enterprise SSO
 */
export const OIDCConfigSchema = z.object({
  enabled: z.boolean().default(false),
  
  issuer: z.string().url().describe('OIDC Issuer URL (.well-known/openid-configuration)'),
  
  clientId: z.string().describe('OIDC client ID'),
  
  clientSecret: z.string().describe('OIDC client secret'),
  
  scopes: z.array(z.string()).default(['openid', 'profile', 'email']).describe('OIDC scopes'),
  
  attributeMapping: z.record(z.string()).optional().describe('Map IdP claims to User fields'),
  
  displayName: z.string().optional().describe('Display name for the provider button'),
  
  icon: z.string().optional().describe('Icon URL or identifier'),
});

export type OIDCConfig = z.infer<typeof OIDCConfigSchema>;

/**
 * SAML 2.0 Enterprise Configuration
 * SAML configuration for legacy enterprise SSO
 */
export const SAMLConfigSchema = z.object({
  enabled: z.boolean().default(false),
  
  entryPoint: z.string().url().describe('IdP SSO URL'),
  
  cert: z.string().describe('IdP Public Certificate (PEM format)'),
  
  issuer: z.string().describe('Entity ID of the IdP'),
  
  signatureAlgorithm: z.enum(['sha256', 'sha512']).default('sha256').describe('Signature algorithm'),
  
  attributeMapping: z.record(z.string()).optional().describe('Map SAML attributes to User fields'),
  
  displayName: z.string().optional().describe('Display name for the provider button'),
  
  icon: z.string().optional().describe('Icon URL or identifier'),
});

export type SAMLConfig = z.infer<typeof SAMLConfigSchema>;

/**
 * LDAP / Active Directory Enterprise Configuration
 * LDAP configuration for on-premise directory services
 */
export const LDAPConfigSchema = z.object({
  enabled: z.boolean().default(false),
  
  url: z.string().url().describe('LDAP Server URL (ldap:// or ldaps://)'),
  
  bindDn: z.string().describe('Bind DN for LDAP authentication'),
  
  bindCredentials: z.string().describe('Bind credentials'),
  
  searchBase: z.string().describe('Search base DN'),
  
  searchFilter: z.string().describe('Search filter'),
  
  groupSearchBase: z.string().optional().describe('Group search base DN'),
  
  displayName: z.string().optional().describe('Display name for the provider button'),
  
  icon: z.string().optional().describe('Icon URL or identifier'),
});

export type LDAPConfig = z.infer<typeof LDAPConfigSchema>;

/**
 * Enterprise Authentication Configuration
 * Combines SAML, LDAP, and OIDC configurations for enterprise SSO
 */
export const EnterpriseAuthConfigSchema = z.object({
  oidc: OIDCConfigSchema.optional().describe('OpenID Connect configuration'),
  
  saml: SAMLConfigSchema.optional().describe('SAML 2.0 configuration'),
  
  ldap: LDAPConfigSchema.optional().describe('LDAP/Active Directory configuration'),
});

export type EnterpriseAuthConfig = z.infer<typeof EnterpriseAuthConfigSchema>;

/**
 * User Field Mapping Configuration
 * Maps authentication user fields to ObjectStack user object fields
 */
export const UserFieldMappingSchema = z.object({
  id: z.string().default('id').describe('User ID field'),
  email: z.string().default('email').describe('Email field'),
  name: z.string().default('name').describe('Name field'),
  image: z.string().default('image').optional().describe('Profile image field'),
  emailVerified: z.string().default('email_verified').describe('Email verification status field'),
  createdAt: z.string().default('created_at').describe('Created timestamp field'),
  updatedAt: z.string().default('updated_at').describe('Updated timestamp field'),
});

export type UserFieldMapping = z.infer<typeof UserFieldMappingSchema>;

/**
 * Database Adapter Configuration
 */
export const DatabaseAdapterSchema = z.object({
  type: z.enum(['prisma', 'drizzle', 'kysely', 'custom']).describe('Database adapter type'),
  
  connectionString: z.string().optional().describe('Database connection string'),
  
  tablePrefix: z.string().default('auth_').describe('Prefix for auth tables'),
  
  schema: z.string().optional().describe('Database schema name'),
});

export type DatabaseAdapter = z.infer<typeof DatabaseAdapterSchema>;

/**
 * Default field mappings for better-auth compatibility
 * These mappings bridge the gap between ObjectStack standard (Auth.js conventions)
 * and better-auth's field naming conventions
 */
export const BETTER_AUTH_FIELD_MAPPINGS = {
  session: {
    sessionToken: 'token',
    expires: 'expiresAt',
  },
  account: {
    providerAccountId: 'accountId',
    provider: 'providerId',
  },
} as const;

/**
 * Database Field Mapping Configuration
 * Maps ObjectStack standard field names to driver-specific field names.
 * 
 * Useful when the underlying authentication driver (e.g., better-auth) uses
 * different column names than the ObjectStack standard schemas (which follow
 * Auth.js conventions).
 * 
 * @example
 * ```typescript
 * mapping: {
 *   session: {
 *     sessionToken: 'token',      // better-auth uses 'token'
 *     expires: 'expiresAt'        // better-auth uses 'expiresAt'
 *   },
 *   account: {
 *     providerAccountId: 'accountId',  // better-auth uses 'accountId'
 *     provider: 'providerId'           // better-auth uses 'providerId'
 *   }
 * }
 * ```
 */
export const DatabaseMappingSchema = z.object({
  /**
   * User model field mapping
   * Maps ObjectStack User fields to driver fields
   */
  user: z.record(z.string()).optional().describe('User field mapping (e.g., { "emailVerified": "email_verified" })'),
  
  /**
   * Session model field mapping
   * Maps ObjectStack Session fields to driver fields
   */
  session: z.record(z.string()).default(BETTER_AUTH_FIELD_MAPPINGS.session).describe('Session field mapping'),
  
  /**
   * Account model field mapping
   * Maps ObjectStack Account fields to driver fields
   */
  account: z.record(z.string()).default(BETTER_AUTH_FIELD_MAPPINGS.account).describe('Account field mapping'),
  
  /**
   * Verification token field mapping
   * Maps ObjectStack VerificationToken fields to driver fields
   */
  verificationToken: z.record(z.string()).optional().describe('VerificationToken field mapping'),
});

export type DatabaseMapping = z.infer<typeof DatabaseMappingSchema>;

/**
 * Authentication Plugin Configuration
 * Extends authentication with additional features
 */
export const AuthPluginConfigSchema = z.object({
  name: z.string().describe('Plugin name'),
  
  enabled: z.boolean().default(true),
  
  options: z.record(z.any()).optional().describe('Plugin-specific options'),
});

export type AuthPluginConfig = z.infer<typeof AuthPluginConfigSchema>;

/**
 * Complete Authentication Configuration Schema
 * 
 * This is the main configuration object for authentication
 * in an ObjectStack application.
 * 
 * @example
 * ```typescript
 * const authConfig: AuthConfig = {
 *   name: 'main_auth',
 *   label: 'Main Authentication',
 *   strategies: ['email_password', 'oauth'],
 *   baseUrl: 'https://app.example.com',
 *   secret: process.env.AUTH_SECRET,
 *   driver: 'better-auth', // Optional, defaults to 'better-auth'
 *   emailPassword: {
 *     enabled: true,
 *     minPasswordLength: 8,
 *   },
 *   oauth: {
 *     providers: [{
 *       provider: 'google',
 *       clientId: process.env.GOOGLE_CLIENT_ID,
 *       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
 *     }],
 *   },
 *   session: {
 *     expiresIn: 604800, // 7 days
 *   },
 * };
 * ```
 */
export const AuthConfigSchema = z.object({
  /**
   * Unique identifier for this auth configuration
   * Must be in snake_case following ObjectStack conventions
   */
  name: z.string()
    .regex(/^[a-z_][a-z0-9_]*$/)
    .describe('Configuration name (snake_case)'),
  
  /**
   * Human-readable label
   */
  label: z.string().describe('Display label'),
  
  /**
   * The underlying authentication implementation driver
   * Default: 'better-auth' (the reference implementation)
   * Can be: 'better-auth', 'auth-js', 'passport', or custom driver name
   */
  driver: z.string().default('better-auth').describe('The underlying authentication implementation driver'),
  
  /**
   * Enabled authentication strategies
   */
  strategies: z.array(AuthStrategy).min(1).describe('Enabled authentication strategies'),
  
  /**
   * Base URL for the application
   */
  baseUrl: z.string().url().describe('Application base URL'),
  
  /**
   * Secret key for signing tokens and cookies
   * Should be loaded from environment variables
   */
  secret: z.string().min(32).describe('Secret key for signing (min 32 chars)'),
  
  /**
   * Email & Password configuration
   */
  emailPassword: EmailPasswordConfigSchema.optional(),
  
  /**
   * Magic Link configuration
   */
  magicLink: MagicLinkConfigSchema.optional(),
  
  /**
   * Passkey (WebAuthn) configuration
   */
  passkey: PasskeyConfigSchema.optional(),
  
  /**
   * OAuth configuration
   */
  oauth: z.object({
    providers: z.array(OAuthProviderSchema).min(1),
  }).optional(),
  
  /**
   * Session configuration
   */
  session: SessionConfigSchema.default({}),
  
  /**
   * Rate limiting configuration
   */
  rateLimit: RateLimitConfigSchema.default({}),
  
  /**
   * CSRF protection configuration
   */
  csrf: CSRFConfigSchema.default({}),
  
  /**
   * Account linking configuration
   */
  accountLinking: AccountLinkingConfigSchema.default({}),
  
  /**
   * Two-factor authentication configuration
   */
  twoFactor: TwoFactorConfigSchema.optional(),
  
  /**
   * Enterprise authentication configuration (SAML, LDAP, OIDC)
   */
  enterprise: EnterpriseAuthConfigSchema.optional(),
  
  /**
   * User field mapping
   */
  userFieldMapping: UserFieldMappingSchema.default({}),
  
  /**
   * Database adapter configuration
   */
  database: DatabaseAdapterSchema.optional(),
  
  /**
   * Database field mapping configuration
   * Maps ObjectStack standard field names to driver-specific field names.
   * 
   * This is distinct from the database adapter configuration and provides
   * instructions for the driver to map our standard schema fields to the
   * underlying engine's fields (e.g., better-auth uses 'token' instead of 'sessionToken').
   */
  mapping: DatabaseMappingSchema.optional(),
  
  /**
   * Additional authentication plugins
   */
  plugins: z.array(AuthPluginConfigSchema).default([]),
  
  /**
   * Custom hooks for authentication events
   */
  hooks: z.object({
    beforeSignIn: z.function()
      .args(z.object({ email: z.string() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called before user sign in'),
    
    afterSignIn: z.function()
      .args(z.object({ user: z.any(), session: z.any() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called after user sign in'),
    
    beforeSignUp: z.function()
      .args(z.object({ email: z.string(), name: z.string().optional() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called before user registration'),
    
    afterSignUp: z.function()
      .args(z.object({ user: z.any() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called after user registration'),
    
    beforeSignOut: z.function()
      .args(z.object({ sessionId: z.string() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called before user sign out'),
    
    afterSignOut: z.function()
      .args(z.object({ sessionId: z.string() }))
      .returns(z.promise(z.void()))
      .optional()
      .describe('Called after user sign out'),
  }).optional().describe('Authentication lifecycle hooks'),
  
  /**
   * Advanced security settings
   */
  security: z.object({
    allowedOrigins: z.array(z.string()).optional().describe('CORS allowed origins'),
    
    trustProxy: z.boolean().default(false).describe('Trust proxy headers'),
    
    ipRateLimiting: z.boolean().default(true).describe('Enable IP-based rate limiting'),
    
    sessionFingerprinting: z.boolean().default(true).describe('Enable session fingerprinting'),
    
    maxSessions: z.number().default(5).describe('Maximum concurrent sessions per user'),
  }).optional().describe('Advanced security settings'),
  
  /**
   * Email configuration for transactional emails
   */
  email: z.object({
    from: z.string().email().describe('From email address'),
    
    fromName: z.string().optional().describe('From name'),
    
    provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses', 'resend', 'custom']).describe('Email provider'),
    
    config: z.record(z.any()).optional().describe('Provider-specific configuration'),
  }).optional().describe('Email configuration'),
  
  /**
   * UI customization options
   */
  ui: z.object({
    brandName: z.string().optional().describe('Brand name displayed in auth UI'),
    
    logo: z.string().optional().describe('Logo URL'),
    
    primaryColor: z.string().optional().describe('Primary brand color (hex)'),
    
    customCss: z.string().optional().describe('Custom CSS for auth pages'),
  }).optional().describe('UI customization'),
  
  /**
   * Whether this auth provider is active
   */
  active: z.boolean().default(true).describe('Whether this provider is active'),
  
  /**
   * Whether to allow new user registration
   */
  allowRegistration: z.boolean().default(true).describe('Allow new user registration'),
});

/**
 * TypeScript type inferred from AuthConfigSchema
 */
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

/**
 * Standard Authentication Provider Schema
 * Wraps the configuration for use in the identity system
 */
export const StandardAuthProviderSchema = z.object({
  type: z.literal('standard_auth').describe('Provider type identifier'),
  
  config: AuthConfigSchema.describe('Standard authentication configuration'),
});

export type StandardAuthProvider = z.infer<typeof StandardAuthProviderSchema>;
