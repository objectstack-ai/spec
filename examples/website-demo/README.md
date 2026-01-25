# Website Expression Protocol Example

This example demonstrates how to use the ObjectStack Website Expression Protocol to define a complete marketing website.

## Overview

The Website Expression Protocol allows you to declaratively configure:
- Landing pages with content blocks
- Navigation menus and footers  
- SEO metadata
- Analytics integration
- Theming

## Preview Release

**March 2026** - This protocol will be released as a preview version.

## Example Configuration

See `website.config.ts` for a complete example of:
- Hero section with CTA buttons
- Features grid
- Testimonials carousel
- Pricing table
- FAQ accordion
- SEO optimization with Open Graph and Twitter Cards
- Multi-language support (English and Chinese)

## Usage

```typescript
import type { Website } from '@objectstack/spec/website';

const websiteConfig: Website.WebsiteConfig = {
  // See website.config.ts for full example
};
```

## Features Demonstrated

1. **Content Blocks**: Hero, features, testimonials, pricing, CTA, FAQ
2. **Navigation**: Header menu with dropdowns, footer with link groups
3. **SEO**: Meta tags, Open Graph, Twitter Cards, structured data
4. **Analytics**: Google Analytics integration
5. **Theming**: Custom colors and typography
6. **i18n**: Multi-language support

## Documentation

See [Website Protocol Reference](../../content/docs/references/website/) for complete API documentation.
