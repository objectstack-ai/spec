import { PluginDefinition, PluginContextData } from '@objectstack/spec';

/**
 * Better-Auth Configuration Interface
 * 
 * Configuration options for the better-auth authentication plugin.
 */
export interface BetterAuthConfig {
  /** Enabled authentication strategies */
  strategies: Array<'email_password' | 'magic_link' | 'oauth' | 'passkey' | 'otp' | 'anonymous'>;
  
  /** Application base URL */
  baseUrl: string;
  
  /** Secret key for signing tokens (min 32 characters) */
  secret: string;
  
  /** Email/Password configuration */
  emailPassword?: {
    enabled?: boolean;
    requireEmailVerification?: boolean;
    minPasswordLength?: number;
    requirePasswordComplexity?: boolean;
    allowPasswordReset?: boolean;
    passwordResetExpiry?: number;
  };
  
  /** Magic Link configuration */
  magicLink?: {
    enabled?: boolean;
    expiryTime?: number;
  };
  
  /** Passkey (WebAuthn) configuration */
  passkey?: {
    enabled?: boolean;
    rpName: string;
    rpId?: string;
    userVerification?: 'required' | 'preferred' | 'discouraged';
    attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  };
  
  /** OAuth configuration */
  oauth?: {
    providers: Array<{
      provider: 'google' | 'github' | 'facebook' | 'twitter' | 'linkedin' | 'microsoft' | 'apple' | 'discord' | 'gitlab' | 'custom';
      clientId: string;
      clientSecret: string;
      scopes?: string[];
      redirectUri?: string;
      enabled?: boolean;
      displayName?: string;
      icon?: string;
    }>;
  };
  
  /** Session configuration */
  session?: {
    expiresIn?: number;
    updateAge?: number;
    cookieName?: string;
    cookieSecure?: boolean;
    cookieSameSite?: 'strict' | 'lax' | 'none';
    cookieDomain?: string;
    cookiePath?: string;
    cookieHttpOnly?: boolean;
  };
  
  /** Rate limiting configuration */
  rateLimit?: {
    enabled?: boolean;
    maxAttempts?: number;
    windowMs?: number;
    blockDuration?: number;
    skipSuccessfulRequests?: boolean;
  };
  
  /** CSRF protection configuration */
  csrf?: {
    enabled?: boolean;
    tokenLength?: number;
    cookieName?: string;
    headerName?: string;
  };
  
  /** Account linking configuration */
  accountLinking?: {
    enabled?: boolean;
    autoLink?: boolean;
    requireVerification?: boolean;
  };
  
  /** Two-factor authentication configuration */
  twoFactor?: {
    enabled?: boolean;
    issuer?: string;
    qrCodeSize?: number;
    backupCodes?: {
      enabled?: boolean;
      count?: number;
    };
  };
  
  /** Database adapter configuration */
  database?: {
    type: 'prisma' | 'drizzle' | 'kysely' | 'custom';
    connectionString?: string;
    tablePrefix?: string;
    schema?: string;
  };
  
  /** Lifecycle hooks */
  hooks?: {
    beforeSignIn?: (data: { email: string }) => Promise<void>;
    afterSignIn?: (data: { user: any; session: any }) => Promise<void>;
    beforeSignUp?: (data: { email: string; name?: string }) => Promise<void>;
    afterSignUp?: (data: { user: any }) => Promise<void>;
    beforeSignOut?: (data: { sessionId: string }) => Promise<void>;
    afterSignOut?: (data: { sessionId: string }) => Promise<void>;
  };
  
  /** Security settings */
  security?: {
    allowedOrigins?: string[];
    trustProxy?: boolean;
    ipRateLimiting?: boolean;
    sessionFingerprinting?: boolean;
    maxSessions?: number;
  };
  
  /** Email configuration */
  email?: {
    from: string;
    fromName?: string;
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'resend' | 'custom';
    config?: Record<string, any>;
  };
}

/**
 * Better-Auth Plugin Class
 * 
 * Integrates better-auth authentication library into ObjectStack applications.
 */
export class BetterAuthPlugin implements PluginDefinition {
  id = 'com.objectstack.plugin.better-auth';
  version = '1.0.0';
  
  private config: BetterAuthConfig;
  private authInstance: any; // better-auth instance
  
  constructor(config: BetterAuthConfig) {
    this.config = config;
  }
  
  /**
   * Called when the plugin is installed
   */
  async onInstall(context: PluginContextData): Promise<void> {
    const { logger, ql } = context;
    
    logger.info('[Better-Auth] Installing plugin...');
    
    // Create auth tables in database if needed
    if (this.config.database) {
      logger.info('[Better-Auth] Setting up database tables...');
      // In a real implementation, this would create the necessary tables
    }
    
    logger.info('[Better-Auth] Plugin installed successfully');
  }
  
  /**
   * Called when the plugin is enabled
   */
  async onEnable(context: PluginContextData): Promise<void> {
    const { logger, app, storage, os } = context;
    
    logger.info('[Better-Auth] Enabling plugin...');
    
    // Initialize better-auth (in real implementation, would use actual better-auth library)
    this.authInstance = this.initializeAuth();
    
    // Register authentication routes
    this.registerRoutes(app.router, logger);
    
    // Store configuration
    await storage.set('better-auth:config', this.config);
    
    logger.info('[Better-Auth] Plugin enabled successfully');
    logger.info(`[Better-Auth] Strategies: ${this.config.strategies.join(', ')}`);
  }
  
