# @objectstack/rest

ObjectStack REST API Server — automatic REST endpoint generation from protocol metadata. Turns your ObjectStack schema definitions into fully functional CRUD endpoints with zero boilerplate.

## Features

- **Auto-Generated Endpoints**: CRUD routes (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) from object schemas.
- **Batch Operations**: `/createMany`, `/updateMany`, `/deleteMany`, `/batch` endpoints.
- **Metadata API**: `/meta`, `/meta/{type}`, `/meta/{type}/{name}` for runtime introspection.
- **Discovery Endpoint**: `/api/v1` for API self-documentation.
- **Route Manager**: Centralized route registration, grouping, and middleware chain.
- **HTTP Caching**: ETag and Last-Modified header support.
- **Configurable Paths**: Plural, kebab-case, and camelCase path transformations.

## Usage

```typescript
import { createRestApiPlugin } from '@objectstack/rest';

const restPlugin = createRestApiPlugin({
  api: {
    version: 'v1',
    basePath: '/api',
  },
});

// Register with ObjectKernel
kernel.use(restPlugin);
```

### Standalone RestServer

```typescript
import { RestServer } from '@objectstack/rest';

const server = new RestServer(protocol, config);
server.registerRoutes(httpServer);
```

### Route Manager

```typescript
import { RouteManager } from '@objectstack/rest';

const routes = new RouteManager();
routes.register({ method: 'GET', path: '/custom', handler });
```

## License

Apache-2.0 © ObjectStack
