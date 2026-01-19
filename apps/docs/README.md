# ObjectStack Documentation Site

This is the documentation site for the ObjectStack Protocol, built with [Fumadocs](https://fumadocs.dev/) and Next.js.

## Structure

```
Repository Root:
├── content/docs/     # Documentation content (MDX files)
│   ├── concepts/
│   ├── references/
│   └── specifications/

apps/docs/
├── app/              # Next.js app directory
│   ├── docs/         # Documentation pages
│   ├── layout.tsx    # Root layout
│   └── source.ts     # Fumadocs source loader
├── source.config.ts  # Fumadocs collection config (references ../../content/docs)
├── next.config.mjs   # Next.js configuration
├── tailwind.config.js
├── postcss.config.mjs
└── package.json
```

## Development

```bash
# From repository root
pnpm docs:dev

# Or from apps/docs
pnpm dev
```

## Building

```bash
# From repository root
pnpm docs:build

# Or from apps/docs
pnpm build
```

## Deployment

```bash
# From repository root
pnpm docs:start

# Or from apps/docs
pnpm start
```

## Features

- 📝 **MDX Support**: Write documentation with React components
- 🎨 **Tailwind CSS v4**: Modern styling with Tailwind
- 🔍 **Search**: Built-in search functionality (⌘K)
- 🌗 **Dark Mode**: Automatic theme switching
- 📱 **Responsive**: Mobile-friendly design
- 🚀 **Static Generation**: All 136 pages pre-rendered for optimal performance

## Content Management

Documentation content is stored in the repository root at `/content/docs/` (shared location) with the following structure:

- `concepts/` - Core concepts and architecture
- `references/` - API and schema references
- `specifications/` - Detailed specifications

Each directory can have a `meta.json` file to configure navigation order and labels.

**Note**: The content is stored at the root level to allow sharing with other tools and workflows. The Next.js app in `apps/docs/` references this content via relative path in `source.config.ts`.
