// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { ObjectStackClient } from '@objectstack/client';
import { readAuthConfig } from './auth-config.js';

/**
 * API client configuration options for CLI commands
 */
export interface ApiClientOptions {
  /**
   * Server URL (defaults to OBJECTSTACK_URL env var or http://localhost:3000)
   */
  url?: string;
  /**
   * Authentication token (defaults to stored credentials or OBJECTSTACK_TOKEN env var)
   */
  token?: string;
  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Create an authenticated ObjectStack API client for CLI commands.
 *
 * Resolves configuration in this priority order:
 * 1. Explicit options passed to the function
 * 2. Environment variables (OBJECTSTACK_URL, OBJECTSTACK_TOKEN)
 * 3. Stored credentials from `os auth login`
 * 4. Defaults (http://localhost:3000)
 */
export async function createApiClient(options: ApiClientOptions = {}): Promise<ObjectStackClient> {
  // Resolve server URL
  const baseUrl = options.url ||
    process.env.OBJECTSTACK_URL ||
    'http://localhost:3000';

  // Resolve authentication token
  let token = options.token || process.env.OBJECTSTACK_TOKEN;

  // If no token provided via options or env, try to load from stored credentials
  if (!token) {
    try {
      const authConfig = await readAuthConfig();
      token = authConfig.token;
    } catch {
      // No stored credentials - commands will fail if auth is required
    }
  }

  // Create and return the client
  return new ObjectStackClient({
    baseUrl,
    token,
    debug: options.debug || false,
  });
}

/**
 * Ensure authentication is present, throwing an error if not.
 * Use this in commands that require authentication.
 */
export function requireAuth(token?: string): void {
  if (!token) {
    throw new Error(
      'Authentication required. Please run `os auth login` or set OBJECTSTACK_TOKEN environment variable.'
    );
  }
}
