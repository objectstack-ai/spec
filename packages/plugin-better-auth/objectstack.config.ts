import { ObjectStackManifest } from '@objectstack/spec';

const manifest: ObjectStackManifest = {
  id: 'com.objectstack.plugin.better-auth',
  name: 'Better-Auth Authentication Plugin',
  version: '1.0.0',
  type: 'plugin',
  description: 'Modern authentication plugin powered by better-auth, supporting multiple strategies including email/password, OAuth, magic links, passkeys, and more.',
  
  // Required permissions
  permissions: [
    'system.user.read',
    'system.user.write',
    'system.session.manage',
    'system.routes.register',
  ],
  
  // Plugin configuration schema
  configuration: {
    title: 'Better-Auth Configuration',
    properties: {
      strategies: {
        type: 'array',
        description: 'Enabled authentication strategies',
        required: true,
      },
      baseUrl: {
        type: 'string',
        description: 'Application base URL',
        required: true,
      },
      secret: {
        type: 'string',
        description: 'Secret key for signing tokens (min 32 characters)',
        required: true,
        secret: true,
      },
      emailPassword: {
        type: 'object',
        description: 'Email/Password authentication configuration',
      },
      oauth: {
        type: 'object',
        description: 'OAuth providers configuration',
      },
      session: {
        type: 'object',
        description: 'Session management configuration',
      },
      rateLimit: {
        type: 'object',
        description: 'Rate limiting configuration',
      },
      csrf: {
        type: 'object',
        description: 'CSRF protection configuration',
      },
      twoFactor: {
        type: 'object',
        description: 'Two-factor authentication configuration',
      },
      database: {
        type: 'object',
        description: 'Database adapter configuration',
      },
    },
  },
  
  // Platform contributions
  contributes: {
    events: [
      'auth.before_signin',
      'auth.after_signin',
      'auth.before_signup',
      'auth.after_signup',
      'auth.before_signout',
      'auth.after_signout',
      'auth.session_created',
      'auth.session_expired',
    ],
    
    actions: [
      {
        name: 'authenticate_user',
        label: 'Authenticate User',
        description: 'Authenticate a user with the provided credentials',
        input: {
          email: 'string',
          password: 'string',
        },
        output: {
          user: 'object',
          session: 'object',
        },
      },
      {
        name: 'send_magic_link',
        label: 'Send Magic Link',
        description: 'Send a magic link to the user\'s email',
        input: {
          email: 'string',
        },
      },
      {
        name: 'verify_session',
        label: 'Verify Session',
        description: 'Verify if a session is valid',
        input: {
          sessionId: 'string',
        },
        output: {
          valid: 'boolean',
          user: 'object',
        },
      },
    ],
  },
  
  // Runtime entry point
  extensions: {
    runtime: {
      entry: './dist/index.js',
    },
  },
};

export default manifest;
