import { z } from 'zod';

/**
 * SEO Meta Tags Schema
 * Defines metadata for search engine optimization.
 */
export const SeoMetaTagsSchema = z.object({
  /** Page title for SEO (appears in search results and browser tab) */
  title: z.string().describe('SEO title (50-60 characters recommended)'),
  
  /** Meta description for search results */
  description: z.string().describe('Meta description (150-160 characters recommended)'),
  
  /** Keywords for search engines */
  keywords: z.array(z.string()).optional().describe('SEO keywords'),
  
  /** Canonical URL to avoid duplicate content */
  canonical: z.string().url().optional().describe('Canonical URL'),
  
  /** Robots meta tag (index/noindex, follow/nofollow) */
  robots: z.string().optional().describe('Robots directive (e.g., "index, follow")'),
  
  /** Author metadata */
  author: z.string().optional().describe('Content author'),
  
  /** Language code */
  language: z.string().optional().describe('Language code (e.g., "en", "zh-CN")'),
});

/**
 * Open Graph Protocol Schema
 * Social media sharing metadata (Facebook, LinkedIn, etc.).
 */
export const OpenGraphSchema = z.object({
  /** OG title */
  title: z.string().describe('Open Graph title'),
  
  /** OG description */
  description: z.string().describe('Open Graph description'),
  
  /** OG type (website, article, product, etc.) */
  type: z.enum(['website', 'article', 'product', 'profile']).default('website'),
  
  /** OG image URL */
  image: z.string().url().describe('Open Graph image URL (1200x630px recommended)'),
  
  /** OG image alt text */
  imageAlt: z.string().optional().describe('Open Graph image alt text'),
  
  /** Site name */
  siteName: z.string().optional().describe('Site name'),
  
  /** Locale */
  locale: z.string().optional().describe('Locale (e.g., "en_US", "zh_CN")'),
  
  /** URL */
  url: z.string().url().optional().describe('Canonical URL'),
});

/**
 * Twitter Card Schema
 * Twitter-specific sharing metadata.
 */
export const TwitterCardSchema = z.object({
  /** Card type */
  card: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  
  /** Twitter title */
  title: z.string().describe('Twitter card title'),
  
  /** Twitter description */
  description: z.string().describe('Twitter card description'),
  
  /** Twitter image */
  image: z.string().url().describe('Twitter card image URL'),
  
  /** Twitter image alt text */
  imageAlt: z.string().optional().describe('Twitter card image alt text'),
  
  /** Twitter site account */
  site: z.string().optional().describe('Twitter @username for site'),
  
  /** Twitter creator account */
  creator: z.string().optional().describe('Twitter @username for creator'),
});

/**
 * JSON-LD Structured Data Schema
 * Schema.org structured data for rich snippets.
 */
export const StructuredDataSchema = z.object({
  /** Schema.org type */
  type: z.string().describe('Schema.org type (e.g., "Organization", "Product", "Article")'),
  
  /** Structured data object */
  data: z.record(z.any()).describe('Schema.org structured data object'),
});

/**
 * SEO Configuration Schema
 * Complete SEO configuration including meta tags, social sharing, and structured data.
 */
export const SeoConfigSchema = z.object({
  /** Basic SEO meta tags */
  meta: SeoMetaTagsSchema.describe('Basic SEO meta tags'),
  
  /** Open Graph tags for social sharing */
  openGraph: OpenGraphSchema.optional().describe('Open Graph protocol tags'),
  
  /** Twitter Card tags */
  twitter: TwitterCardSchema.optional().describe('Twitter Card tags'),
  
  /** JSON-LD structured data */
  structuredData: z.array(StructuredDataSchema).optional().describe('Schema.org structured data'),
  
  /** Additional custom meta tags */
  customMeta: z.array(z.object({
    name: z.string().describe('Meta tag name'),
    content: z.string().describe('Meta tag content'),
    property: z.string().optional().describe('Meta tag property (for og: tags)'),
  })).optional().describe('Custom meta tags'),
});

export type SeoMetaTags = z.infer<typeof SeoMetaTagsSchema>;
export type OpenGraph = z.infer<typeof OpenGraphSchema>;
export type TwitterCard = z.infer<typeof TwitterCardSchema>;
export type StructuredData = z.infer<typeof StructuredDataSchema>;
export type SeoConfig = z.infer<typeof SeoConfigSchema>;
