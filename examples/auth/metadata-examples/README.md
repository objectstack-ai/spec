# ObjectStack Auth Protocol Examples

This package contains comprehensive examples demonstrating all aspects of the ObjectStack Auth Protocol.

## 📚 What's Included

### Core Examples

1. **config.examples.ts** - Authentication configuration examples
   - OAuth providers (Google, GitHub, Microsoft)
   - SAML configuration
   - JWT settings
   - Session management
   - Password policies

2. **identity.examples.ts** - Identity provider examples
   - External identity providers
   - Identity mapping
   - User provisioning
   - SSO configuration

3. **organization.examples.ts** - Organization structure examples
   - Multi-tenant organizations
   - Organization hierarchies
   - Domain verification
   - Organization settings

4. **policy.examples.ts** - Security policy examples
   - Password policies
   - Session policies
   - MFA requirements
   - IP restrictions

5. **role.examples.ts** - Role definition examples
   - System roles
   - Custom roles
   - Role hierarchies
   - Permission assignments

## 🚀 Usage

```typescript
import {
  GoogleOAuthConfig,
  SamlIdentityProvider,
  EnterpriseOrganization,
  StrictPasswordPolicy,
  AdminRole,
} from '@objectstack/example-auth';
```

## 🏗️ Building

```bash
npm run build
```

This compiles all TypeScript examples to JavaScript and generates type declarations.

## 📖 Example Structure

Each example follows this pattern:
- Descriptive constant name (e.g., `GoogleOAuthConfig`)
- Comprehensive JSDoc comment explaining the use case
- Complete, valid example using proper schemas
- Realistic, practical scenarios

## 🎯 Use Cases

These examples are designed for:
- **Learning**: Understand ObjectStack Auth Protocol patterns
- **Reference**: Copy-paste starting points for your own metadata
- **Testing**: Validate implementations against standard patterns
- **Documentation**: Illustrate best practices and conventions

## 📝 Naming Conventions

- **Configuration Keys**: camelCase (e.g., `clientId`, `redirectUri`)
- **Machine Names**: snake_case (e.g., `google_oauth`, `admin_role`)
- **Example Constants**: PascalCase (e.g., `GoogleOAuth`, `AdminRole`)

## 🔗 Related

- [ObjectStack Spec](../../../packages/spec) - Core schema definitions
- [Permission Examples](../../permission/metadata-examples) - Permission Protocol examples
