import { describe, it, expect } from 'vitest';
import {
  WebsiteConfigSchema,
  WebsiteThemeSchema,
  AnalyticsConfigSchema,
  type WebsiteConfig,
} from './website.zod';

describe('WebsiteThemeSchema', () => {
  it('should accept minimal theme', () => {
    const theme = {
      name: 'Default',
      primaryColor: '#0070F3',
    };

    const result = WebsiteThemeSchema.parse(theme);
    expect(result.borderRadius).toBe('md');
    expect(result.darkMode).toBe(false);
  });

  it('should accept full theme config', () => {
    const theme = {
      name: 'Brand Theme',
      primaryColor: '#0070F3',
      secondaryColor: '#10B981',
      fontFamily: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      borderRadius: 'lg' as const,
      darkMode: true,
    };

    expect(() => WebsiteThemeSchema.parse(theme)).not.toThrow();
  });
});

describe('AnalyticsConfigSchema', () => {
  it('should accept Google Analytics config', () => {
    const analytics = {
      googleAnalytics: {
        measurementId: 'G-XXXXXXXXXX',
      },
    };

    expect(() => AnalyticsConfigSchema.parse(analytics)).not.toThrow();
  });

  it('should accept multiple analytics providers', () => {
    const analytics = {
      googleAnalytics: {
        measurementId: 'G-XXXXXXXXXX',
      },
      googleTagManager: {
        containerId: 'GTM-XXXXXXX',
      },
      facebookPixel: {
        pixelId: '123456789',
      },
      customScripts: [
        {
          name: 'Custom Tracker',
          src: 'https://analytics.example.com/tracker.js',
        },
      ],
    };

    expect(() => AnalyticsConfigSchema.parse(analytics)).not.toThrow();
  });
});

describe('WebsiteConfigSchema', () => {
  it('should accept minimal website config', () => {
    const website: WebsiteConfig = {
      name: 'objectstack_site',
      title: 'ObjectStack',
      baseUrl: 'https://objectstack.ai',
      pages: [],
    };

    const result = WebsiteConfigSchema.parse(website);
    expect(result.locale).toBe('en');
  });

  it('should enforce snake_case for website name', () => {
    const validNames = ['main_site', 'landing_page', '_test'];
    validNames.forEach(name => {
      expect(() =>
        WebsiteConfigSchema.parse({
          name,
          title: 'Test',
          baseUrl: 'https://example.com',
          pages: [],
        })
      ).not.toThrow();
    });

    const invalidNames = ['MainSite', 'landing-page', '123site'];
    invalidNames.forEach(name => {
      expect(() =>
        WebsiteConfigSchema.parse({
          name,
          title: 'Test',
          baseUrl: 'https://example.com',
          pages: [],
        })
      ).toThrow();
    });
  });

  it('should accept complete website config with preview release date', () => {
    const website: WebsiteConfig = {
      name: 'objectstack_official',
      title: 'ObjectStack - Post-SaaS Operating System',
      description: 'Build enterprise software with metadata',
      baseUrl: 'https://objectstack.ai',
      locale: 'en',
      locales: ['en', 'zh-CN'],
      theme: {
        name: 'ObjectStack Theme',
        primaryColor: '#0070F3',
        secondaryColor: '#10B981',
        borderRadius: 'lg',
        darkMode: true,
      },
      navigations: [
        {
          name: 'main_nav',
          label: 'Main Navigation',
          position: 'header',
          items: [
            {
              id: 'home',
              label: 'Home',
              type: 'link',
              href: '/',
            },
            {
              id: 'docs',
              label: 'Documentation',
              type: 'link',
              href: '/docs',
            },
          ],
        },
      ],
      footers: [
        {
          name: 'main_footer',
          linkGroups: [
            {
              title: 'Product',
              links: [
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
              ],
            },
          ],
          copyright: '© 2026 ObjectStack. All rights reserved.',
        },
      ],
      pages: [
        {
          name: 'home',
          title: 'Home',
          slug: '/',
          sections: [
            {
              type: 'hero',
              headline: 'Welcome to ObjectStack',
            },
          ],
        },
      ],
      analytics: {
        googleAnalytics: {
          measurementId: 'G-XXXXXXXXXX',
        },
      },
      favicon: '/favicon.ico',
      socialPreview: 'https://objectstack.ai/og-image.png',
      previewReleaseDate: '2026-03-01T00:00:00Z',
      version: '1.0.0',
    };

    expect(() => WebsiteConfigSchema.parse(website)).not.toThrow();
  });

  it('should validate preview release date format', () => {
    const website: WebsiteConfig = {
      name: 'test_site',
      title: 'Test',
      baseUrl: 'https://example.com',
      pages: [],
      previewReleaseDate: '2026-03-01T00:00:00Z',
    };

    expect(() => WebsiteConfigSchema.parse(website)).not.toThrow();
  });
});
