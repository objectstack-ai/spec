# Advanced CRM Plugin Example

This example demonstrates a comprehensive ObjectStack plugin that showcases the full capability manifest system.

## Key Features Demonstrated

### 1. Protocol Implementation
- Implements `com.objectstack.protocol.storage.v1` with full conformance
- Partially implements `com.objectstack.protocol.sync.v1` with specific features

### 2. Service Interfaces
Provides two stable interfaces:
- `CustomerService` - Customer data management (CRUD operations)
- `OpportunityService` - Sales opportunity tracking

### 3. Plugin Dependencies
Declares dependencies on:
- `com.objectstack.driver.postgres` (required) - Data storage
- `com.objectstack.auth.oauth2` (required) - Authentication
- `com.acme.analytics.basic` (optional) - Enhanced analytics

### 4. Extension Points
Defines four extension points:
- `customer_enrichment` - Transform customer data
- `customer_validator` - Validate customer data
- `opportunity_scoring` - Calculate win probability
- `dashboard_widget` - Custom UI widgets

### 5. Extensions Contributed
- Contributes a customer summary widget to the dashboard

## Naming Conventions

This example follows ObjectStack naming standards:

- **Plugin ID**: `com.acme.crm.advanced` (reverse domain notation)
- **Protocol IDs**: `com.objectstack.protocol.{name}.v{major}`
- **Interface IDs**: `com.acme.crm.interface.{name}`
- **Extension Point IDs**: `com.acme.crm.extension.{name}`

## Interoperability

This plugin is designed to work with other plugins in the ecosystem:

```
┌─────────────────────────────────┐
│  com.acme.crm.advanced          │
│  (This Plugin)                  │
│                                 │
│  Provides:                      │
│  • CustomerService              │
│  • OpportunityService           │
│                                 │
│  Extension Points:              │
│  • customer_enrichment          │
│  • customer_validator           │
│  • opportunity_scoring          │
└──────────┬──────────────────────┘
           │
           │ Depends On
           ▼
┌─────────────────────────────────┐
│  com.objectstack.driver.postgres│
│  Storage Driver                 │
└─────────────────────────────────┘

           │ Extended By
           ▼
┌─────────────────────────────────┐
│  com.acme.crm.email-integration │
│  Email Plugin                   │
│                                 │
│  Extends:                       │
│  • customer_enrichment          │
└─────────────────────────────────┘

           │ Optional
           ▼
┌─────────────────────────────────┐
│  com.acme.analytics.basic       │
│  Analytics Plugin               │
└─────────────────────────────────┘
```

## Usage

### Installing the Plugin

```bash
npm install @acme/crm-advanced
```

### Configuration

```typescript
// objectstack.config.ts
export default {
  plugins: [
    {
      id: 'com.acme.crm.advanced',
      config: {
        apiEndpoint: 'https://api.acme.com',
        syncInterval: 3600,
        enableAudit: true,
        apiKey: process.env.ACME_API_KEY,
      },
    },
  ],
};
```

### Using the Customer Service Interface

```typescript
// In another plugin
export class MyPlugin implements Plugin {
  name = 'com.example.my-plugin';
  dependencies = ['com.acme.crm.advanced'];
  
  async start(ctx: PluginContext) {
    // Get the customer service
    const customerService = ctx.getService('customer-service');
    
    // Use the interface
    const customer = await customerService.getCustomer('123');
    console.log(customer);
    
    // Listen to events
    ctx.hook('crm:customerCreated', async (event) => {
      console.log('New customer:', event.data);
    });
  }
}
```

### Extending the Plugin

```typescript
// Email enrichment plugin
const manifest: ObjectStackManifest = {
  id: 'com.acme.crm.email-enrichment',
  
  capabilities: {
    requires: [
      {
        pluginId: 'com.acme.crm.advanced',
        version: '^2.0.0',
      },
    ],
    
    extensions: [
      {
        targetPluginId: 'com.acme.crm.advanced',
        extensionPointId: 'com.acme.crm.extension.customer_enrichment',
        implementation: './enrichers/email-enricher.ts',
        priority: 100,
      },
    ],
  },
};
```

## Documentation

For more information on the plugin ecosystem:

- [Plugin Ecosystem Architecture](/docs/developers/plugin-ecosystem)
- [Writing Plugins](/docs/developers/writing-plugins)
- [Plugin Capability Protocol](/docs/references/system/plugin-capability)
- [Plugin Registry](/docs/references/hub/plugin-registry)

## License

Apache-2.0
