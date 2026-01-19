# ObjectStack Documentation Site

This is the documentation site for the ObjectStack Protocol, built with [Fumadocs](https://fumadocs.dev/) and Next.js.

## Structure

```
apps/docs/
├── app/              # Next.js app directory
│   ├── docs/         # Documentation pages
│   ├── layout.tsx    # Root layout
│   └── source.ts     # Fumadocs source loader
├── content/          # Documentation content (MDX files)
│   └── docs/
│       ├── concepts/
│       ├── references/
│       └── specifications/
├── source.config.ts  # Fumadocs collection config
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

Documentation content is stored in `content/docs/` with the following structure:

- `concepts/` - Core concepts and architecture
- `references/` - API and schema references
- `specifications/` - Detailed specifications

Each directory can have a `meta.json` file to configure navigation order and labels.