  /**
   * Called when the plugin is disabled
   */
  async onDisable(context: PluginContextData): Promise<void> {
    const { logger } = context;
    
    logger.info('[Better-Auth] Disabling plugin...');
    
    // Cleanup resources
    this.authInstance = null;
    
    logger.info('[Better-Auth] Plugin disabled');
  }
  
  /**
   * Called when the plugin is uninstalled
   */
  async onUninstall(context: PluginContextData): Promise<void> {
    const { logger, storage } = context;
    
    logger.info('[Better-Auth] Uninstalling plugin...');
    
    // Remove stored configuration
    await storage.delete('better-auth:config');
    
    // In a real implementation, might ask user if they want to keep database tables
    
    logger.info('[Better-Auth] Plugin uninstalled');
  }
  
  /**
   * Initialize the better-auth instance
   */
  private initializeAuth(): any {
    // In a real implementation, this would create a better-auth instance
    // with the provided configuration
    
    const auth = {
      strategies: this.config.strategies,
      config: this.config,
    };
    
    return auth;
  }
  
  /**
   * Register authentication routes
   */
  private registerRoutes(router: any, logger: any): void {
    // Sign In route
    router.post('/auth/signin', async (req: any, res: any) => {
      logger.info('[Better-Auth] Sign in request');
      
      // Execute beforeSignIn hook
      if (this.config.hooks?.beforeSignIn) {
        await this.config.hooks.beforeSignIn({ email: req.body.email });
      }
      
      // In real implementation, would call better-auth sign in
      const user = { id: '123', email: req.body.email };
      const session = { id: 'session-123', userId: '123' };
      
      // Execute afterSignIn hook
      if (this.config.hooks?.afterSignIn) {
        await this.config.hooks.afterSignIn({ user, session });
      }
      
      return { success: true, user, session };
    });
    
    // Sign Up route
    router.post('/auth/signup', async (req: any, res: any) => {
      logger.info('[Better-Auth] Sign up request');
      
      // Execute beforeSignUp hook
      if (this.config.hooks?.beforeSignUp) {
        await this.config.hooks.beforeSignUp({ 
          email: req.body.email, 
          name: req.body.name 
        });
      }
      
      // In real implementation, would call better-auth sign up
      const user = { id: '123', email: req.body.email, name: req.body.name };
      
      // Execute afterSignUp hook
      if (this.config.hooks?.afterSignUp) {
        await this.config.hooks.afterSignUp({ user });
      }
      
      return { success: true, user };
    });
    
    // Sign Out route
    router.post('/auth/signout', async (req: any, res: any) => {
      logger.info('[Better-Auth] Sign out request');
      
      const sessionId = req.body.sessionId || 'session-123';
      
      // Execute beforeSignOut hook
      if (this.config.hooks?.beforeSignOut) {
        await this.config.hooks.beforeSignOut({ sessionId });
      }
      
      // In real implementation, would call better-auth sign out
      
      // Execute afterSignOut hook
      if (this.config.hooks?.afterSignOut) {
        await this.config.hooks.afterSignOut({ sessionId });
      }
      
      return { success: true };
    });
    
    // OAuth routes (if OAuth is enabled)
    if (this.config.oauth) {
      this.config.oauth.providers.forEach((provider) => {
        if (provider.enabled !== false) {
          router.get(`/auth/oauth/${provider.provider}`, async (req: any, res: any) => {
            logger.info(`[Better-Auth] OAuth redirect for ${provider.provider}`);
            // In real implementation, would redirect to OAuth provider
            return { redirect: `https://${provider.provider}.com/oauth/authorize` };
          });
          
          router.get(`/auth/oauth/${provider.provider}/callback`, async (req: any, res: any) => {
            logger.info(`[Better-Auth] OAuth callback for ${provider.provider}`);
            // In real implementation, would handle OAuth callback
            return { success: true };
          });
        }
      });
    }
    
    // Magic Link routes (if magic link is enabled)
    if (this.config.strategies.includes('magic_link')) {
      router.post('/auth/magic-link/send', async (req: any, res: any) => {
        logger.info('[Better-Auth] Sending magic link');
        // In real implementation, would send magic link email
        return { success: true, message: 'Magic link sent' };
      });
      
      router.get('/auth/magic-link/verify', async (req: any, res: any) => {
        logger.info('[Better-Auth] Verifying magic link');
        // In real implementation, would verify magic link token
        return { success: true };
      });
    }
    
    // Status route
    router.get('/auth/status', async () => {
      return {
        status: 'active',
        strategies: this.config.strategies,
        version: this.version,
      };
    });
    
    logger.info('[Better-Auth] Routes registered successfully');
  }
}

/**
 * Create a Better-Auth plugin instance
 */
export function createBetterAuthPlugin(config: BetterAuthConfig): PluginDefinition {
  return new BetterAuthPlugin(config);
}

/**
 * Default export following ObjectStack plugin conventions
 */
export default createBetterAuthPlugin;
