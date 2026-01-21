import { z } from 'zod';

/**
 * Identity & User Model Specification
 * 
 * Defines the standard user, account, and session data models for ObjectStack.
 * These schemas represent "who is logged in" and their associated data.
 * 
 * This is separate from authentication configuration (auth.zod.ts) which
 * defines "how to login".
 */

/**
 * User Schema
 * Core user identity data model
 */
export const UserSchema = z.object({
  /**
   * Unique user identifier
   */
  id: z.string().describe('Unique user identifier'),
  
  /**
   * User's email address (primary identifier)
   */
  email: z.string().email().describe('User email address'),
  
  /**
   * Email verification status
   */
  emailVerified: z.boolean().default(false).describe('Whether email is verified'),
  
  /**
   * User's display name
   */
  name: z.string().optional().describe('User display name'),
  
  /**
   * User's profile image URL
   */
  image: z.string().url().optional().describe('Profile image URL'),
  
  /**
   * Account creation timestamp
   */
  createdAt: z.date().describe('Account creation timestamp'),
  
  /**
   * Last update timestamp
   */
  updatedAt: z.date().describe('Last update timestamp'),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Account Schema
 * Links external OAuth/OIDC/SAML accounts to a user
 */
export const AccountSchema = z.object({
  /**
   * Unique account identifier
   */
  id: z.string().describe('Unique account identifier'),
  
  /**
   * Associated user ID
   */
  userId: z.string().describe('Associated user ID'),
  
  /**
   * Account type/provider
   */
  type: z.enum([
    'oauth',
    'oidc',
    'email',
    'credentials',
    'saml',
    'ldap',
  ]).describe('Account type'),
  
  /**
   * Provider name (e.g., 'google', 'github', 'okta')
   */
  provider: z.string().describe('Provider name'),
  
  /**
   * Provider account ID
   */
  providerAccountId: z.string().describe('Provider account ID'),
  
  /**
   * OAuth refresh token
   */
  refreshToken: z.string().optional().describe('OAuth refresh token'),
  
  /**
   * OAuth access token
   */
  accessToken: z.string().optional().describe('OAuth access token'),
  
  /**
   * Token expiry timestamp
   */
  expiresAt: z.number().optional().describe('Token expiry timestamp (Unix)'),
  
  /**
   * OAuth token type
   */
  tokenType: z.string().optional().describe('OAuth token type'),
  
  /**
   * OAuth scope
   */
  scope: z.string().optional().describe('OAuth scope'),
  
  /**
   * OAuth ID token
   */
  idToken: z.string().optional().describe('OAuth ID token'),
  
  /**
   * Session state
   */
  sessionState: z.string().optional().describe('Session state'),
  
  /**
   * Account creation timestamp
   */
  createdAt: z.date().describe('Account creation timestamp'),
  
  /**
   * Last update timestamp
   */
  updatedAt: z.date().describe('Last update timestamp'),
});

export type Account = z.infer<typeof AccountSchema>;

/**
 * Session Schema
 * User session data model
 */
export const SessionSchema = z.object({
  /**
   * Unique session identifier
   */
  id: z.string().describe('Unique session identifier'),
  
  /**
   * Session token
   */
  sessionToken: z.string().describe('Session token'),
  
  /**
   * Associated user ID
   */
  userId: z.string().describe('Associated user ID'),
  
  /**
   * Session expiry timestamp
   */
  expires: z.date().describe('Session expiry timestamp'),
  
  /**
   * Session creation timestamp
   */
  createdAt: z.date().describe('Session creation timestamp'),
  
  /**
   * Last update timestamp
   */
  updatedAt: z.date().describe('Last update timestamp'),
  
  /**
   * IP address of the session
   */
  ipAddress: z.string().optional().describe('IP address'),
  
  /**
   * User agent string
   */
  userAgent: z.string().optional().describe('User agent string'),
  
  /**
   * Device fingerprint
   */
  fingerprint: z.string().optional().describe('Device fingerprint'),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Verification Token Schema
 * Email verification and password reset tokens
 */
export const VerificationTokenSchema = z.object({
  /**
   * Token identifier (email or phone)
   */
  identifier: z.string().describe('Token identifier (email or phone)'),
  
  /**
   * Verification token
   */
  token: z.string().describe('Verification token'),
  
  /**
   * Token expiry timestamp
   */
  expires: z.date().describe('Token expiry timestamp'),
  
  /**
   * Token creation timestamp
   */
  createdAt: z.date().describe('Token creation timestamp'),
});

export type VerificationToken = z.infer<typeof VerificationTokenSchema>;
