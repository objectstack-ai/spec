# Quick Start Guide - Simplified MSW Integration

This is the **simplified** version using `@objectstack/plugin-msw` that auto-mocks all API endpoints. No manual handler code required!

## Prerequisites

- Node.js 18 or later
- pnpm package manager

## Step 1: Install Dependencies

From the repository root:

```bash
pnpm install
```

## Step 2: Build Required Packages

Build the core packages:

```bash
# Build all required packages
pnpm --filter @objectstack/spec build
pnpm --filter @objectstack/runtime build
pnpm --filter @objectstack/plugin-msw build
pnpm --filter @objectstack/client build
```

## Step 3: Initialize MSW

The MSW service worker file should already be initialized:

```bash
cd examples/ui/msw-react-crud
npx msw init public/ --save
```

## Step 4: Start the Development Server

```bash
cd examples/ui/msw-react-crud
pnpm dev
```

The application will start on `http://localhost:3000`

## ✨ What's Different?

### Before (Manual Approach) ❌

You had to manually write 145+ lines of MSW handlers:

```typescript
// src/mocks/browser.ts - OLD WAY
const handlers = [
  http.get('/api/v1/data/task', ({ request }) => {
    // Manual pagination, filtering, sorting...
  }),
  http.post('/api/v1/data/task', async ({ request }) => {
    // Manual ID generation, validation...
  }),
  // ... more manual handlers
];
const worker = setupWorker(...handlers);
await worker.start();
```

### After (Plugin Approach) ✅

Now just **3 lines** with auto-mocking:

```typescript
// src/mocks/browser.ts - NEW WAY
const kernel = new ObjectKernel();
kernel.use(new AppManifestPlugin(appConfig));
kernel.use(new MSWPlugin({ baseUrl: '/api/v1' }));
await kernel.bootstrap();  // Auto-mocks ALL endpoints!
```

## 📦 How It Works

1. **Define Your Data Model** in `objectstack.config.ts`:
   ```typescript
   const TaskObject = ObjectSchema.create({
     name: 'task',
     fields: {
       subject: Field.text({ required: true }),
       priority: Field.number()
     }
   });
   ```

2. **Auto-Mock Everything**: The MSW plugin automatically mocks:
   - ✅ Discovery endpoints
   - ✅ Metadata endpoints
   - ✅ All CRUD operations
   - ✅ Query operations
   - ✅ Pagination, sorting, filtering

3. **Use ObjectStack Client** normally:
   ```typescript
   const client = new ObjectStackClient({ baseUrl: '/api/v1' });
   await client.data.create('task', { subject: 'New task' });
   ```

## 🎯 Test CRUD Operations

Once running, you can:

1. **Create** tasks using the form
2. **Read** tasks in the list
3. **Update** tasks by clicking "Edit"
4. **Delete** tasks by clicking "Delete"
5. **Toggle completion** status

## 🔍 What Gets Auto-Mocked?

The plugin automatically handles:

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1` | Discovery |
| `GET /api/v1/meta/*` | All metadata |
| `GET /api/v1/data/:object` | Find records |
| `GET /api/v1/data/:object/:id` | Get by ID |
| `POST /api/v1/data/:object` | Create |
| `PATCH /api/v1/data/:object/:id` | Update |
| `DELETE /api/v1/data/:object/:id` | Delete |

**Zero manual code!** 🎉

## 🔧 Advanced: Custom Handlers

Need custom logic? Easy:

```typescript
const customHandlers = [
  http.get('/api/custom/hello', () => 
    HttpResponse.json({ message: 'Hello!' })
  )
];

const kernel = new ObjectKernel();
kernel.use(new AppManifestPlugin(appConfig));
kernel.use(new MSWPlugin({
  customHandlers,  // Add your custom handlers
  baseUrl: '/api/v1'
}));
await kernel.bootstrap();
```

## Troubleshooting

**MSW worker not starting?**
```bash
npx msw init public/ --save
```

**TypeScript errors?**
```bash
pnpm --filter @objectstack/spec build
pnpm --filter @objectstack/runtime build
pnpm --filter @objectstack/plugin-msw build
```

**404 errors?**
Check browser console for MSW startup message

## 📚 Learn More

- Full documentation: [README.md](./README.md)
- MSW Plugin: `packages/plugins/plugin-msw/README.md`
- Runtime: `packages/runtime/README.md`
- Client API: `packages/client/README.md`
