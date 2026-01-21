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
 * const authConfig: AuthenticationConfig = {
 *   name: 'main_auth',
 *   label: 'Main Authentication',
 *   strategies: ['email_password', 'oauth'],
 *   baseUrl: 'https://app.example.com',
 *   secret: process.env.AUTH_SECRET,
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
export const AuthenticationConfigSchema = z.object({
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
   * User field mapping
   */
  userFieldMapping: UserFieldMappingSchema.default({}),
  
  /**
   * Database adapter configuration
   */
  database: DatabaseAdapterSchema.optional(),
  
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
 * TypeScript type inferred from AuthenticationConfigSchema
 */
export type AuthenticationConfig = z.infer<typeof AuthenticationConfigSchema>;

/**
 * Authentication Provider Schema
 * Wraps the configuration for use in the identity system
 */
export const AuthenticationProviderSchema = z.object({
  type: z.literal('authentication').describe('Provider type identifier'),
  
  config: AuthenticationConfigSchema.describe('Authentication configuration'),
});

export type AuthenticationProvider = z.infer<typeof AuthenticationProviderSchema>;
