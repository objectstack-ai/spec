import { z } from 'zod';
import { ContentBlockSchema } from './content-block.zod';
import { SeoConfigSchema } from './seo.zod';

/**
 * Landing Page Schema
 * Defines a complete landing page with sections, SEO, and metadata.
 */
export const LandingPageSchema = z.object({
  /** Page identifier (snake_case) */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Page identifier (snake_case)'),
  
  /** Page title */
  title: z.string().describe('Page title'),
  
  /** Page slug/path */
  slug: z.string().describe('URL slug (e.g., "/", "/pricing", "/about")'),
  
  /** Page description */
  description: z.string().optional().describe('Page description'),
  
  /** SEO configuration */
  seo: SeoConfigSchema.optional().describe('SEO and meta tags configuration'),
  
  /** Page sections/content blocks */
  sections: z.array(ContentBlockSchema).describe('Page content sections'),
  
  /** Navigation to use (reference to WebsiteNavigation) */
  navigation: z.string().optional().describe('Navigation name to use'),
  
  /** Footer to use (reference to WebsiteFooter) */
  footer: z.string().optional().describe('Footer name to use'),
  
  /** Published status */
  published: z.boolean().default(false).describe('Whether page is published'),
  
  /** Publication date */
  publishedAt: z.string().datetime().optional().describe('Publication timestamp'),
  
  /** Last updated date */
  updatedAt: z.string().datetime().optional().describe('Last update timestamp'),
  
  /** Page template/layout */
  template: z.string().optional().describe('Custom template identifier'),
  
  /** Custom scripts (analytics, tracking, etc.) */
  scripts: z.array(z.object({
    src: z.string().optional().describe('Script source URL'),
    inline: z.string().optional().describe('Inline script content'),
    position: z.enum(['head', 'body_start', 'body_end']).default('body_end'),
    async: z.boolean().default(true),
    defer: z.boolean().default(false),
  })).optional().describe('Custom scripts to inject'),
  
  /** Custom CSS */
  customCss: z.string().optional().describe('Custom CSS styles'),
  
  /** A/B testing variant */
  variant: z.string().optional().describe('A/B testing variant identifier'),
});

export type LandingPage = z.infer<typeof LandingPageSchema>;
