import { describe, it, expect } from 'vitest';
import {
  SeoMetaTagsSchema,
  OpenGraphSchema,
  TwitterCardSchema,
  StructuredDataSchema,
  SeoConfigSchema,
  type SeoConfig,
} from './seo.zod';

describe('SeoMetaTagsSchema', () => {
  it('should accept minimal SEO meta tags', () => {
    const meta = {
      title: 'ObjectStack - Post-SaaS Operating System',
      description: 'A metadata-driven low-code platform for building enterprise software',
    };

    expect(() => SeoMetaTagsSchema.parse(meta)).not.toThrow();
  });

  it('should accept full SEO meta tags', () => {
    const meta = {
      title: 'ObjectStack Protocol',
      description: 'Complete metadata-driven protocol for enterprise applications',
      keywords: ['low-code', 'metadata', 'protocol', 'enterprise'],
      canonical: 'https://objectstack.ai',
      robots: 'index, follow',
      author: 'ObjectStack Team',
      language: 'en',
    };

    expect(() => SeoMetaTagsSchema.parse(meta)).not.toThrow();
  });
});

describe('OpenGraphSchema', () => {
  it('should accept minimal Open Graph config', () => {
    const og = {
      title: 'ObjectStack',
      description: 'Post-SaaS Operating System',
      image: 'https://objectstack.ai/og-image.png',
    };

    const result = OpenGraphSchema.parse(og);
    expect(result.type).toBe('website');
  });

  it('should accept full Open Graph config', () => {
    const og = {
      title: 'ObjectStack Protocol',
      description: 'Metadata-driven low-code platform',
      type: 'article' as const,
      image: 'https://objectstack.ai/og-image.png',
      imageAlt: 'ObjectStack logo and tagline',
      siteName: 'ObjectStack',
      locale: 'en_US',
      url: 'https://objectstack.ai',
    };

    expect(() => OpenGraphSchema.parse(og)).not.toThrow();
  });
});

describe('TwitterCardSchema', () => {
  it('should accept minimal Twitter Card config', () => {
    const twitter = {
      title: 'ObjectStack',
      description: 'Post-SaaS Operating System',
      image: 'https://objectstack.ai/twitter-card.png',
    };

    const result = TwitterCardSchema.parse(twitter);
    expect(result.card).toBe('summary_large_image');
  });

  it('should accept full Twitter Card config', () => {
    const twitter = {
      card: 'summary_large_image' as const,
      title: 'ObjectStack Protocol',
      description: 'Metadata-driven platform',
      image: 'https://objectstack.ai/twitter-card.png',
      imageAlt: 'ObjectStack preview',
      site: '@objectstack',
      creator: '@objectstack',
    };

    expect(() => TwitterCardSchema.parse(twitter)).not.toThrow();
  });
});

describe('StructuredDataSchema', () => {
  it('should accept Organization structured data', () => {
    const structuredData = {
      type: 'Organization',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ObjectStack',
        url: 'https://objectstack.ai',
        logo: 'https://objectstack.ai/logo.png',
      },
    };

    expect(() => StructuredDataSchema.parse(structuredData)).not.toThrow();
  });

  it('should accept Product structured data', () => {
    const structuredData = {
      type: 'Product',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'ObjectStack Protocol',
        description: 'Metadata-driven low-code platform',
        brand: 'ObjectStack',
      },
    };

    expect(() => StructuredDataSchema.parse(structuredData)).not.toThrow();
  });
});

describe('SeoConfigSchema', () => {
  it('should accept minimal SEO config', () => {
    const seo: SeoConfig = {
      meta: {
        title: 'ObjectStack',
        description: 'Post-SaaS Operating System',
      },
    };

    expect(() => SeoConfigSchema.parse(seo)).not.toThrow();
  });

  it('should accept complete SEO config', () => {
    const seo: SeoConfig = {
      meta: {
        title: 'ObjectStack - Post-SaaS Operating System',
        description: 'A metadata-driven low-code platform for building enterprise software',
        keywords: ['low-code', 'metadata', 'protocol'],
        canonical: 'https://objectstack.ai',
        robots: 'index, follow',
        author: 'ObjectStack',
        language: 'en',
      },
      openGraph: {
        title: 'ObjectStack Protocol',
        description: 'Build enterprise software with metadata',
        type: 'website',
        image: 'https://objectstack.ai/og-image.png',
        siteName: 'ObjectStack',
        locale: 'en_US',
        url: 'https://objectstack.ai',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'ObjectStack',
        description: 'Post-SaaS Operating System',
        image: 'https://objectstack.ai/twitter-card.png',
        site: '@objectstack',
      },
      structuredData: [
        {
          type: 'Organization',
          data: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'ObjectStack',
            url: 'https://objectstack.ai',
          },
        },
      ],
      customMeta: [
        {
          name: 'theme-color',
          content: '#0070F3',
        },
      ],
    };

    expect(() => SeoConfigSchema.parse(seo)).not.toThrow();
  });
});
