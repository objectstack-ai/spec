import { z } from 'zod';
import { LandingPageSchema } from './landing-page.zod';
import { WebsiteNavigationSchema, WebsiteFooterSchema } from './navigation.zod';

/**
 * Website Theme Configuration
 * Visual theme settings for the website.
 */
export const WebsiteThemeSchema = z.object({
  /** Theme name */
  name: z.string().describe('Theme name'),
  
  /** Primary color */
  primaryColor: z.string().describe('Primary brand color (hex)'),
  
  /** Secondary color */
  secondaryColor: z.string().optional().describe('Secondary brand color (hex)'),
  
  /** Font family */
  fontFamily: z.object({
    heading: z.string().optional().describe('Heading font family'),
    body: z.string().optional().describe('Body font family'),
  }).optional(),
  
  /** Border radius */
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  
  /** Dark mode support */
  darkMode: z.boolean().default(false).describe('Enable dark mode'),
});

/**
 * Analytics Configuration
 * Configure analytics and tracking tools.
 */
export const AnalyticsConfigSchema = z.object({
  /** Google Analytics */
  googleAnalytics: z.object({
    measurementId: z.string().describe('GA4 Measurement ID (e.g., G-XXXXXXXXXX)'),
  }).optional(),
  
  /** Google Tag Manager */
  googleTagManager: z.object({
    containerId: z.string().describe('GTM Container ID (e.g., GTM-XXXXXXX)'),
  }).optional(),
  
  /** Facebook Pixel */
  facebookPixel: z.object({
    pixelId: z.string().describe('Facebook Pixel ID'),
  }).optional(),
  
  /** Custom tracking scripts */
  customScripts: z.array(z.object({
    name: z.string().describe('Script name'),
    src: z.string().optional().describe('Script source URL'),
    inline: z.string().optional().describe('Inline script content'),
  })).optional(),
});

/**
 * Website Configuration Schema
 * Complete website configuration including pages, navigation, theme, and settings.
 */
export const WebsiteConfigSchema = z.object({
  /** Website name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Website identifier (snake_case)'),
  
  /** Website title */
  title: z.string().describe('Website title'),
  
  /** Website description */
  description: z.string().optional().describe('Website description'),
  
  /** Base URL */
  baseUrl: z.string().url().describe('Base URL (e.g., https://example.com)'),
  
  /** Default locale */
  locale: z.string().default('en').describe('Default locale (e.g., "en", "zh-CN")'),
  
  /** Supported locales */
  locales: z.array(z.string()).optional().describe('Supported locales for i18n'),
  
  /** Theme configuration */
  theme: WebsiteThemeSchema.optional().describe('Visual theme settings'),
  
  /** Navigation configurations */
  navigations: z.array(WebsiteNavigationSchema).optional().describe('Navigation menus'),
  
  /** Footer configurations */
  footers: z.array(WebsiteFooterSchema).optional().describe('Footer configurations'),
  
  /** Landing pages */
  pages: z.array(LandingPageSchema).describe('Landing pages'),
  
  /** Analytics configuration */
  analytics: AnalyticsConfigSchema.optional().describe('Analytics and tracking'),
  
  /** Favicon */
  favicon: z.string().optional().describe('Favicon URL'),
  
  /** Social preview image (default OG image) */
  socialPreview: z.string().url().optional().describe('Default social preview image'),
  
  /** Preview release date */
  previewReleaseDate: z.string().datetime().optional().describe('Preview release date (e.g., 2026-03-01)'),
  
  /** Version */
  version: z.string().optional().describe('Website version'),
});

export type WebsiteTheme = z.infer<typeof WebsiteThemeSchema>;
export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;
export type WebsiteConfig = z.infer<typeof WebsiteConfigSchema>;
