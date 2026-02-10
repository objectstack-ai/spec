# Documentation Index

Welcome to ObjectStack documentation! This directory contains architectural decisions, guides, and references.

## Quick Links

### 📘 Core Documentation
- **[METADATA_FLOW.md](./METADATA_FLOW.md)** - How metadata flows through ObjectStack from definition to runtime
- **[METADATA_USAGE.md](./METADATA_USAGE.md)** - Practical examples for using the metadata service
- **[METADATA_FAQ.md](./METADATA_FAQ.md)** - Frequently asked questions about metadata architecture

### 🏛️ Architecture Decision Records (ADRs)
- **[ADR Index](./adr/README.md)** - List of all architectural decisions
- **[ADR-0001: Metadata Service Architecture](./adr/0001-metadata-service-architecture.md)** - Why both ObjectQL and MetadataPlugin can provide metadata service

## Documentation by Topic

### Getting Started

**I'm new to ObjectStack:**
1. Read [../README.md](../README.md) - Project overview
2. Check [../ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
3. Follow [METADATA_USAGE.md](./METADATA_USAGE.md) - Start building

**I want to understand metadata:**
1. Read [METADATA_FLOW.md](./METADATA_FLOW.md) - Understand the flow
2. Try examples in [METADATA_USAGE.md](./METADATA_USAGE.md)
3. Reference [METADATA_FAQ.md](./METADATA_FAQ.md) for common questions

### Architecture

**Design Decisions:**
- [adr/0001-metadata-service-architecture.md](./adr/0001-metadata-service-architecture.md) - Metadata service design
- More ADRs coming soon...

**System Overview:**
- [../ARCHITECTURE.md](../ARCHITECTURE.md) - Microkernel architecture
- [METADATA_FLOW.md](./METADATA_FLOW.md) - Metadata subsystem

### Usage Guides

**Metadata Service:**
- [METADATA_USAGE.md](./METADATA_USAGE.md) - Usage examples
- [METADATA_FAQ.md](./METADATA_FAQ.md) - Troubleshooting

**Package Documentation:**
- [../packages/spec/README.md](../packages/spec/README.md) - Protocol specifications
- [../packages/objectql/README.md](../packages/objectql/README.md) - Data engine
- [../packages/metadata/README.md](../packages/metadata/README.md) - Metadata manager
- [../packages/core/README.md](../packages/core/README.md) - Kernel

### API Reference

**Specifications (Zod Schemas):**
- [../packages/spec/src/data/object.zod.ts](../packages/spec/src/data/object.zod.ts) - Object schema
- [../packages/spec/src/ui/view.zod.ts](../packages/spec/src/ui/view.zod.ts) - View schema
- [../packages/spec/src/ui/app.zod.ts](../packages/spec/src/ui/app.zod.ts) - App schema
- [../packages/spec/src/api/metadata.zod.ts](../packages/spec/src/api/metadata.zod.ts) - Metadata API
- [../packages/spec/src/kernel/metadata-loader.zod.ts](../packages/spec/src/kernel/metadata-loader.zod.ts) - Metadata loader protocol

## Documentation Standards

### When to Create an ADR

Create an Architecture Decision Record when:
- Making a significant architectural choice
- Changing core system behavior
- Introducing breaking changes
- Resolving conflicting design options

See [adr/README.md](./adr/README.md) for the template.

### Documentation Structure

```
docs/
├── README.md                    # This file
├── adr/                         # Architecture Decision Records
│   ├── README.md
│   └── 0001-*.md
├── METADATA_FLOW.md             # Component-specific guides
├── METADATA_USAGE.md
└── METADATA_FAQ.md
```

## Contributing to Documentation

### Adding New Documentation

1. **Guides**: Create `{TOPIC}_USAGE.md` for hands-on examples
2. **Architecture**: Create `{TOPIC}_FLOW.md` for system explanations
3. **Decisions**: Create `adr/{NNNN}-{title}.md` for architectural decisions
4. **FAQ**: Add to existing `{TOPIC}_FAQ.md` or create new one

### Documentation Principles

1. **Show, Don't Tell**: Include code examples
2. **Progressive Disclosure**: Start simple, add complexity gradually
3. **Link Liberally**: Cross-reference related docs
4. **Keep Current**: Update docs when code changes
5. **Test Examples**: Ensure code samples actually work

## Need Help?

- **Issues**: [GitHub Issues](https://github.com/objectstack-ai/spec/issues)
- **Discussions**: [GitHub Discussions](https://github.com/objectstack-ai/spec/discussions)
- **Community**: Join our community channels (links in main README)

## Recent Updates

- **2026-02-10**: Added metadata service documentation (ADR-0001, FLOW, USAGE, FAQ)
- **2026-01**: Initial ARCHITECTURE.md created
