// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Auth Plugin Usage Example
 * 
 * This example demonstrates how to use the AuthPlugin
 * in an ObjectStack application.
 */

import { ObjectKernel } from '@objectstack/core';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';
import { AuthPlugin } from '@objectstack/plugin-auth';

// Create kernel with auth plugin
const kernel = new ObjectKernel({
  plugins: [
    // HTTP server is required for auth routes
    new HonoServerPlugin({
      port: 3000,
    }),
    
    // Auth plugin configuration
    new AuthPlugin({
      secret: process.env.AUTH_SECRET || 'your-secret-key-at-least-32-chars',
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      databaseUrl: process.env.DATABASE_URL,
      
      // OAuth providers (optional)
      providers: [
        {
          id: 'google',
          clientId: process.env.GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          scope: ['email', 'profile'],
        },
        {
          id: 'github',
          clientId: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        },
      ],
      
      // Additional auth features (optional)
      plugins: {
        organization: true,  // Multi-tenant support
        twoFactor: true,     // 2FA support
        passkeys: false,     // Passkey support
        magicLink: true,     // Magic link login
      },
      
      // Session configuration (optional)
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24,     // Update every 24 hours
      },
      
      // Route configuration
      registerRoutes: true,
      basePath: '/api/v1/auth',
    }),
  ],
});

// Initialize the kernel
async function main() {
  try {
    await kernel.init();
    await kernel.start();
    
    console.log('🚀 Server started with auth plugin');
    console.log('📍 Auth endpoints available at:');
    console.log('   - POST http://localhost:3000/api/v1/auth/login');
    console.log('   - POST http://localhost:3000/api/v1/auth/register');
    console.log('   - POST http://localhost:3000/api/v1/auth/logout');
    console.log('   - GET  http://localhost:3000/api/v1/auth/session');
    
    // Access the auth service from the kernel
    const authService = kernel.getService('auth');
    console.log('✅ Auth service registered:', !!authService);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await kernel.destroy();
  process.exit(0);
});

// Start the application
main();
