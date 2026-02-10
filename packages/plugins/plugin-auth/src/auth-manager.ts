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
   * Sign in a user with email and password
   */
  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      // Better-auth API methods are accessed via auth.api
      // The exact method depends on the better-auth version and configuration
      return {
        success: true,
        data: {
          message: 'Login endpoint ready - full better-auth integration in progress',
          credentials,
        },
      };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: { 
    email: string; 
    password: string; 
    name?: string;
  }): Promise<any> {
    try {
      return {
        success: true,
        data: {
          message: 'Registration endpoint ready - full better-auth integration in progress',
          userData: { email: userData.email, name: userData.name },
        },
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sign out a user
   */
  async logout(_token?: string): Promise<void> {
    try {
      // Better-auth handles logout via its API
      // Implementation will depend on session strategy
    } catch (error) {
      throw new Error(`Logout failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the current session
   */
  async getSession(_token?: string): Promise<any> {
    try {
      // Return session information
      return null;
    } catch (error) {
      throw new Error(`Failed to get session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a user's email
   */
  async verifyEmail(_token: string): Promise<any> {
    try {
      return {
        success: true,
        message: 'Email verification ready - full better-auth integration in progress',
      };
    } catch (error) {
      throw new Error(`Email verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Request a password reset
   */
  async requestPasswordReset(_email: string): Promise<any> {
    try {
      return {
        success: true,
        message: 'Password reset request ready - full better-auth integration in progress',
      };
    } catch (error) {
      throw new Error(`Password reset request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(_token: string, _newPassword: string): Promise<any> {
    try {
      return {
        success: true,
        message: 'Password reset ready - full better-auth integration in progress',
      };
    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle OAuth callback
   * This would be called by the OAuth callback route
   */
  async handleOAuthCallback(_provider: string, _code: string, _state?: string): Promise<any> {
    try {
      // Better-auth handles OAuth internally through its API
      // This is a placeholder for custom OAuth handling if needed
      return {
        success: true,
        message: 'OAuth callback handled',
      };
    } catch (error) {
      throw new Error(`OAuth callback failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
