# @objectstack/fastify

The official Fastify adapter for ObjectStack.

## Features
- Fastify plugin integration
- Full Auth/GraphQL/Metadata/Data/Storage routes
- AuthPlugin service support with Web Request conversion
- Decorator mode for attaching kernel to requests

## Usage

```typescript
import Fastify from 'fastify';
import { objectStackPlugin } from '@objectstack/fastify';

const app = Fastify();
app.register(objectStackPlugin, { kernel, prefix: '/api' });

app.listen({ port: 3000 });
```
