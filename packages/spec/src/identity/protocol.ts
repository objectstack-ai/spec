// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Authentication Wire Protocol & Constants
 * 
 * Defines the API contract and constants for authentication communication.
 * These constants ensure consistent behavior across all ObjectStack implementations.
 */

/**
 * Authentication Constants
 * Standard headers, prefixes, and identifiers for auth communication
 */
export const AUTH_CONSTANTS = {
  /**
   * HTTP header key for authentication tokens
   */
  HEADER_KEY: 'Authorization',
  
  /**
   * Token prefix for Bearer authentication
   */
  TOKEN_PREFIX: 'Bearer ',
  
  /**
   * Cookie prefix for ObjectStack auth cookies
   */
  COOKIE_PREFIX: 'os_',
  
  /**
   * CSRF token header name
   */
  CSRF_HEADER: 'x-os-csrf-token',
  
  /**
   * Default session cookie name
   */
  SESSION_COOKIE: 'os_session_token',
  
  /**
   * Default CSRF cookie name
   */
  CSRF_COOKIE: 'os_csrf_token',
  
  /**
   * Refresh token cookie name
   */
  REFRESH_TOKEN_COOKIE: 'os_refresh_token',
} as const;

/**
 * Authentication Headers Interface
 * Standard headers used in authenticated requests
 */
export interface AuthHeaders {
  /**
   * Authorization header with Bearer token
   * @example "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  Authorization?: string;
  
  /**
   * CSRF token header
   * @example "x-os-csrf-token: abc123def456..."
   */
  'x-os-csrf-token'?: string;
  
  /**
   * Session ID header (alternative to cookie)
   * @example "x-os-session-id: session_abc123..."
   */
  'x-os-session-id'?: string;
  
  /**
   * API key header (for service-to-service auth)
   * @example "x-os-api-key: sk_live_abc123..."
   */
  'x-os-api-key'?: string;
}

/**
 * Authentication Response Interface
 * Standard response format for authentication operations
 */
export interface AuthResponse {
  /**
   * Access token (JWT or opaque token)
   */
  accessToken: string;
  
  /**
   * Refresh token (for token renewal)
   */
  refreshToken?: string;
  
  /**
   * Token type (usually "Bearer")
   */
  tokenType: string;
  
  /**
   * Token expiry in seconds
   */
  expiresIn: number;
  
  /**
   * User information
   */
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  
  /**
   * Session ID
   */
  sessionId?: string;
}

/**
 * Authentication Error Codes
 * Standard error codes for authentication failures
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_EXPIRED: 'token_expired',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_NOT_VERIFIED: 'account_not_verified',
  TOO_MANY_REQUESTS: 'too_many_requests',
  INVALID_CSRF_TOKEN: 'invalid_csrf_token',
  SESSION_EXPIRED: 'session_expired',
  OAUTH_ERROR: 'oauth_error',
  PROVIDER_ERROR: 'provider_error',
} as const;

/**
 * Authentication Error Interface
 * Standard error response format
 */
export interface AuthError {
  /**
   * Error code from AUTH_ERROR_CODES
   */
  code: typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
  
  /**
   * Human-readable error message
   */
  message: string;
  
  /**
   * Additional error details
   */
  details?: Record<string, any>;
}

/**
 * Token Payload Interface
 * Standard JWT payload structure
 */
export interface TokenPayload {
  /**
   * Subject (user ID)
   */
  sub: string;
  
  /**
   * Issued at timestamp
   */
  iat: number;
  
  /**
   * Expiration timestamp
   */
  exp: number;
  
  /**
   * Session ID
   */
  sid?: string;
  
  /**
   * User email
   */
  email?: string;
  
  /**
   * User roles
   */
  roles?: string[];
  
  /**
   * User permissions
   */
  permissions?: string[];
  
  /**
   * Additional custom claims
   */
  [key: string]: any;
}
