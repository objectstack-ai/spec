// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { Plugin, PluginContext, IHttpServer, IHttpRequest, IHttpResponse } from '@objectstack/core';
import { AuthConfig } from '@objectstack/spec/system';
import { AuthManager } from './auth-manager.js';

/**
 * Auth Plugin Options
 * Extends AuthConfig from spec with additional runtime options
 */
export interface AuthPluginOptions extends Partial<AuthConfig> {
  /**
   * Whether to automatically register auth routes
   * @default true
   */
  registerRoutes?: boolean;
  
  /**
   * Base path for auth routes
   * @default '/api/v1/auth'
   */
  basePath?: string;
}

/**
 * Authentication Plugin
 * 
 * Provides authentication and identity services for ObjectStack applications.
 * 
 * Features:
 * - Session management
 * - User registration/login
 * - OAuth providers (Google, GitHub, etc.)
 * - Organization/team support
 * - 2FA, passkeys, magic links
 * 
 * This plugin registers:
 * - `auth` service (auth manager instance)
 * - HTTP routes for authentication endpoints
 * 
 * Integrates with better-auth library to provide comprehensive
 * authentication capabilities including email/password, OAuth, 2FA,
 * magic links, passkeys, and organization support.
 */
export class AuthPlugin implements Plugin {
  name = 'com.objectstack.auth';
  type = 'standard';
  version = '1.0.0';
  dependencies = ['com.objectstack.server.hono']; // Requires HTTP server
  
  private options: AuthPluginOptions;
  private authManager: AuthManager | null = null;

  constructor(options: AuthPluginOptions = {}) {
    this.options = {
      registerRoutes: true,
      basePath: '/api/v1/auth',
      ...options
    };
  }

  async init(ctx: PluginContext): Promise<void> {
    ctx.logger.info('Initializing Auth Plugin...');

    // Validate required configuration
    if (!this.options.secret) {
      throw new Error('AuthPlugin: secret is required');
    }

    // Initialize auth manager
    this.authManager = new AuthManager(this.options);

    // Register auth service
    ctx.registerService('auth', this.authManager);
    
    ctx.logger.info('Auth Plugin initialized successfully');
  }

  async start(ctx: PluginContext): Promise<void> {
    ctx.logger.info('Starting Auth Plugin...');

    if (!this.authManager) {
      throw new Error('Auth manager not initialized');
    }

    // Register HTTP routes if enabled
    if (this.options.registerRoutes) {
      try {
        const httpServer = ctx.getService<IHttpServer>('http-server');
        this.registerAuthRoutes(httpServer, ctx);
        ctx.logger.info(`Auth routes registered at ${this.options.basePath}`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ctx.logger.error('Failed to register auth routes:', err);
        throw err;
      }
    }

    ctx.logger.info('Auth Plugin started successfully');
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
    this.authManager = null;
  }

  /**
   * Register authentication routes with HTTP server
   */
  private registerAuthRoutes(httpServer: IHttpServer, ctx: PluginContext): void {
    if (!this.authManager) return;

    const basePath = this.options.basePath || '/api/v1/auth';

    // Login endpoint
    httpServer.post(`${basePath}/login`, async (req: IHttpRequest, res: IHttpResponse) => {
      try {
        const body = req.body;
        const result = await this.authManager!.login(body);
        res.status(200).json(result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ctx.logger.error('Login error:', err);
        res.status(401).json({
          success: false,
          error: err.message,
        });
      }
    });

    // Register endpoint
    httpServer.post(`${basePath}/register`, async (req: IHttpRequest, res: IHttpResponse) => {
      try {
        const body = req.body;
        const result = await this.authManager!.register(body);
        res.status(201).json(result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ctx.logger.error('Registration error:', err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    });

    // Logout endpoint
    httpServer.post(`${basePath}/logout`, async (req: IHttpRequest, res: IHttpResponse) => {
      try {
        const authHeader = req.headers['authorization'];
        const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;
        await this.authManager!.logout(token);
        res.status(200).json({ success: true });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ctx.logger.error('Logout error:', err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    });

    // Session endpoint
    httpServer.get(`${basePath}/session`, async (req: IHttpRequest, res: IHttpResponse) => {
      try {
        const authHeader = req.headers['authorization'];
        const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;
        const session = await this.authManager!.getSession(token);
        res.status(200).json({ success: true, data: session });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(401).json({
          success: false,
          error: err.message,
        });
      }
    });

    ctx.logger.debug('Auth routes registered:', {
      basePath,
      routes: [
        `POST ${basePath}/login`,
        `POST ${basePath}/register`,
        `POST ${basePath}/logout`,
        `GET ${basePath}/session`,
      ],
    });
  }
}



