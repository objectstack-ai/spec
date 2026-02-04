import { z } from 'zod';
import { BaseResponseSchema } from './contract.zod';

/**
 * Authentication Service Protocol
 * 
 * Defines the standard API contracts for Identity, Session Management,
 * and Access Control.
 */

// ==========================================
// Authentication Types
// ==========================================

export const AuthProvider = z.enum([
  'local',
  'google',
  'github',
  'microsoft',
  'ldap',
  'saml'
]);

export const SessionUserSchema = z.object({
  id: z.string().describe('User ID'),
  username: z.string().describe('Username'),
  email: z.string().email().describe('Email address'),
  name: z.string().describe('Display name'),
  roles: z.array(z.string()).describe('Assigned role IDs'),
  tenantId: z.string().describe('Current tenant ID'),
  avatar: z.string().optional().describe('Avatar URL'),
  language: z.string().default('en').describe('Preferred language'),
  timezone: z.string().optional().describe('Preferred timezone'),
});

// ==========================================
// Requests
// ==========================================

export const LoginRequestSchema = z.object({
  username: z.string().describe('Username or Email'),
  password: z.string().describe('Password credential'),
  type: z.literal('password').default('password'),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().describe('Refresh token'),
});

// ==========================================
// Responses
// ==========================================

export const SessionResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    accessToken: z.string().describe('JWT Access Token'),
    refreshToken: z.string().optional().describe('Refresh Token (if enabled)'),
    expiresIn: z.number().describe('Token expiry in seconds'),
    user: SessionUserSchema.describe('Current user details'),
  }),
});

export const UserProfileResponseSchema = BaseResponseSchema.extend({
  data: SessionUserSchema,
});
