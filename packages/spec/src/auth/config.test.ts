import { describe, it, expect } from 'vitest';
import {
  AuthStrategy,
  OAuthProviderSchema,
  EmailPasswordConfigSchema,
  MagicLinkConfigSchema,
  PasskeyConfigSchema,
  SessionConfigSchema,
  RateLimitConfigSchema,
  CSRFConfigSchema,
  AccountLinkingConfigSchema,
  TwoFactorConfigSchema,
  OIDCConfigSchema,
  SAMLConfigSchema,
  LDAPConfigSchema,
  EnterpriseAuthConfigSchema,
  UserFieldMappingSchema,
  DatabaseAdapterSchema,
  DatabaseMappingSchema,
  AuthPluginConfigSchema,
  ApplicationAuthConfigSchema,
  StandardAuthProviderSchema,
  type ApplicationAuthConfig,
  type StandardAuthProvider,
  type OAuthProvider,
  type DatabaseMapping,
} from "./config.zod";

describe('AuthStrategy', () => {
  it('should accept valid authentication strategies', () => {
    const strategies = [
      'email_password',
      'magic_link',
      'oauth',
      'passkey',
      'otp',
      'anonymous',
    ];

    strategies.forEach((strategy) => {
      expect(() => AuthStrategy.parse(strategy)).not.toThrow();
    });
  });

  it('should reject invalid strategies', () => {
    expect(() => AuthStrategy.parse('invalid')).toThrow();
  });
});

describe('OAuthProviderSchema', () => {
  it('should accept valid OAuth provider configuration', () => {
    const provider: OAuthProvider = {
      provider: 'google',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      scopes: ['openid', 'profile', 'email'],
      enabled: true,
    };

    expect(() => OAuthProviderSchema.parse(provider)).not.toThrow();
  });

  it('should accept minimal OAuth provider configuration', () => {
    const provider = {
      provider: 'github',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    };

    const result = OAuthProviderSchema.parse(provider);
    expect(result.enabled).toBe(true); // default value
  });

  it('should accept all supported OAuth providers', () => {
    const providers = [
      'google',
      'github',
      'facebook',
      'twitter',
      'linkedin',
      'microsoft',
      'apple',
      'discord',
      'gitlab',
      'custom',
    ];

    providers.forEach((provider) => {
      const config = {
        provider,
        clientId: 'test-id',
        clientSecret: 'test-secret',
      };
      expect(() => OAuthProviderSchema.parse(config)).not.toThrow();
    });
  });

  it('should validate redirect URI is a valid URL', () => {
    const provider = {
      provider: 'google',
      clientId: 'test-id',
      clientSecret: 'test-secret',
      redirectUri: 'not-a-url',
    };

    expect(() => OAuthProviderSchema.parse(provider)).toThrow();
  });
});

