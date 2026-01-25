import { z } from 'zod';

/**
 * Content Alignment Schema
 */
const ContentAlignmentSchema = z.enum(['left', 'center', 'right']);

/**
 * Button Configuration Schema
 * Call-to-action button configuration.
 */
export const ButtonConfigSchema = z.object({
  /** Button text */
  text: z.string().describe('Button text'),
  
  /** Button URL/action */
  href: z.string().describe('Button target URL or action'),
  
  /** Button variant */
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'link']).default('primary'),
  
  /** Button size */
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  
  /** Open in new tab */
  target: z.enum(['_self', '_blank']).default('_self'),
  
  /** Icon */
  icon: z.string().optional().describe('Icon name'),
});

/**
 * Image Configuration Schema
 */
export const ImageConfigSchema = z.object({
  /** Image source URL */
  src: z.string().describe('Image source URL'),
  
  /** Alt text for accessibility */
  alt: z.string().describe('Image alt text'),
  
  /** Image width */
  width: z.number().optional().describe('Image width in pixels'),
  
  /** Image height */
  height: z.number().optional().describe('Image height in pixels'),
  
  /** Object fit */
  objectFit: z.enum(['cover', 'contain', 'fill', 'none', 'scale-down']).default('cover'),
  
  /** Loading strategy */
  loading: z.enum(['lazy', 'eager']).default('lazy'),
});

/**
 * Hero Section Schema
 * Full-width hero banner with headline, description, and CTA.
 */
export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Headline */
  headline: z.string().describe('Main headline'),
  
  /** Subheadline or tagline */
  subheadline: z.string().optional().describe('Subheadline or tagline'),
  
  /** Description text */
  description: z.string().optional().describe('Description text'),
  
  /** Call-to-action buttons */
  buttons: z.array(ButtonConfigSchema).optional().describe('CTA buttons'),
  
  /** Background image */
  backgroundImage: ImageConfigSchema.optional().describe('Hero background image'),
  
  /** Background video */
  backgroundVideo: z.object({
    src: z.string().describe('Video source URL'),
    poster: z.string().optional().describe('Video poster image'),
  }).optional().describe('Hero background video'),
  
  /** Text alignment */
  align: ContentAlignmentSchema.default('center'),
  
  /** Overlay opacity (0-1) */
  overlayOpacity: z.number().min(0).max(1).default(0.3),
});

/**
 * Feature Item Schema
 */
export const FeatureItemSchema = z.object({
  /** Feature icon */
  icon: z.string().optional().describe('Icon name or URL'),
  
  /** Feature title */
  title: z.string().describe('Feature title'),
  
  /** Feature description */
  description: z.string().describe('Feature description'),
  
  /** Feature link */
  link: z.object({
    text: z.string().describe('Link text'),
    href: z.string().describe('Link URL'),
  }).optional().describe('Optional link to learn more'),
});

/**
 * Features Section Schema
 * Grid of features with icons, titles, and descriptions.
 */
export const FeaturesSectionSchema = z.object({
  type: z.literal('features'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title'),
  
  /** Section description */
  description: z.string().optional().describe('Section description'),
  
  /** Features list */
  features: z.array(FeatureItemSchema).describe('List of features'),
  
  /** Grid columns */
  columns: z.enum(['2', '3', '4']).default('3').describe('Number of columns in grid'),
  
  /** Text alignment */
  align: ContentAlignmentSchema.default('center'),
});

/**
 * Testimonial Item Schema
 */
export const TestimonialItemSchema = z.object({
  /** Testimonial quote */
  quote: z.string().describe('Testimonial quote'),
  
  /** Author name */
  author: z.string().describe('Author name'),
  
  /** Author title/role */
  title: z.string().optional().describe('Author title or role'),
  
  /** Author company */
  company: z.string().optional().describe('Author company'),
  
  /** Author avatar */
  avatar: z.string().optional().describe('Author avatar image URL'),
  
  /** Rating (1-5 stars) */
  rating: z.number().min(1).max(5).optional().describe('Rating out of 5'),
});

/**
 * Testimonials Section Schema
 * Customer testimonials and reviews.
 */
export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title'),
  
  /** Section description */
  description: z.string().optional().describe('Section description'),
  
  /** Testimonials list */
  testimonials: z.array(TestimonialItemSchema).describe('List of testimonials'),
  
  /** Display style */
  style: z.enum(['grid', 'carousel', 'masonry']).default('grid'),
  
  /** Grid columns (for grid style) */
  columns: z.enum(['1', '2', '3']).default('3'),
});

/**
 * CTA Section Schema
 * Call-to-action section with headline and buttons.
 */
