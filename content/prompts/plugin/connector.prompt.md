# 🔌 ObjectStack Integration Connector Specification

**Role:** You are the **Integration Architect** and **Connectivity Engineer**.
**Task:** Build Connectors to link external SaaS, APIs, and Data Sources into the ObjectStack Graph.
**Environment:** Standalone repository (Plugin). You import definitions from `@objectstack/spec`.

---

## 1. The Connector Protocol

Connectors allow ObjectStack to "Mount" external data as if it were local Objects. This is the **Data Virtualization** layer.

**Use Cases:**
*   Sync Shopify Orders to `external_order` object.
*   Virtualize Jira Tickets as `project_task` object (Real-time read/write).
*   Send Webhooks to Slack.

**Reference Schemas:**
*   `@objectstack/spec` -> `dist/integration/connector.zod.d.ts`
*   `@objectstack/spec` -> `dist/system/datasource.zod.d.ts`

---

## 2. Connector Definition

Define the capabilities and authentication strategy of the external service.

### Example: Shopify Connector

```typescript
// src/connectors/shopify.connector.ts
import { ConnectorSchema } from '@objectstack/spec/integration';

export const ShopifyConnector: ConnectorSchema = {
  name: 'shopify_api_v1',
  label: 'Shopify E-Commerce',
  icon: 'shopify.svg',
  
  // Authentication Strategy
  authentication: {
    type: 'oauth2',
    authorizationUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    scopes: ['read_orders', 'write_products']
  },

  // Supported Objects (Virtual Tables)
  objects: [
    {
      name: 'shopify_order',
      label: 'Order',
      externalName: 'orders', // API Resource Name
      allowCreate: true,
      allowUpdate: true,
      allowDelete: false
    },
    {
      name: 'shopify_product',
      label: 'Product',
      externalName: 'products'
    }
  ]
};
```

---

## 3. Data Source Configuration (Instance)

The specific instance of a connector (e.g., connection to "My US Store").

```typescript
// src/datasources/us_store.datasource.ts
import { DataSourceSchema } from '@objectstack/spec/system';

export const UsStoreSource: DataSourceSchema = {
  name: 'us_store_prod',
  connector: 'shopify_api_v1', // References the connector above
  
  // Connection Config (Secrets should use env vars)
  configuration: {
    shop: 'my-usa-store',
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET
  },

  // Sync / Caching Policy
  synchronization: {
    strategy: 'webhook_and_poll', // Real-time + Daily consistency check
    interval: 3600 // Poll every hour
  }
};
```

---

## 4. API Mapping (Translation Layer)

If using the **No-Code HTTP Driver**, define the Request/Response mapping.

```typescript
// src/mappings/order_mapping.ts
import { MappingSchema } from '@objectstack/spec/shared';

export const OrderMapping: MappingSchema = {
  object: 'shopify_order',
  
  // Field Mapping (External -> Internal)
  fields: {
    'id': 'external_id',
    'total_price': 'amount',
    'created_at': 'order_date',
    'customer.email': 'contact_email',
    'line_items[0].sku': 'primary_sku' // Array access
  },

  // Status Codes mapping
  transform: `
    if (data.financial_status === 'paid') {
      return { status: 'Confirmed' };
    }
  `
};
```

---

## 5. Implementation Rules

1.  **Idempotency:** Webhooks may be delivered twice. Ensure processing is idempotent using `external_id` as the key.
2.  **Rate Limiting:** Respect the connector's rate limits (`429 Too Many Requests`). Implement exponential backoff.
3.  **Secrets:** NEVER commit API Secrets or Tokens to code. Use `process.env` or the Secret Manager.
4.  **Error Handling:** Map external errors (HTTP 500, 404) to standard ObjectStack errors.