describe('EmailPasswordConfigSchema', () => {
  it('should accept valid email password configuration', () => {
    const config = {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      requirePasswordComplexity: true,
      allowPasswordReset: true,
      passwordResetExpiry: 3600,
    };

    expect(() => EmailPasswordConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {};
    const result = EmailPasswordConfigSchema.parse(config);
    
    expect(result.enabled).toBe(true);
    expect(result.minPasswordLength).toBe(8);
    expect(result.requireEmailVerification).toBe(true);
  });

  it('should enforce password length constraints', () => {
    const tooShort = { minPasswordLength: 5 };
    expect(() => EmailPasswordConfigSchema.parse(tooShort)).toThrow();

    const tooLong = { minPasswordLength: 200 };
    expect(() => EmailPasswordConfigSchema.parse(tooLong)).toThrow();

    const justRight = { minPasswordLength: 10 };
    expect(() => EmailPasswordConfigSchema.parse(justRight)).not.toThrow();
  });
});

describe('MagicLinkConfigSchema', () => {
  it('should accept valid magic link configuration', () => {
    const config = {
      enabled: true,
      expiryTime: 1800, // 30 minutes
    };

    expect(() => MagicLinkConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default expiry time', () => {
    const config = { enabled: true };
    const result = MagicLinkConfigSchema.parse(config);
    
    expect(result.expiryTime).toBe(900); // 15 minutes default
  });
});

describe('PasskeyConfigSchema', () => {
  it('should accept valid passkey configuration', () => {
    const config = {
      enabled: true,
      rpName: 'ObjectStack',
      rpId: 'objectstack.com',
      userVerification: 'required' as const,
      attestation: 'direct' as const,
    };

    expect(() => PasskeyConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {
      rpName: 'Test App',
    };
    const result = PasskeyConfigSchema.parse(config);
    
    expect(result.enabled).toBe(false); // disabled by default
    expect(result.userVerification).toBe('preferred');
    expect(result.attestation).toBe('none');
  });

  it('should validate allowed origins are URLs', () => {
    const config = {
      rpName: 'Test',
      allowedOrigins: ['https://example.com', 'https://app.example.com'],
    };

    expect(() => PasskeyConfigSchema.parse(config)).not.toThrow();
  });
});

describe('SessionConfigSchema', () => {
  it('should accept valid session configuration', () => {
    const config = {
      expiresIn: 604800, // 7 days
      updateAge: 86400, // 1 day
      cookieName: 'my-session',
      cookieSecure: true,
      cookieSameSite: 'strict' as const,
      cookieHttpOnly: true,
    };

    expect(() => SessionConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {};
    const result = SessionConfigSchema.parse(config);
    
    expect(result.expiresIn).toBe(86400 * 7); // 7 days
    expect(result.cookieName).toBe('session_token');
    expect(result.cookieSecure).toBe(true);
    expect(result.cookieSameSite).toBe('lax');
  });

  it('should accept all SameSite options', () => {
    const options = ['strict', 'lax', 'none'] as const;
    
    options.forEach((sameSite) => {
      const config = { cookieSameSite: sameSite };
      expect(() => SessionConfigSchema.parse(config)).not.toThrow();
    });
  });
});

describe('RateLimitConfigSchema', () => {
  it('should accept valid rate limit configuration', () => {
    const config = {
      enabled: true,
      maxAttempts: 10,
      windowMs: 1800000, // 30 minutes
      blockDuration: 3600000, // 1 hour
      skipSuccessfulRequests: true,
    };

    expect(() => RateLimitConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {};
    const result = RateLimitConfigSchema.parse(config);
    
    expect(result.enabled).toBe(true);
    expect(result.maxAttempts).toBe(5);
    expect(result.windowMs).toBe(900000); // 15 minutes
  });
});

describe('CSRFConfigSchema', () => {
  it('should accept valid CSRF configuration', () => {
    const config = {
      enabled: true,
      tokenLength: 64,
      cookieName: 'csrf-token',
      headerName: 'X-CSRF-Token',
    };

    expect(() => CSRFConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {};
    const result = CSRFConfigSchema.parse(config);
    
    expect(result.enabled).toBe(true);
    expect(result.tokenLength).toBe(32);
    expect(result.cookieName).toBe('csrf_token');
  });
});

describe('AccountLinkingConfigSchema', () => {
  it('should accept valid account linking configuration', () => {
    const config = {
      enabled: true,
      autoLink: true,
      requireVerification: false,
    };

    expect(() => AccountLinkingConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {};
    const result = AccountLinkingConfigSchema.parse(config);
    
    expect(result.enabled).toBe(true);
    expect(result.autoLink).toBe(false);
    expect(result.requireVerification).toBe(true);
  });
});

describe('TwoFactorConfigSchema', () => {
  it('should accept valid 2FA configuration', () => {
    const config = {
      enabled: true,
      issuer: 'ObjectStack',
      qrCodeSize: 256,
      backupCodes: {
        enabled: true,
        count: 8,
      },
    };

    expect(() => TwoFactorConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = { enabled: false };
    const result = TwoFactorConfigSchema.parse(config);
    
    expect(result.qrCodeSize).toBe(200);
  });
});

describe('OIDCConfigSchema', () => {
  it('should accept valid OIDC configuration', () => {
    const config = {
      enabled: true,
      issuer: 'https://auth.example.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scopes: ['openid', 'profile', 'email', 'groups'],
      attributeMapping: {
        email: 'email',
        name: 'name',
      },
    };

    expect(() => OIDCConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {
      issuer: 'https://auth.example.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
    };
    const result = OIDCConfigSchema.parse(config);
    
    expect(result.enabled).toBe(false);
    expect(result.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('should validate issuer is a URL', () => {
    const config = {
      issuer: 'not-a-url',
      clientId: 'client-id',
      clientSecret: 'client-secret',
    };

    expect(() => OIDCConfigSchema.parse(config)).toThrow();
  });
});

describe('SAMLConfigSchema', () => {
  it('should accept valid SAML configuration', () => {
    const config = {
      enabled: true,
      entryPoint: 'https://idp.example.com/saml/sso',
      cert: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
      issuer: 'https://idp.example.com',
      signatureAlgorithm: 'sha256' as const,
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      },
    };

    expect(() => SAMLConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {
      entryPoint: 'https://idp.example.com/saml/sso',
      cert: 'cert-content',
      issuer: 'https://idp.example.com',
    };
    const result = SAMLConfigSchema.parse(config);
    
    expect(result.enabled).toBe(false);
    expect(result.signatureAlgorithm).toBe('sha256');
  });

  it('should accept sha512 signature algorithm', () => {
    const config = {
      entryPoint: 'https://idp.example.com/saml/sso',
      cert: 'cert-content',
      issuer: 'https://idp.example.com',
      signatureAlgorithm: 'sha512' as const,
    };

    expect(() => SAMLConfigSchema.parse(config)).not.toThrow();
  });
});

describe('LDAPConfigSchema', () => {
  it('should accept valid LDAP configuration', () => {
    const config = {
      enabled: true,
      url: 'ldaps://ldap.example.com:636',
      bindDn: 'CN=Service Account,OU=Users,DC=example,DC=com',
      bindCredentials: 'password',
      searchBase: 'OU=Users,DC=example,DC=com',
      searchFilter: '(&(objectClass=user)(sAMAccountName={{username}}))',
      groupSearchBase: 'OU=Groups,DC=example,DC=com',
    };

    expect(() => LDAPConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values', () => {
    const config = {
      url: 'ldap://ldap.example.com:389',
      bindDn: 'CN=Service Account,OU=Users,DC=example,DC=com',
      bindCredentials: 'password',
      searchBase: 'OU=Users,DC=example,DC=com',
      searchFilter: '(uid={{username}})',
    };
    const result = LDAPConfigSchema.parse(config);
    
    expect(result.enabled).toBe(false);
  });

  it('should accept ldap:// and ldaps:// URLs', () => {
    const ldapConfig = {
      url: 'ldap://ldap.example.com:389',
      bindDn: 'cn=admin',
      bindCredentials: 'password',
      searchBase: 'dc=example,dc=com',
      searchFilter: '(uid={{username}})',
    };

    const ldapsConfig = {
      url: 'ldaps://ldap.example.com:636',
      bindDn: 'cn=admin',
      bindCredentials: 'password',
      searchBase: 'dc=example,dc=com',
      searchFilter: '(uid={{username}})',
    };

    expect(() => LDAPConfigSchema.parse(ldapConfig)).not.toThrow();
    expect(() => LDAPConfigSchema.parse(ldapsConfig)).not.toThrow();
  });
});

describe('EnterpriseAuthConfigSchema', () => {
  it('should accept enterprise config with all providers', () => {
    const config = {
      oidc: {
        enabled: true,
        issuer: 'https://auth.example.com',
        clientId: 'client-id',
        clientSecret: 'client-secret',
      },
      saml: {
        enabled: true,
        entryPoint: 'https://idp.example.com/saml/sso',
        cert: 'cert-content',
        issuer: 'https://idp.example.com',
      },
      ldap: {
        enabled: true,
        url: 'ldaps://ldap.example.com:636',
        bindDn: 'cn=admin',
        bindCredentials: 'password',
        searchBase: 'dc=example,dc=com',
        searchFilter: '(uid={{username}})',
      },
    };

    expect(() => EnterpriseAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept partial enterprise config', () => {
    const config = {
      oidc: {
        enabled: true,
        issuer: 'https://auth.example.com',
        clientId: 'client-id',
        clientSecret: 'client-secret',
      },
    };

    expect(() => EnterpriseAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept empty enterprise config', () => {
    const config = {};
    expect(() => EnterpriseAuthConfigSchema.parse(config)).not.toThrow();
  });
});

describe('UserFieldMappingSchema', () => {
  it('should accept custom field mappings', () => {
    const config = {
      id: 'user_id',
      email: 'user_email',
      name: 'full_name',
      emailVerified: 'is_email_verified',
    };

    expect(() => UserFieldMappingSchema.parse(config)).not.toThrow();
  });

  it('should use default field names', () => {
    const config = {};
    const result = UserFieldMappingSchema.parse(config);
    
    expect(result.id).toBe('id');
    expect(result.email).toBe('email');
    expect(result.name).toBe('name');
    expect(result.emailVerified).toBe('email_verified');
  });
});

describe('DatabaseAdapterSchema', () => {
  it('should accept valid database adapter configuration', () => {
    const config = {
      type: 'prisma' as const,
      connectionString: 'postgresql://localhost:5432/db',
      tablePrefix: 'auth_',
      schema: 'public',
    };

    expect(() => DatabaseAdapterSchema.parse(config)).not.toThrow();
  });

  it('should accept all supported adapter types', () => {
    const types = ['prisma', 'drizzle', 'kysely', 'custom'] as const;
    
    types.forEach((type) => {
      const config = { type };
      expect(() => DatabaseAdapterSchema.parse(config)).not.toThrow();
    });
  });

  it('should use default table prefix', () => {
    const config = { type: 'drizzle' as const };
    const result = DatabaseAdapterSchema.parse(config);
    
    expect(result.tablePrefix).toBe('auth_');
  });
});

describe('DatabaseMappingSchema', () => {
  it('should accept valid database mapping configuration', () => {
    const mapping: DatabaseMapping = {
      user: {
        emailVerified: 'email_verified',
        createdAt: 'created_at',
      },
      session: {
        sessionToken: 'token',
        expires: 'expiresAt',
      },
      account: {
        providerAccountId: 'accountId',
        provider: 'providerId',
      },
      verificationToken: {
        identifier: 'email',
      },
    };

    expect(() => DatabaseMappingSchema.parse(mapping)).not.toThrow();
  });

  it('should use default mappings for session and account', () => {
    const mapping = {};
    const result = DatabaseMappingSchema.parse(mapping);
    
    // Session defaults
    expect(result.session.sessionToken).toBe('token');
    expect(result.session.expires).toBe('expiresAt');
    
    // Account defaults
    expect(result.account.providerAccountId).toBe('accountId');
    expect(result.account.provider).toBe('providerId');
  });

  it('should accept partial mapping overrides', () => {
    const mapping = {
      session: {
        sessionToken: 'session_token',
        // Let expires use default
      },
      account: {
        // Override only one field
        providerAccountId: 'provider_account_id',
      },
    };

    const result = DatabaseMappingSchema.parse(mapping);
    expect(result.session.sessionToken).toBe('session_token');
    expect(result.account.providerAccountId).toBe('provider_account_id');
  });

  it('should accept custom user field mappings', () => {
    const mapping = {
      user: {
        emailVerified: 'is_verified',
        createdAt: 'created',
        updatedAt: 'modified',
      },
    };

    expect(() => DatabaseMappingSchema.parse(mapping)).not.toThrow();
  });

  it('should handle better-auth compatibility mappings', () => {
    const betterAuthMapping = {
      session: {
        sessionToken: 'token',
        expires: 'expiresAt',
      },
      account: {
        providerAccountId: 'accountId',
        provider: 'providerId',
      },
    };

    const result = DatabaseMappingSchema.parse(betterAuthMapping);
    
    // Verify better-auth compatible mappings
    expect(result.session.sessionToken).toBe('token');
    expect(result.session.expires).toBe('expiresAt');
    expect(result.account.providerAccountId).toBe('accountId');
    expect(result.account.provider).toBe('providerId');
  });
});

describe('AuthPluginConfigSchema', () => {
  it('should accept valid plugin configuration', () => {
    const config = {
      name: 'organization',
      enabled: true,
      options: {
        maxOrganizations: 5,
        allowInvites: true,
      },
    };

    expect(() => AuthPluginConfigSchema.parse(config)).not.toThrow();
  });
});

describe('ApplicationAuthConfigSchema', () => {
  it('should accept minimal valid configuration', () => {
    const config: AuthConfig = {
      name: 'main_auth',
      label: 'Main Authentication',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32), // 32 character secret
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept comprehensive configuration', () => {
    const config: AuthConfig = {
      name: 'main_auth',
      label: 'Main Authentication',
      strategies: ['email_password', 'oauth', 'magic_link'],
      baseUrl: 'https://app.example.com',
      secret: 'super-secret-key-with-at-least-32-characters',
      
      emailPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 10,
        requirePasswordComplexity: true,
        allowPasswordReset: true,
        passwordResetExpiry: 7200,
      },
      
      magicLink: {
        enabled: true,
        expiryTime: 900,
      },
      
      oauth: {
        providers: [
          {
            provider: 'google',
            clientId: 'google-client-id',
            clientSecret: 'google-client-secret',
            scopes: ['openid', 'profile', 'email'],
            enabled: true,
          },
          {
            provider: 'github',
            clientId: 'github-client-id',
            clientSecret: 'github-client-secret',
            enabled: true,
          },
        ],
      },
      
      session: {
        expiresIn: 604800,
        cookieName: 'app-session',
        cookieSecure: true,
        cookieSameSite: 'lax',
      },
      
      rateLimit: {
        enabled: true,
        maxAttempts: 5,
        windowMs: 900000,
      },
      
      csrf: {
        enabled: true,
        tokenLength: 32,
      },
      
      accountLinking: {
        enabled: true,
        autoLink: false,
        requireVerification: true,
      },
      
      twoFactor: {
        enabled: true,
        issuer: 'My App',
      },
      
      userFieldMapping: {},
      
      database: {
        type: 'prisma',
        tablePrefix: 'auth_',
      },
      
      plugins: [],
      
      active: true,
      allowRegistration: true,
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce snake_case for name field', () => {
    const invalidConfig = {
      name: 'mainAuth', // camelCase - invalid
      label: 'Main Auth',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    expect(() => ApplicationAuthConfigSchema.parse(invalidConfig)).toThrow();

    const validConfig = {
      ...invalidConfig,
      name: 'main_auth', // snake_case - valid
    };

    expect(() => ApplicationAuthConfigSchema.parse(validConfig)).not.toThrow();
  });

  it('should require at least one strategy', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: [], // empty - invalid
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).toThrow();
  });

  it('should require secret to be at least 32 characters', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'short', // too short
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).toThrow();
  });

  it('should validate baseUrl is a valid URL', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'not-a-url', // invalid URL
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).toThrow();
  });

  it('should accept configuration with hooks', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      hooks: {
        beforeSignIn: async ({ email }: { email: string }) => {
          console.log('Before sign in:', email);
        },
        afterSignIn: async ({ user, session }: { user: any; session: any }) => {
          console.log('After sign in:', user.id);
        },
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with security settings', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      security: {
        allowedOrigins: ['https://app.example.com'],
        trustProxy: true,
        ipRateLimiting: true,
        sessionFingerprinting: true,
        maxSessions: 3,
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with email settings', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      email: {
        from: 'noreply@example.com',
        fromName: 'My App',
        provider: 'sendgrid' as const,
        config: {
          apiKey: 'sendgrid-api-key',
        },
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with UI customization', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      ui: {
        brandName: 'My Brand',
        logo: 'https://example.com/logo.png',
        primaryColor: '#007bff',
        customCss: '.button { color: blue; }',
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with enterprise authentication', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      enterprise: {
        oidc: {
          enabled: true,
          issuer: 'https://auth.example.com',
          clientId: 'oidc-client-id',
          clientSecret: 'oidc-client-secret',
        },
        saml: {
          enabled: true,
          entryPoint: 'https://idp.example.com/saml/sso',
          cert: 'saml-cert',
          issuer: 'https://idp.example.com',
        },
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with database field mapping', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      mapping: {
        user: {
          emailVerified: 'email_verified',
        },
        session: {
          sessionToken: 'token',
          expires: 'expiresAt',
        },
        account: {
          providerAccountId: 'accountId',
          provider: 'providerId',
        },
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept configuration with better-auth compatible mapping', () => {
    const config = {
      name: 'better_auth_config',
      label: 'Better Auth Compatible',
      driver: 'better-auth',
      strategies: ['email_password', 'oauth'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      mapping: {
        session: {
          sessionToken: 'token',
          expires: 'expiresAt',
        },
        account: {
          providerAccountId: 'accountId',
          provider: 'providerId',
        },
      },
    };

    const result = ApplicationAuthConfigSchema.parse(config);
    
    // Verify mapping is preserved
    expect(result.mapping?.session?.sessionToken).toBe('token');
    expect(result.mapping?.account?.providerAccountId).toBe('accountId');
  });

  it('should use default values for optional fields', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
    };

    const result = ApplicationAuthConfigSchema.parse(config);
    
    expect(result.active).toBe(true);
    expect(result.allowRegistration).toBe(true);
    expect(result.plugins).toEqual([]);
  });

  it('should accept configuration with organization settings', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      organization: {
        enabled: true,
        allowUserToCreateOrg: true,
        defaultRole: 'member',
        creatorRole: 'owner',
      },
    };

    expect(() => ApplicationAuthConfigSchema.parse(config)).not.toThrow();
  });

  it('should use default values for organization settings', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      organization: {},
    };

    const result = ApplicationAuthConfigSchema.parse(config);
    
    expect(result.organization?.enabled).toBe(false);
    expect(result.organization?.allowUserToCreateOrg).toBe(true);
    expect(result.organization?.defaultRole).toBe('member');
    expect(result.organization?.creatorRole).toBe('owner');
  });

  it('should accept configuration with organization disabled', () => {
    const config = {
      name: 'test_auth',
      label: 'Test',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
      organization: {
        enabled: false,
      },
    };

    const result = ApplicationAuthConfigSchema.parse(config);
    
    expect(result.organization?.enabled).toBe(false);
  });
});

describe('StandardAuthProviderSchema', () => {
  it('should accept valid authentication provider', () => {
    const provider: AuthenticationProvider = {
      type: 'standard_auth',
      config: {
        name: 'main_auth',
        label: 'Main Auth',
        strategies: ['email_password', 'oauth'],
        baseUrl: 'https://example.com',
        secret: 'a'.repeat(32),
        oauth: {
          providers: [
            {
              provider: 'google',
              clientId: 'test-id',
              clientSecret: 'test-secret',
            },
          ],
        },
        session: {},
        rateLimit: {},
        csrf: {},
        accountLinking: {},
      },
    };

    expect(() => StandardAuthProviderSchema.parse(provider)).not.toThrow();
  });

  it('should require type to be "standard_auth"', () => {
    const provider = {
      type: 'other_auth', // invalid
      config: {
        name: 'test',
        label: 'Test',
        strategies: ['email_password'],
        baseUrl: 'https://example.com',
        secret: 'a'.repeat(32),
        session: {},
        rateLimit: {},
        csrf: {},
        accountLinking: {},
      },
    };

    expect(() => StandardAuthProviderSchema.parse(provider)).toThrow();
  });
});

describe('Type inference', () => {
  it('should correctly infer AuthenticationConfig type', () => {
    const config: AuthConfig = {
      name: 'test_auth',
      label: 'Test Auth',
      strategies: ['email_password'],
      baseUrl: 'https://example.com',
      secret: 'a'.repeat(32),
      session: {},
      rateLimit: {},
      csrf: {},
      accountLinking: {},
    };

    // This test passes if TypeScript compiles without errors
    expect(config.name).toBe('test_auth');
    expect(config.strategies).toContain('email_password');
  });

  it('should correctly infer StandardAuthProvider type', () => {
    const provider: AuthenticationProvider = {
      type: 'standard_auth',
      config: {
        name: 'test_auth',
        label: 'Test',
        strategies: ['email_password'],
        baseUrl: 'https://example.com',
        secret: 'a'.repeat(32),
        session: {},
        rateLimit: {},
        csrf: {},
        accountLinking: {},
      },
    };

    // This test passes if TypeScript compiles without errors
    expect(provider.type).toBe('standard_auth');
    expect(provider.config.name).toBe('test_auth');
  });
});