export const CtaSectionSchema = z.object({
  type: z.literal('cta'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Headline */
  headline: z.string().describe('CTA headline'),
  
  /** Description */
  description: z.string().optional().describe('CTA description'),
  
  /** CTA buttons */
  buttons: z.array(ButtonConfigSchema).describe('CTA buttons'),
  
  /** Background color */
  backgroundColor: z.string().optional().describe('Background color (hex, rgb, or preset)'),
  
  /** Text alignment */
  align: ContentAlignmentSchema.default('center'),
});

/**
 * Pricing Plan Schema
 */
export const PricingPlanSchema = z.object({
  /** Plan name */
  name: z.string().describe('Plan name'),
  
  /** Plan description */
  description: z.string().optional().describe('Plan description'),
  
  /** Price */
  price: z.string().describe('Price (e.g., "$29", "Free", "Custom")'),
  
  /** Billing period */
  period: z.string().optional().describe('Billing period (e.g., "/month", "/year")'),
  
  /** Features list */
  features: z.array(z.string()).describe('List of features'),
  
  /** CTA button */
  button: ButtonConfigSchema.describe('CTA button'),
  
  /** Highlight this plan */
  highlighted: z.boolean().default(false).describe('Highlight as recommended plan'),
  
  /** Badge text */
  badge: z.string().optional().describe('Badge text (e.g., "Popular", "Best Value")'),
});

/**
 * Pricing Section Schema
 * Pricing plans comparison.
 */
export const PricingSectionSchema = z.object({
  type: z.literal('pricing'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title'),
  
  /** Section description */
  description: z.string().optional().describe('Section description'),
  
  /** Pricing plans */
  plans: z.array(PricingPlanSchema).describe('Pricing plans'),
  
  /** Billing toggle */
  billingToggle: z.object({
    monthly: z.string().default('Monthly').describe('Monthly billing label'),
    yearly: z.string().default('Yearly').describe('Yearly billing label'),
  }).optional().describe('Enable monthly/yearly toggle'),
});

/**
 * Rich Text Content Section Schema
 * Flexible content section with markdown/HTML.
 */
export const ContentSectionSchema = z.object({
  type: z.literal('content'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title'),
  
  /** Content (markdown or HTML) */
  content: z.string().describe('Content in markdown or HTML format'),
  
  /** Text alignment */
  align: ContentAlignmentSchema.default('left'),
  
  /** Max width */
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg'),
});

/**
 * FAQ Item Schema
 */
export const FaqItemSchema = z.object({
  /** Question */
  question: z.string().describe('FAQ question'),
  
  /** Answer */
  answer: z.string().describe('FAQ answer (markdown or HTML)'),
});

/**
 * FAQ Section Schema
 * Frequently asked questions.
 */
export const FaqSectionSchema = z.object({
  type: z.literal('faq'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title'),
  
  /** Section description */
  description: z.string().optional().describe('Section description'),
  
  /** FAQ items */
  items: z.array(FaqItemSchema).describe('FAQ items'),
  
  /** Display style */
  style: z.enum(['accordion', 'grid']).default('accordion'),
});

/**
 * Logo Cloud Schema
 * Display logos of customers, partners, or certifications.
 */
export const LogoCloudSectionSchema = z.object({
  type: z.literal('logo_cloud'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Section title */
  title: z.string().optional().describe('Section title (e.g., "Trusted by")'),
  
  /** Logos */
  logos: z.array(z.object({
    src: z.string().describe('Logo image URL'),
    alt: z.string().describe('Company/partner name'),
    href: z.string().optional().describe('Optional link to company website'),
  })).describe('Logo images'),
  
  /** Grayscale logos */
  grayscale: z.boolean().default(true).describe('Display logos in grayscale'),
});

/**
 * Custom HTML Section Schema
 * Embed custom HTML content.
 */
export const CustomHtmlSectionSchema = z.object({
  type: z.literal('custom_html'),
  
  /** Section ID */
  id: z.string().optional().describe('Section ID for anchor links'),
  
  /** Custom HTML content */
  html: z.string().describe('Custom HTML content'),
});

/**
 * Content Block Union Schema
 * Union of all possible content block types.
 */
export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  FeaturesSectionSchema,
  TestimonialsSectionSchema,
  CtaSectionSchema,
  PricingSectionSchema,
  ContentSectionSchema,
  FaqSectionSchema,
  LogoCloudSectionSchema,
  CustomHtmlSectionSchema,
]);

export type ButtonConfig = z.infer<typeof ButtonConfigSchema>;
export type ImageConfig = z.infer<typeof ImageConfigSchema>;
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type FeaturesSection = z.infer<typeof FeaturesSectionSchema>;
export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;
export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>;
export type CtaSection = z.infer<typeof CtaSectionSchema>;
export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type PricingSection = z.infer<typeof PricingSectionSchema>;
export type ContentSection = z.infer<typeof ContentSectionSchema>;
export type FaqItem = z.infer<typeof FaqItemSchema>;
export type FaqSection = z.infer<typeof FaqSectionSchema>;
export type LogoCloudSection = z.infer<typeof LogoCloudSectionSchema>;
export type CustomHtmlSection = z.infer<typeof CustomHtmlSectionSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
