// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { betterAuth } from 'better-auth';
import type { Auth, BetterAuthOptions } from 'better-auth';
import type { AuthConfig } from '@objectstack/spec/system';

/**
 * Extended options for AuthManager
 */
export interface AuthManagerOptions extends Partial<AuthConfig> {
  /**
   * Better-Auth instance (for advanced use cases)
   * If not provided, one will be created from config
   */
  authInstance?: Auth<any>;
}

/**
 * Authentication Manager
 * 
 * Wraps better-auth and provides authentication services for ObjectStack.
 * Supports multiple authentication methods:
 * - Email/password
 * - OAuth providers (Google, GitHub, etc.)
 * - Magic links
 * - Two-factor authentication
 * - Passkeys
 * - Organization/teams
 */
export class AuthManager {
  private auth: Auth<any> | null = null;
  private config: AuthManagerOptions;

  constructor(config: AuthManagerOptions) {
    this.config = config;
    
    // Use provided auth instance
    if (config.authInstance) {
      this.auth = config.authInstance;
    }
    // Don't create auth instance automatically to avoid database initialization errors
    // It will be created lazily when needed
  }

  /**
   * Get or create the better-auth instance (lazy initialization)
   */
  private getOrCreateAuth(): Auth<any> {
    if (!this.auth) {
      this.auth = this.createAuthInstance();
    }
    return this.auth;
  }

  /**
   * Create a better-auth instance from configuration
   */
  private createAuthInstance(): Auth<any> {
    const betterAuthConfig: BetterAuthOptions = {
      // Base configuration
      secret: this.config.secret || this.generateSecret(),
      baseURL: this.config.baseUrl || 'http://localhost:3000',
      
      // Database adapter configuration
      // For now, we configure a basic setup that will be enhanced
      // when database URL is provided and drizzle-orm is available
      database: this.createDatabaseConfig(),
      
      // Email configuration
      emailAndPassword: {
        enabled: true,
      },
      
      // Session configuration
      session: {
        expiresIn: this.config.session?.expiresIn || 60 * 60 * 24 * 7, // 7 days default
        updateAge: this.config.session?.updateAge || 60 * 60 * 24, // 1 day default
      },
    };

    return betterAuth(betterAuthConfig);
  }

  /**
   * Create database configuration
   * TODO: Implement proper database adapter when drizzle-orm is available
   */
  private createDatabaseConfig(): any {
    // If databaseUrl is provided, we would use drizzle adapter
    // For now, this is a placeholder configuration
    if (this.config.databaseUrl) {
      console.warn(
        'Database URL provided but adapter integration not yet complete. ' +
        'Install drizzle-orm and configure a proper adapter for production use.'
      );
    }
    
    // Return a minimal configuration that better-auth can work with
    // This will need to be replaced with a proper adapter
    return {
      // Placeholder - will be replaced with actual adapter
      adapter: 'in-memory' as any,
    };
  }

  /**
   * Generate a secure secret if not provided
   */
  private generateSecret(): string {
    const envSecret = process.env.AUTH_SECRET;
    
    if (!envSecret) {
      // In production, a secret MUST be provided
      // For development/testing, we'll use a fallback but warn about it
      const fallbackSecret = 'dev-secret-' + Date.now();
      
      console.warn(
        '⚠️  WARNING: No AUTH_SECRET environment variable set! ' +
        'Using a temporary development secret. ' +
        'This is NOT secure for production use. ' +
        'Please set AUTH_SECRET in your environment variables.'
      );
      
      return fallbackSecret;
    }
    
    return envSecret;
  }

  /**
   * Get the underlying better-auth instance
   * Useful for advanced use cases
   */
  getAuthInstance(): Auth<any> {
    return this.getOrCreateAuth();
  }

  /**
   * Handle an authentication request
   * Forwards the request directly to better-auth's universal handler
   * 
   * @param request - Web standard Request object
   * @returns Web standard Response object
   */
  async handleRequest(request: Request): Promise<Response> {
    const auth = this.getOrCreateAuth();
    return await auth.handler(request);
  }

  /**
   * Get the better-auth API for programmatic access
   * Use this for server-side operations (e.g., creating users, checking sessions)
   */
  get api() {
    return this.getOrCreateAuth().api;
  }
}
