# Plugin Security Guide

> **Security Best Practices for ObjectStack Plugin Development**

This guide provides essential security practices for developing secure plugins for the ObjectStack microkernel.

---

## Table of Contents

1. [Security Model](#security-model)
2. [Plugin Signature Verification](#plugin-signature-verification)
3. [Configuration Validation](#configuration-validation)
4. [Capability-Based Permissions](#capability-based-permissions)
5. [Common Security Pitfalls](#common-security-pitfalls)
6. [Security Checklist](#security-checklist)

---

## Security Model

ObjectStack implements a **defense-in-depth** security model with multiple layers:

```
┌─────────────────────────────────────────┐
│  1. Plugin Signature Verification       │  ← Trust
│     • Cryptographic signatures           │
│     • Publisher authenticity             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  2. Capability Declaration              │  ← Intent
│     • Explicit permissions               │
│     • Protocol conformance               │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  3. Runtime Permission Enforcement      │  ← Control
│     • Service access checks              │
│     • Hook trigger validation            │
│     • Resource limits                    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  4. Plugin Sandboxing (Future)          │  ← Isolation
│     • Worker thread isolation            │
│     • Memory/CPU limits                  │
└─────────────────────────────────────────┘
```

### Security Principles

1. **Principle of Least Privilege**: Plugins receive only the minimum permissions needed
2. **Explicit Declaration**: All capabilities must be declared in plugin manifest
3. **Defense in Depth**: Multiple layers of security checks
4. **Fail Secure**: Deny by default, allow only with explicit permission
5. **Audit Trail**: All security events are logged

---

## Plugin Signature Verification

### Overview

Plugin signatures provide cryptographic proof that:
- Plugin code hasn't been tampered with
- Plugin comes from a trusted publisher
- Publisher cannot deny signing the plugin

### Signing a Plugin

**Step 1: Generate Key Pair**

```bash
# Generate RSA private key
openssl genrsa -out private-key.pem 2048

# Extract public key
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

**Step 2: Sign Plugin Code**

```typescript
import * as crypto from 'crypto';
import * as fs from 'fs';

function signPlugin(pluginCode: string, privateKeyPath: string): string {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const sign = crypto.createSign('SHA256');
  sign.update(pluginCode);
  return sign.sign(privateKey, 'base64');
}

// Sign your plugin
const pluginCode = fs.readFileSync('./my-plugin.js', 'utf8');
const signature = signPlugin(pluginCode, './private-key.pem');

console.log('Plugin signature:', signature);
```

**Step 3: Add Signature to Plugin Metadata**

```typescript
export const MyPlugin: PluginMetadata = {
  name: 'com.mycompany.myplugin',
  version: '1.0.0',
  
  // Add signature
  signature: 'BASE64_ENCODED_SIGNATURE_HERE',
  
  init: async (ctx) => {
    // Plugin initialization
  },
};
```

### Verifying Signatures (Kernel-Side)

```typescript
import { PluginSignatureVerifier } from '@objectstack/core/security';

// Configure signature verifier
const verifier = new PluginSignatureVerifier({
  algorithm: 'RS256',
  strictMode: true, // Reject unsigned plugins
  allowSelfSigned: false, // Production: false, Development: true
  trustedPublicKeys: new Map([
    ['com.mycompany', publicKeyPEM],
    ['com.objectstack', objectstackPublicKey],
  ]),
}, logger);

// Verify plugin before loading
const result = await verifier.verifyPluginSignature(plugin);

if (!result.verified) {
  throw new Error(`Plugin signature verification failed: ${result.error}`);
}
```

### Best Practices

✅ **DO:**
- Keep private keys secure (use HSM in production)
- Sign all production plugins
- Rotate keys periodically
- Use strong algorithms (RS256 or ES256)

❌ **DON'T:**
- Commit private keys to version control
- Share private keys between environments
- Use weak algorithms (MD5, SHA1)
- Skip signature verification in production

---

## Configuration Validation

### Overview

Configuration validation ensures:
- Type safety for all config values
- Business rules are enforced
- Default values are applied
- Clear error messages for invalid configs

### Defining Configuration Schema

```typescript
import { z } from 'zod';

// Define Zod schema for plugin configuration
export const MyPluginConfigSchema = z.object({
  // Required fields
  apiKey: z.string()
    .min(32)
    .describe('API key for authentication'),
  
  endpoint: z.string()
    .url()
    .describe('API endpoint URL'),
  
  // Optional fields with defaults
  timeout: z.number()
    .min(1000)
    .max(60000)
    .default(30000)
    .describe('Request timeout in milliseconds'),
  
  retryAttempts: z.number()
    .min(0)
    .max(5)
    .default(3)
    .describe('Number of retry attempts'),
  
  enableLogging: z.boolean()
    .default(false)
    .describe('Enable debug logging'),
});

export type MyPluginConfig = z.infer<typeof MyPluginConfigSchema>;
```

### Plugin Implementation

```typescript
export const MyPlugin: PluginMetadata = {
  name: 'com.mycompany.myplugin',
  version: '1.0.0',
  
  // Attach config schema
  configSchema: MyPluginConfigSchema,
  
  init: async (ctx) => {
    // Config will be validated before init is called
    const config = ctx.getService<MyPluginConfig>('plugin.config');
    
    // All fields are properly typed and validated
    console.log('API Key:', config.apiKey);
    console.log('Endpoint:', config.endpoint);
    console.log('Timeout:', config.timeout); // Has default if not provided
  },
};
```

### Validating Configuration (Kernel-Side)

```typescript
import { PluginConfigValidator } from '@objectstack/core/security';

const validator = new PluginConfigValidator(logger);

try {
  // Validate user-provided config
  const validatedConfig = validator.validatePluginConfig(plugin, userConfig);
  
  // Config is now type-safe and validated
  ctx.registerService('plugin.config', validatedConfig);
  
} catch (error) {
  // Detailed error message with field paths
  console.error(error.message);
  /*
   * Plugin com.mycompany.myplugin configuration validation failed:
   *   - apiKey: String must contain at least 32 character(s)
   *   - endpoint: Invalid url
   */
}
```

### Best Practices

✅ **DO:**
- Define schemas for all configuration
- Use descriptive field names and descriptions
- Set reasonable defaults for optional fields
- Validate early (before plugin initialization)
- Provide clear error messages

❌ **DON'T:**
- Skip configuration validation
- Store secrets in plain text configs
- Use overly permissive schemas
- Ignore validation errors

---

## Capability-Based Permissions

### Overview

Plugins must explicitly declare what capabilities they need. The kernel enforces these at runtime.

### Declaring Capabilities

```typescript
import type { PluginCapability } from '@objectstack/spec/system';

export const MyPluginCapabilities: PluginCapability[] = [
  // Database access
  {
    protocol: {
      id: 'com.objectstack.protocol.service.database.v1',
      label: 'Database Service',
      version: { major: 1, minor: 0, patch: 0 },
    },
    conformance: 'full',
  },
  
  // File system read access
  {
    protocol: {
      id: 'com.objectstack.protocol.filesystem.read.v1',
      label: 'File System Read',
      version: { major: 1, minor: 0, patch: 0 },
    },
    conformance: 'partial',
    features: [
      { name: 'read-config-files', enabled: true },
    ],
  },
  
  // Data lifecycle hooks
  {
    protocol: {
      id: 'com.objectstack.protocol.hook.data.v1',
      label: 'Data Lifecycle Hooks',
      version: { major: 1, minor: 0, patch: 0 },
    },
    conformance: 'full',
  },
];
```

### Using Secure Plugin Context

```typescript
import { SecurePluginContext, PluginPermissionEnforcer } from '@objectstack/core/security';

// Kernel-side: Wrap context with permission checks
const enforcer = new PluginPermissionEnforcer(logger);
enforcer.registerPluginPermissions(plugin.name, MyPluginCapabilities);

const secureContext = new SecurePluginContext(
  plugin.name,
  enforcer,
  baseContext
);

// Plugin receives secure context
await plugin.init(secureContext);
```

### Permission Checking

```typescript
// Inside plugin
export const MyPlugin = {
  name: 'com.mycompany.myplugin',
  
  init: async (ctx: PluginContext) => {
    // This will succeed - we declared database capability
    const db = ctx.getService('database');
    
    // This will throw - we didn't declare network capability
    try {
      const http = ctx.getService('http-client');
    } catch (error) {
      // Permission denied: Plugin com.mycompany.myplugin cannot access service http-client
    }
    
    // This will succeed - we declared data hooks
    ctx.hook('data:beforeCreate', async (record) => {
      // Handle event
    });
    
    // This will throw - we didn't declare kernel hooks
    try {
      await ctx.trigger('kernel:shutdown');
    } catch (error) {
      // Permission denied: Plugin com.mycompany.myplugin cannot trigger hook kernel:shutdown
    }
  },
};
```

### Common Capability Protocols

| Protocol ID | Description |
|-------------|-------------|
| `com.objectstack.protocol.service.all.v1` | Access to all services (use sparingly) |
| `com.objectstack.protocol.service.database.v1` | Database service access |
| `com.objectstack.protocol.service.http.v1` | HTTP service access |
| `com.objectstack.protocol.hook.data.v1` | Data lifecycle hooks |
| `com.objectstack.protocol.hook.kernel.v1` | Kernel lifecycle hooks |
| `com.objectstack.protocol.filesystem.read.v1` | File system read access |
| `com.objectstack.protocol.filesystem.write.v1` | File system write access |
| `com.objectstack.protocol.network.v1` | Network access |

### Best Practices

✅ **DO:**
- Declare minimal required capabilities
- Use specific protocols over wildcard (`.all.`)
- Document why each capability is needed
- Review capabilities during code review
- Test with capability restrictions enabled

❌ **DON'T:**
- Request `service.all` unless absolutely necessary
- Over-declare capabilities "just in case"
- Bypass permission checks
- Cache services to avoid checks

---

## Common Security Pitfalls

### 1. Storing Secrets in Code

❌ **BAD:**
```typescript
const plugin = {
  init: async (ctx) => {
    const apiKey = 'sk_live_abc123...'; // Hard-coded secret
    // ...
  },
};
```

✅ **GOOD:**
```typescript
const plugin = {
  configSchema: z.object({
    apiKey: z.string().min(32),
  }),
  
  init: async (ctx) => {
    const config = ctx.getService('plugin.config');
    const apiKey = config.apiKey; // From environment or secure config
    // ...
  },
};
```

### 2. SQL Injection

❌ **BAD:**
```typescript
const query = `SELECT * FROM users WHERE username = '${username}'`;
db.query(query);
```

✅ **GOOD:**
```typescript
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);
```

### 3. Unrestricted File Access

❌ **BAD:**
```typescript
const filePath = req.query.file;
fs.readFileSync(filePath); // Path traversal vulnerability
```

✅ **GOOD:**
```typescript
const allowedDir = '/safe/directory';
const filePath = path.join(allowedDir, path.basename(req.query.file));

if (!filePath.startsWith(allowedDir)) {
  throw new Error('Invalid file path');
}

fs.readFileSync(filePath);
```

### 4. Missing Input Validation

❌ **BAD:**
```typescript
function processRecord(data: any) {
  // Assuming data is valid
  db.insert(data);
}
```

✅ **GOOD:**
```typescript
const RecordSchema = z.object({
  name: z.string().max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

function processRecord(data: unknown) {
  const validData = RecordSchema.parse(data);
  db.insert(validData);
}
```

---

## Security Checklist

### Development Phase

- [ ] Define Zod schema for all configuration
- [ ] Declare all required capabilities
- [ ] Validate all user inputs
- [ ] Use parameterized queries for database
- [ ] Sanitize file paths
- [ ] Don't hard-code secrets
- [ ] Log security-relevant events
- [ ] Handle errors securely (don't leak stack traces)

### Pre-Production Phase

- [ ] Sign plugin with private key
- [ ] Test with strict mode enabled
- [ ] Review capability declarations
- [ ] Conduct security code review
- [ ] Test permission enforcement
- [ ] Scan for known vulnerabilities
- [ ] Document security assumptions

### Production Phase

- [ ] Enable signature verification (strict mode)
- [ ] Use environment variables for secrets
- [ ] Enable audit logging
- [ ] Monitor permission denials
- [ ] Keep dependencies updated
- [ ] Have incident response plan
- [ ] Rotate keys periodically

---

## Additional Resources

- [MICROKERNEL_ASSESSMENT.md](../MICROKERNEL_ASSESSMENT.md) - Microkernel architecture analysis
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture documentation
- [Plugin Development Guide](./content/docs/developers/writing-plugins.mdx)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-02  
**Maintainer**: ObjectStack Security Team
