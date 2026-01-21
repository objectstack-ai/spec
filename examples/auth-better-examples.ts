/**
 * Better-Auth Plugin Example
 * 
 * This example demonstrates how to configure a better-auth authentication provider
 * for an ObjectStack application.
 * 
 * @see https://better-auth.com for more information about better-auth
 */

import type { BetterAuthConfig, BetterAuthProvider } from '@objectstack/spec';

/**
 * Example 1: Basic Email/Password Authentication
 * 
 * Simplest configuration with just email and password login.
 */
export const basicEmailAuth: BetterAuthConfig = {
  name: 'basic_auth',
  label: 'Email Login',
  strategies: ['email_password'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET || 'your-secret-key-min-32-characters-long',
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    requirePasswordComplexity: true,
  },
  
  session: {},
  rateLimit: {},
  csrf: {},
  accountLinking: {},
};

/**
 * Example 2: OAuth with Google and GitHub
 * 
 * Allows users to sign in with Google or GitHub accounts.
 */
export const oauthAuth: BetterAuthConfig = {
  name: 'social_auth',
  label: 'Social Login',
  strategies: ['oauth'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: ['openid', 'profile', 'email'],
        enabled: true,
        displayName: 'Sign in with Google',
      },
      {
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        scopes: ['user:email'],
        enabled: true,
        displayName: 'Sign in with GitHub',
      },
    ],
  },
  
  session: {},
  rateLimit: {},
  csrf: {},
  accountLinking: {
    enabled: true,
    autoLink: true,
    requireVerification: false,
  },
};

/**
 * Example 3: Multi-Strategy Authentication
 * 
 * Comprehensive configuration supporting multiple authentication methods.
 */
export const comprehensiveAuth: BetterAuthConfig = {
  name: 'main_auth',
  label: 'Main Authentication',
  strategies: ['email_password', 'oauth', 'magic_link', 'passkey'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  // Email & Password Configuration
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    requirePasswordComplexity: true,
    allowPasswordReset: true,
    passwordResetExpiry: 3600, // 1 hour
  },
  
  // Magic Link Configuration
  magicLink: {
    enabled: true,
    expiryTime: 900, // 15 minutes
  },
  
  // Passkey (WebAuthn) Configuration
  passkey: {
    enabled: true,
    rpName: 'My App',
    rpId: 'app.example.com',
    userVerification: 'preferred',
    attestation: 'none',
  },
  
  // OAuth Providers
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        enabled: true,
      },
      {
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        enabled: true,
      },
    ],
  },
  
  // Session Configuration
  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    cookieName: 'app_session',
    cookieSecure: true,
    cookieSameSite: 'lax',
  },
  
  // Rate Limiting
  rateLimit: {
    enabled: true,
    maxAttempts: 5,
    windowMs: 900000, // 15 minutes
    blockDuration: 900000, // 15 minutes
  },
  
  // CSRF Protection
  csrf: {
    enabled: true,
    tokenLength: 32,
  },
  
  // Account Linking
  accountLinking: {
    enabled: true,
    autoLink: false,
    requireVerification: true,
  },
  
  // Two-Factor Authentication
  twoFactor: {
    enabled: true,
    issuer: 'My App',
    qrCodeSize: 256,
    backupCodes: {
      enabled: true,
      count: 10,
    },
  },
  
  // Database Configuration
  database: {
    type: 'prisma',
    tablePrefix: 'auth_',
  },
  
  // Lifecycle Hooks
  hooks: {
    beforeSignIn: async ({ email }) => {
      console.log(`User ${email} attempting to sign in`);
    },
    
    afterSignIn: async ({ user, session }) => {
      console.log(`User ${user.id} signed in successfully`);
      // You could log this event, update last login time, etc.
    },
    
    afterSignUp: async ({ user }) => {
      console.log(`New user registered: ${user.email}`);
      // You could send a welcome email, create default data, etc.
    },
  },
  
  // Security Settings
  security: {
    allowedOrigins: ['https://app.example.com', 'https://admin.example.com'],
    trustProxy: true,
    ipRateLimiting: true,
    sessionFingerprinting: true,
    maxSessions: 5,
  },
  
  // Email Configuration
  email: {
    from: 'noreply@example.com',
    fromName: 'My App',
    provider: 'sendgrid',
    config: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
  },
  
  // UI Customization
  ui: {
    brandName: 'My App',
    logo: 'https://app.example.com/logo.png',
    primaryColor: '#007bff',
  },
  
  active: true,
  allowRegistration: true,
};

