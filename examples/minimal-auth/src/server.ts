// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Minimal Authentication Example
 * 
 * This example demonstrates how to set up authentication in an ObjectStack application
 * using the @objectstack/plugin-auth package.
 */

import { ObjectKernel } from '@objectstack/core';
import { ObjectQL } from '@objectstack/objectql';
import { InMemoryDriver } from '@objectstack/driver-memory';
import { HonoServerPlugin } from '@objectstack/plugin-hono-server';
import { AuthPlugin } from '@objectstack/plugin-auth';

async function main() {
  console.log('🚀 Starting Minimal Auth Example...\n');

  // 1. Create ObjectQL instance with in-memory driver
  const objectql = new ObjectQL();
  await objectql.registerDriver(new InMemoryDriver());

  // 2. Create kernel
  const kernel = new ObjectKernel();

  // 3. Register ObjectQL as data service
  kernel.registerService('data', objectql);

  // 4. Register plugins
  await kernel.use(new HonoServerPlugin({
    port: 3000,
  }));
  
  await kernel.use(new AuthPlugin({
    secret: process.env.AUTH_SECRET || 'dev-secret-please-change-in-production-min-32-chars',
    baseUrl: 'http://localhost:3000',
    // Optional: Enable OAuth providers
    // providers: [
    //   {
    //     id: 'google',
    //     clientId: process.env.GOOGLE_CLIENT_ID!,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   }
    // ],
    // Optional: Enable advanced features
    // plugins: {
    //   organization: true,  // Multi-tenant support
    //   twoFactor: true,     // 2FA
    //   passkeys: true,      // WebAuthn/Passkeys
    //   magicLink: true,     // Passwordless auth
    // }
  }));

  // 5. Bootstrap the kernel
  await kernel.bootstrap();

  console.log('✅ Server started successfully!\n');
  console.log('📍 Available Authentication Endpoints:');
  console.log('   POST http://localhost:3000/api/v1/auth/sign-up/email');
  console.log('   POST http://localhost:3000/api/v1/auth/sign-in/email');
  console.log('   POST http://localhost:3000/api/v1/auth/sign-out');
  console.log('   GET  http://localhost:3000/api/v1/auth/get-session');
  console.log('   POST http://localhost:3000/api/v1/auth/forget-password');
  console.log('   POST http://localhost:3000/api/v1/auth/reset-password');
  console.log('   POST http://localhost:3000/api/v1/auth/send-verification-email');
  console.log('   GET  http://localhost:3000/api/v1/auth/verify-email\n');
  
  console.log('💡 Test authentication with:');
  console.log('   pnpm test\n');
  console.log('🛑 Press Ctrl+C to stop the server\n');

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await kernel.shutdown();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
