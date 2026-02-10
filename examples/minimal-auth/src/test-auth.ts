// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Test Authentication Flow
 * 
 * This script demonstrates the authentication flow using the ObjectStack client.
 * Make sure the server is running (pnpm dev) before running this script.
 */

import { ObjectStackClient } from '@objectstack/client';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');

  // 1. Create client
  const client = new ObjectStackClient({
    baseUrl: 'http://localhost:3000',
  });

  try {
    // 2. Register a new user
    console.log('📝 Registering new user...');
    const registerResult = await client.auth.register({
      email: 'test@example.com',
      password: 'SecurePassword123!',
      name: 'Test User'
    });
    
    if (registerResult.data?.user) {
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerResult.data.user.id);
      console.log('   Email:', registerResult.data.user.email);
      console.log('   Name:', registerResult.data.user.name);
    }

    // 3. Logout
    console.log('\n🚪 Logging out...');
    await client.auth.logout();
    console.log('✅ Logout successful!');

    // 4. Login again
    console.log('\n🔐 Logging in...');
    const loginResult = await client.auth.login({
      type: 'email',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    });
    
    if (loginResult.data?.user) {
      console.log('✅ Login successful!');
      console.log('   User ID:', loginResult.data.user.id);
      console.log('   Email:', loginResult.data.user.email);
    }

    // 5. Get current session
    console.log('\n👤 Getting current session...');
    const session = await client.auth.me();
    
    if (session.data?.user) {
      console.log('✅ Session retrieved!');
      console.log('   User ID:', session.data.user.id);
      console.log('   Email:', session.data.user.email);
      console.log('   Name:', session.data.user.name);
    }

    // 6. Test password reset flow
    console.log('\n🔑 Testing password reset...');
    try {
      const resetResponse = await fetch('http://localhost:3000/api/v1/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });
      
      if (resetResponse.ok) {
        console.log('✅ Password reset email sent!');
        console.log('   (Check your email for reset link)');
      }
    } catch (error) {
      console.log('ℹ️  Password reset feature requires email configuration');
    }

    console.log('\n✨ All authentication tests completed successfully!\n');

  } catch (error: any) {
    console.error('\n❌ Error during authentication test:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', await error.response.json().catch(() => ({})));
    }
    console.error('\n💡 Make sure the server is running: pnpm dev\n');
    process.exit(1);
  }
}

// Run the test
testAuthFlow().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
