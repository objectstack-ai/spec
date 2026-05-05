# @objectstack/dashboard

Opinionated, fork-ready ObjectStack console template built on
[`@object-ui/app-shell`](https://www.objectui.org/docs/layout/app-shell) with the
full ObjectUI plugin set wired up (grid, kanban, calendar, charts, list, detail,
view, form, dashboard, report, chatbot).

This app mirrors the upstream
[`console-starter`](https://github.com/objectstack-ai/objectui/tree/main/examples/console-starter)
template, repackaged as a first-party app inside the framework monorepo so it
can be served alongside `apps/objectos` / `apps/cloud`.

## Develop

```bash
# from the repo root
pnpm install
pnpm dev:dashboard          # runs on http://localhost:5175/_dashboard/
```

By default the dev server proxies `/api` and `/.well-known` to
`http://localhost:3000`, which is where `pnpm dev` (the `apps/objectos` server)
listens. Override the upstream server with `VITE_SERVER_URL` in
`.env.development` if you point the console at a remote ObjectStack instance.

## Customise

`src/App.tsx` owns the routing tree — fork and edit it. The building blocks
imported from `@object-ui/app-shell` (`ConsoleShell`, `AuthenticatedRoute`,
`RootRedirect`, `Default*` pages) encapsulate the provider stack and auth guard
so you only write JSX.

Common edits:

- **Add a route**: drop a `<Route path="/billing" ... />` inside `<Routes>`
- **Swap auth UI**: replace `<DefaultLoginPage />` with your own component
- **Skip orgs**: `<AuthenticatedRoute requireOrganization={false}>`
- **Add/remove plugins**: edit the side-effect imports at the top of `src/main.tsx`
