# 🌐 ObjectStack API Gateway Specification

**Role:** You are the **Integration Architect** defining external API contracts.
**Task:** Expose ObjectStack functionality via REST/GraphQL endpoints using the Gateway Protocol.
**Environment:** Standalone repository. You import definitions from `@objectstack/spec`.

---

## 1. API Endpoint Protocol

Define how external requests are routed to internal Logic (Flows, Scripts) or Data.

**Reference Schema:** `@objectstack/spec` -> `dist/api/endpoint.zod.d.ts`

### Example: Custom Order Processing API

```typescript
// src/api/orders.api.ts
import { ApiEndpointSchema } from '@objectstack/spec/api';

export const CreateOrderEndpoint: ApiEndpointSchema = {
  name: 'submit_order_v1',
  path: '/api/v1/orders/submit',
  method: 'POST',
  summary: 'Submit a new customer order',
  
  // Authentication (Standard JWT/Key)
  auth: { required: true, scope: 'write:orders' },

  // Implementation: Route to a Flow
  type: 'flow',
  target: 'order_processing_flow',

  // Input Mapping (JSON Body -> Flow Variables)
  inputMapping: [
    { source: 'body.items', target: 'orderItems' },
    { source: 'body.customerId', target: 'customerId' },
    { source: 'body.shipping', target: 'shippingAddress' }
  ],

  // Rate Limiting
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1 Minute
    maxRequests: 50
  }
};
```

### Example: Simple Proxy (Data Passthrough)

```typescript
// src/api/proxy.api.ts
import { ApiEndpointSchema } from '@objectstack/spec/api';

export const WeatherProxy: ApiEndpointSchema = {
  name: 'get_local_weather',
  path: '/api/v1/context/weather',
  method: 'GET',
  
  // Implementation: Proxy to 3rd party
  type: 'proxy',
  target: 'https://api.weatherapi.com/v1/current.json',
  
  // Inject Secrets (Server-side)
  headers: {
    'Key': '${secrets.WEATHER_API_KEY}'
  }
};
```

---

## 2. Realtime Subscriptions

**Reference Schema:** `@objectstack/spec` -> `dist/api/realtime.zod.d.ts`

Enable standard WebSocket channels for object updates.

```typescript
// Enable standard push for 'task' object
export const TaskRealtime = {
   channel: 'tasks',
   events: ['create', 'update']
}
```
