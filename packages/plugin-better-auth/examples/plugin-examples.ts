/**
 * Better-Auth Plugin Examples
 * 
 * This file demonstrates various configurations for the Better-Auth plugin.
 */

import { createBetterAuthPlugin } from '../src/index';

/**
 * Example 1: Basic Email/Password Authentication
 */
export const basicEmailAuthPlugin = createBetterAuthPlugin({
  strategies: ['email_password'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET || 'your-secret-key-min-32-characters-long',
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    requirePasswordComplexity: true,
    allowPasswordReset: true,
  },
  
  session: {
    expiresIn: 604800, // 7 days
    cookieSecure: true,
    cookieSameSite: 'lax',
  },
  
  rateLimit: {
    enabled: true,
    maxAttempts: 5,
    windowMs: 900000, // 15 minutes
  },
  
  csrf: {
    enabled: true,
  },
});

/**
 * Example 2: OAuth with Social Providers
 */
export const socialAuthPlugin = createBetterAuthPlugin({
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
  
  accountLinking: {
    enabled: true,
    autoLink: true,
  },
  
  session: {
    expiresIn: 2592000, // 30 days
  },
});

/**
 * Example 3: Multi-Strategy Authentication
 */
export const multiStrategyPlugin = createBetterAuthPlugin({
  strategies: ['email_password', 'oauth', 'magic_link'],
  baseUrl: 'https://app.example.com',
  secret: process.env.AUTH_SECRET!,
  
  emailPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
  },
  
  oauth: {
    providers: [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    ],
  },
  
  magicLink: {
    enabled: true,
    expiryTime: 900, // 15 minutes
  },
  
  hooks: {
    beforeSignIn: async ({ email }) => {
      console.log(`User ${email} attempting to sign in`);
    },
    
    afterSignIn: async ({ user, session }) => {
      console.log(`User ${user.id} signed in successfully`);
    },
    
    afterSignUp: async ({ user }) => {
      console.log(`New user registered: ${user.email}`);
      // Send welcome email, create default data, etc.
    },
  },
});

// Export default for easy importing
export default multiStrategyPlugin;
