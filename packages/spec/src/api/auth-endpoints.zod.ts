// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * Authentication Endpoint Specification
 * 
 * Defines the canonical HTTP endpoints for the authentication service.
 * Based on better-auth v1.4.18 endpoint conventions.
 * 
 * NOTE: ObjectStack's auth implementation uses better-auth library which has
 * established endpoint conventions. This spec documents those conventions as
 * the canonical API contract.
 */

// ==========================================
// Endpoint Path Definitions
// ==========================================

/**
 * Authentication Endpoint Paths
 * 
 * These are the paths relative to the auth base route (e.g., /api/v1/auth).
 * Based on better-auth's endpoint structure.
 */
export const AuthEndpointPaths = {
  // Email/Password Authentication
  signInEmail: '/sign-in/email',
  signUpEmail: '/sign-up/email',
  signOut: '/sign-out',
  
  // Session Management
  getSession: '/get-session',
  
  // Password Management
  forgetPassword: '/forget-password',
  resetPassword: '/reset-password',
  
  // Email Verification
  sendVerificationEmail: '/send-verification-email',
  verifyEmail: '/verify-email',
  
  // OAuth (dynamic based on provider)
  // authorize: '/authorize/:provider'
  // callback: '/callback/:provider'
  
  // 2FA (when enabled)
  twoFactorEnable: '/two-factor/enable',
  twoFactorVerify: '/two-factor/verify',
  
  // Passkeys (when enabled)
  passkeyRegister: '/passkey/register',
  passkeyAuthenticate: '/passkey/authenticate',
  
  // Magic Links (when enabled)
  magicLinkSend: '/magic-link/send',
  magicLinkVerify: '/magic-link/verify',
} as const;

/**
 * HTTP Method + Path Specification
 * 
 * Defines the complete HTTP contract for each endpoint.
 */
export const AuthEndpointSchema = z.object({
  /** Sign in with email and password */
  signInEmail: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.signInEmail),
    description: z.literal('Sign in with email and password'),
  }),
  
  /** Register new user with email and password */
  signUpEmail: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.signUpEmail),
    description: z.literal('Register new user with email and password'),
  }),
  
  /** Sign out current user */
  signOut: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.signOut),
    description: z.literal('Sign out current user'),
  }),
  
  /** Get current user session */
  getSession: z.object({
    method: z.literal('GET'),
    path: z.literal(AuthEndpointPaths.getSession),
    description: z.literal('Get current user session'),
  }),
  
  /** Request password reset email */
  forgetPassword: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.forgetPassword),
    description: z.literal('Request password reset email'),
  }),
  
  /** Reset password with token */
  resetPassword: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.resetPassword),
    description: z.literal('Reset password with token'),
  }),
  
  /** Send email verification */
  sendVerificationEmail: z.object({
    method: z.literal('POST'),
    path: z.literal(AuthEndpointPaths.sendVerificationEmail),
    description: z.literal('Send email verification link'),
  }),
  
  /** Verify email with token */
  verifyEmail: z.object({
    method: z.literal('GET'),
    path: z.literal(AuthEndpointPaths.verifyEmail),
    description: z.literal('Verify email with token'),
  }),
});

/**
 * Endpoint Aliases
 * 
 * Common aliases for better developer experience.
 * These map to the canonical better-auth endpoints.
 */
export const AuthEndpointAliases = {
  login: AuthEndpointPaths.signInEmail,
  register: AuthEndpointPaths.signUpEmail,
  logout: AuthEndpointPaths.signOut,
  me: AuthEndpointPaths.getSession,
} as const;

/**
 * Full Endpoint URLs
 * 
 * Helper to construct full endpoint URLs given a base path.
 */
export function getAuthEndpointUrl(basePath: string, endpoint: keyof typeof AuthEndpointPaths): string {
  const cleanBase = basePath.replace(/\/$/, '');
  return `${cleanBase}${AuthEndpointPaths[endpoint]}`;
}

/**
 * Endpoint Mapping
 * 
 * Maps common/legacy endpoint names to canonical better-auth paths.
 * This allows clients to use simpler names while maintaining compatibility.
 */
export const EndpointMapping = {
  '/login': AuthEndpointPaths.signInEmail,
  '/register': AuthEndpointPaths.signUpEmail,
  '/logout': AuthEndpointPaths.signOut,
  '/me': AuthEndpointPaths.getSession,
  '/refresh': AuthEndpointPaths.getSession, // Session refresh handled by better-auth automatically
} as const;

// ==========================================
// Type Exports
// ==========================================

export type AuthEndpoint = z.infer<typeof AuthEndpointSchema>;
export type AuthEndpointPath = typeof AuthEndpointPaths[keyof typeof AuthEndpointPaths];
export type AuthEndpointAlias = keyof typeof AuthEndpointAliases;
export type EndpointMappingKey = keyof typeof EndpointMapping;
