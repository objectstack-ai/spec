# @objectstack/express

The official Express adapter for ObjectStack.

## Features
- Standalone Express router integration
- Full Auth/GraphQL/Metadata/Data/Storage routes
- AuthPlugin service support with Web Request conversion
- Middleware mode for attaching kernel to requests

## Usage

```typescript
import express from 'express';
import { createExpressRouter } from '@objectstack/express';

const app = express();
app.use(express.json());
app.use('/api', createExpressRouter({ kernel }));

app.listen(3000);
```
