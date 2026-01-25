import { z } from 'zod';

/**
 * Website Navigation Menu Item Schema
 * Defines navigation menu structure for websites.
 */
const BaseMenuItemSchema = z.object({
  /** Unique identifier */
  id: z.string().describe('Unique identifier for menu item'),
  
  /** Display label */
  label: z.string().describe('Display label'),
  
  /** Icon (optional) */
  icon: z.string().optional().describe('Icon name or URL'),
  
  /** Badge text (e.g., "New", "Beta") */
  badge: z.string().optional().describe('Badge text'),
  
  /** Visibility condition */
  visible: z.string().optional().describe('Visibility formula condition'),
});

/**
 * Link Menu Item
 * A simple link to an internal or external URL.
 */
export const LinkMenuItemSchema = BaseMenuItemSchema.extend({
  type: z.literal('link'),
  href: z.string().describe('Target URL (internal or external)'),
  target: z.enum(['_self', '_blank']).default('_self').describe('Link target'),
});

/**
 * Dropdown Menu Item
 * A dropdown containing child menu items.
 */
export const DropdownMenuItemSchema = BaseMenuItemSchema.extend({
  type: z.literal('dropdown'),
  // children property is added in the recursive definition
});

/**
 * Mega Menu Column Schema
 * A column in a mega menu layout.
 */
export const MegaMenuColumnSchema = z.object({
  /** Column title */
  title: z.string().optional().describe('Column heading'),
  
  /** Links in this column */
  links: z.array(LinkMenuItemSchema).describe('Links in this column'),
});

/**
 * Mega Menu Item
 * A mega menu with multi-column layout.
 */
export const MegaMenuItemSchema = BaseMenuItemSchema.extend({
  type: z.literal('megamenu'),
  columns: z.array(MegaMenuColumnSchema).describe('Mega menu columns'),
});

/**
 * Button Menu Item
 * A call-to-action button in the navigation.
 */
export const ButtonMenuItemSchema = BaseMenuItemSchema.extend({
  type: z.literal('button'),
  href: z.string().describe('Target URL'),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  target: z.enum(['_self', '_blank']).default('_self'),
});

/**
 * Recursive Navigation Menu Item
 */
export const NavigationMenuItemSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    LinkMenuItemSchema,
    ButtonMenuItemSchema,
    MegaMenuItemSchema,
    DropdownMenuItemSchema.extend({
      children: z.array(NavigationMenuItemSchema).describe('Child menu items'),
    }),
  ])
);

/**
 * Website Navigation Schema
 * Top-level navigation configuration for a website.
 */
export const WebsiteNavigationSchema = z.object({
  /** Navigation name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Navigation identifier (snake_case)'),
  
  /** Navigation label */
  label: z.string().describe('Navigation label'),
  
  /** Navigation position */
  position: z.enum(['header', 'footer', 'sidebar']).default('header'),
  
  /** Logo configuration */
  logo: z.object({
    src: z.string().describe('Logo image URL'),
    alt: z.string().describe('Logo alt text'),
    href: z.string().default('/').describe('Logo link href'),
    width: z.number().optional().describe('Logo width in pixels'),
    height: z.number().optional().describe('Logo height in pixels'),
  }).optional().describe('Logo configuration'),
  
  /** Menu items */
  items: z.array(NavigationMenuItemSchema).describe('Navigation menu items'),
  
  /** Mobile behavior */
  mobileCollapsible: z.boolean().default(true).describe('Enable mobile hamburger menu'),
  
  /** Sticky navigation */
  sticky: z.boolean().default(false).describe('Enable sticky navigation on scroll'),
});

/**
 * Footer Link Group Schema
 * A group of links in the footer.
 */
export const FooterLinkGroupSchema = z.object({
  /** Group title */
  title: z.string().describe('Link group title'),
  
  /** Links in this group */
  links: z.array(z.object({
    label: z.string().describe('Link label'),
    href: z.string().describe('Link URL'),
    target: z.enum(['_self', '_blank']).default('_self'),
  })).describe('Links'),
});

/**
 * Social Link Schema
 * Social media links for footer/header.
 */
export const SocialLinkSchema = z.object({
  /** Platform name */
  platform: z.enum(['facebook', 'twitter', 'linkedin', 'instagram', 'github', 'youtube', 'custom']),
  
  /** Profile URL */
  url: z.string().url().describe('Social profile URL'),
  
  /** Icon (for custom platforms) */
  icon: z.string().optional().describe('Custom icon name or URL'),
  
  /** Label */
  label: z.string().optional().describe('Accessible label'),
});

/**
 * Website Footer Schema
 * Footer configuration with link groups and social links.
 */
export const WebsiteFooterSchema = z.object({
  /** Footer name */
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/).describe('Footer identifier (snake_case)'),
  
  /** Footer sections/link groups */
  linkGroups: z.array(FooterLinkGroupSchema).optional().describe('Footer link groups'),
  
  /** Social media links */
  socialLinks: z.array(SocialLinkSchema).optional().describe('Social media links'),
  
  /** Copyright text */
  copyright: z.string().optional().describe('Copyright text'),
  
  /** Additional footer text */
  description: z.string().optional().describe('Footer description or tagline'),
  
  /** Newsletter signup form */
  newsletter: z.object({
    title: z.string().describe('Newsletter section title'),
    description: z.string().optional().describe('Newsletter description'),
    placeholder: z.string().default('Enter your email').describe('Email input placeholder'),
    buttonText: z.string().default('Subscribe').describe('Submit button text'),
  }).optional().describe('Newsletter signup configuration'),
});

export type NavigationMenuItem = z.infer<typeof NavigationMenuItemSchema>;
export type LinkMenuItem = z.infer<typeof LinkMenuItemSchema>;
export type DropdownMenuItem = z.infer<typeof DropdownMenuItemSchema>;
export type MegaMenuItem = z.infer<typeof MegaMenuItemSchema>;
export type ButtonMenuItem = z.infer<typeof ButtonMenuItemSchema>;
export type WebsiteNavigation = z.infer<typeof WebsiteNavigationSchema>;
export type FooterLinkGroup = z.infer<typeof FooterLinkGroupSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type WebsiteFooter = z.infer<typeof WebsiteFooterSchema>;