/**
 * Example 4: Production-Ready Configuration
 * 
 * Enterprise-grade authentication with all security features enabled.
 */
export const productionAuth: BetterAuthConfig = {
  name: 'production_auth',
  label: 'Production Authentication',
  strategies: ['email_password', 'oauth'],
  baseUrl: process.env.APP_URL!,
  secret: process.env.AUTH_SECRET!,
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    requirePasswordComplexity: true,
    allowPasswordReset: true,
    passwordResetExpiry: 3600,
  },
  
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        scopes: ['openid', 'profile', 'email'],
        enabled: true,
      },
    ],
  },
  
  session: {
    expiresIn: 86400 * 30, // 30 days
    updateAge: 86400, // 1 day
    cookieSecure: true,
    cookieSameSite: 'strict',
    cookieHttpOnly: true,
  },
  
  rateLimit: {
    enabled: true,
    maxAttempts: 3,
    windowMs: 600000, // 10 minutes
    blockDuration: 1800000, // 30 minutes
  },
  
  csrf: {
    enabled: true,
    tokenLength: 64,
  },
  
  accountLinking: {
    enabled: true,
    autoLink: false,
    requireVerification: true,
  },
  
  twoFactor: {
    enabled: true,
    issuer: process.env.APP_NAME!,
    backupCodes: {
      enabled: true,
      count: 10,
    },
  },
  
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    trustProxy: true,
    ipRateLimiting: true,
    sessionFingerprinting: true,
    maxSessions: 3,
  },
  
  database: {
    type: 'prisma',
    connectionString: process.env.DATABASE_URL,
    tablePrefix: 'auth_',
  },
  
  email: {
    from: process.env.EMAIL_FROM!,
    fromName: process.env.APP_NAME!,
    provider: 'sendgrid',
    config: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
  },
  
  hooks: {
    beforeSignIn: async ({ email }) => {
      // Log authentication attempts
      console.log(`[AUTH] Sign in attempt: ${email}`);
    },
    
    afterSignIn: async ({ user, session }) => {
      // Audit logging
      console.log(`[AUTH] User ${user.id} authenticated`);
    },
    
    afterSignUp: async ({ user }) => {
      // Send welcome email, create default records, etc.
      console.log(`[AUTH] New user registered: ${user.id}`);
    },
  },
  
  active: true,
  allowRegistration: false, // Registration disabled for security
};

/**
 * Example 5: Better-Auth Provider Wrapper
 * 
 * Wrapping the configuration in the provider schema for use in identity system.
 */
export const betterAuthProvider: BetterAuthProvider = {
  type: 'better_auth',
  config: comprehensiveAuth,
};

/**
 * Example 6: Plugin Configuration for ObjectStack Manifest
 * 
 * How to include better-auth in an ObjectStack plugin manifest.
 */
export const authPluginManifest = {
  id: 'com.example.auth',
  name: 'Authentication Plugin',
  version: '1.0.0',
  type: 'plugin' as const,
  description: 'Better-auth based authentication for ObjectStack',
  
  configuration: {
    title: 'Authentication Settings',
    properties: {
      authConfig: {
        type: 'object' as const,
        description: 'Better-auth configuration',
        required: true,
      },
    },
  },
  
  contributes: {
    events: ['auth.signin', 'auth.signout', 'auth.signup'],
  },
};
