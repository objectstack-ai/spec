# Quick Start Guide

This guide will help you get the MSW + React CRUD example up and running in 5 minutes.

## Prerequisites

- Node.js 18 or later
- pnpm package manager

## Step 1: Install Dependencies

From the repository root:

```bash
pnpm install
```

This will install all dependencies for the monorepo, including this example.

## Step 2: Build Required Packages

Build the core packages that the example depends on:

```bash
# Build the spec package (contains type definitions)
pnpm --filter @objectstack/spec build

# Build the client package
pnpm --filter @objectstack/client build
```

## Step 3: Initialize MSW

The MSW service worker file should already be initialized, but if you need to regenerate it:

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

## Step 5: Test CRUD Operations

Once the app is running, you can:

1. **Create** a new task using the form
2. **Read** tasks in the task list
3. **Update** a task by clicking "Edit"
4. **Delete** a task by clicking "Delete"
5. **Toggle completion** status by checking/unchecking the checkbox

## What's Happening Under the Hood?

When you interact with the application:

1. React components call `@objectstack/client` methods (e.g., `client.data.create()`)
2. The client makes HTTP requests to `/api/v1/data/task`
3. MSW intercepts these requests in the browser
4. Mock handlers return data from an in-memory database
5. The UI updates with the response

All network requests visible in DevTools are real HTTP requests - they're just being intercepted and handled by MSW!

## Troubleshooting

**Problem**: MSW worker not starting
**Solution**: Run `npx msw init public/ --save` again

**Problem**: TypeScript errors during build
**Solution**: Make sure you've built the dependency packages first

**Problem**: 404 errors in browser
**Solution**: Check that the MSW worker is registered (look for console message)

## Next Steps

- Modify `src/mocks/browser.ts` to add more fields or objects
- Customize the UI in `src/App.css`
- Add more complex query operations
- Experiment with filters and sorting

## Learn More

- Read the full [README.md](./README.md) for detailed documentation
- Check out [MSW Documentation](https://mswjs.io/)
- Explore the [@objectstack/client API](../../packages/client)
