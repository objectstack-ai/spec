import { describe, it, expect } from 'vitest';
import {
  HeroSectionSchema,
  FeaturesSectionSchema,
  TestimonialsSectionSchema,
  CtaSectionSchema,
  PricingSectionSchema,
  ContentSectionSchema,
  FaqSectionSchema,
  LogoCloudSectionSchema,
  CustomHtmlSectionSchema,
  ContentBlockSchema,
  type HeroSection,
  type FeaturesSection,
  type PricingSection,
} from './content-block.zod';

describe('HeroSectionSchema', () => {
  it('should accept minimal hero section', () => {
    const hero: HeroSection = {
      type: 'hero',
      headline: 'Welcome to ObjectStack',
    };

    const result = HeroSectionSchema.parse(hero);
    expect(result.align).toBe('center');
    expect(result.overlayOpacity).toBe(0.3);
  });

  it('should accept full hero section', () => {
    const hero: HeroSection = {
      type: 'hero',
      id: 'hero-home',
      headline: 'Build Enterprise Software Faster',
      subheadline: 'The Post-SaaS Operating System',
      description: 'Metadata-driven low-code platform for enterprise applications',
      buttons: [
        {
          text: 'Get Started',
          href: '/docs',
          variant: 'primary',
          size: 'lg',
        },
        {
          text: 'View Demo',
          href: '/demo',
          variant: 'outline',
          size: 'lg',
        },
      ],
      backgroundImage: {
        src: '/hero-bg.jpg',
        alt: 'Hero background',
        objectFit: 'cover',
      },
      align: 'center',
      overlayOpacity: 0.5,
    };

    expect(() => HeroSectionSchema.parse(hero)).not.toThrow();
  });
});

describe('FeaturesSectionSchema', () => {
  it('should accept features section', () => {
    const features: FeaturesSection = {
      type: 'features',
      title: 'Why ObjectStack?',
      description: 'Everything you need to build enterprise applications',
      features: [
        {
          icon: 'zap',
          title: 'Lightning Fast',
          description: 'Built for performance from the ground up',
        },
        {
          icon: 'shield',
          title: 'Secure by Default',
          description: 'Enterprise-grade security built in',
        },
        {
          icon: 'code',
          title: 'Developer Friendly',
          description: 'Clean APIs and comprehensive documentation',
        },
      ],
    };

    const result = FeaturesSectionSchema.parse(features);
    expect(result.columns).toBe('3');
    expect(result.align).toBe('center');
  });

  it('should accept features with different columns', () => {
    const features: FeaturesSection = {
      type: 'features',
      features: [
        {
          title: 'Feature 1',
          description: 'Description 1',
        },
        {
          title: 'Feature 2',
          description: 'Description 2',
        },
      ],
      columns: '2',
    };

    expect(() => FeaturesSectionSchema.parse(features)).not.toThrow();
  });
});

describe('TestimonialsSectionSchema', () => {
  it('should accept testimonials section', () => {
    const testimonials = {
      type: 'testimonials' as const,
      title: 'What Our Customers Say',
      testimonials: [
        {
          quote: 'ObjectStack transformed how we build software',
          author: 'Jane Doe',
          title: 'CTO',
          company: 'Acme Corp',
          avatar: '/avatars/jane.jpg',
          rating: 5,
        },
        {
          quote: 'The best platform for enterprise development',
          author: 'John Smith',
          company: 'Tech Inc',
        },
      ],
    };

    const result = TestimonialsSectionSchema.parse(testimonials);
    expect(result.style).toBe('grid');
    expect(result.columns).toBe('3');
  });
});

describe('CtaSectionSchema', () => {
  it('should accept CTA section', () => {
    const cta = {
      type: 'cta' as const,
      headline: 'Ready to Get Started?',
      description: 'Join thousands of developers building with ObjectStack',
      buttons: [
        {
          text: 'Start Free Trial',
          href: '/signup',
          variant: 'primary' as const,
        },
      ],
    };

    const result = CtaSectionSchema.parse(cta);
    expect(result.align).toBe('center');
  });
});

describe('PricingSectionSchema', () => {
  it('should accept pricing section', () => {
    const pricing: PricingSection = {
      type: 'pricing',
      title: 'Simple, Transparent Pricing',
      plans: [
        {
          name: 'Starter',
          price: '$0',
          period: '/month',
          features: [
            'Up to 10 users',
            'Basic features',
            'Community support',
          ],
          button: {
            text: 'Get Started',
            href: '/signup',
          },
        },
        {
          name: 'Professional',
          price: '$99',
          period: '/month',
          features: [
            'Unlimited users',
            'Advanced features',
            'Priority support',
            'Custom integrations',
          ],
          button: {
            text: 'Start Trial',
            href: '/signup?plan=pro',
            variant: 'primary',
          },
          highlighted: true,
          badge: 'Popular',
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          features: [
            'Everything in Professional',
            'Dedicated support',
            'SLA guarantee',
            'Custom development',
          ],
          button: {
            text: 'Contact Sales',
            href: '/contact',
          },
        },
      ],
    };

    expect(() => PricingSectionSchema.parse(pricing)).not.toThrow();
  });
});

describe('ContentSectionSchema', () => {
  it('should accept content section', () => {
    const content = {
      type: 'content' as const,
      title: 'About ObjectStack',
      content: '# Welcome\n\nThis is **markdown** content.',
    };

    const result = ContentSectionSchema.parse(content);
    expect(result.align).toBe('left');
    expect(result.maxWidth).toBe('lg');
  });
});

describe('FaqSectionSchema', () => {
  it('should accept FAQ section', () => {
    const faq = {
      type: 'faq' as const,
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'What is ObjectStack?',
          answer: 'ObjectStack is a metadata-driven low-code platform.',
        },
        {
          question: 'How much does it cost?',
          answer: 'We offer flexible pricing starting from $0.',
        },
      ],
    };

    const result = FaqSectionSchema.parse(faq);
    expect(result.style).toBe('accordion');
  });
});

describe('LogoCloudSectionSchema', () => {
  it('should accept logo cloud section', () => {
    const logoCloud = {
      type: 'logo_cloud' as const,
      title: 'Trusted by Leading Companies',
      logos: [
        {
          src: '/logos/company1.png',
          alt: 'Company 1',
          href: 'https://company1.com',
        },
        {
          src: '/logos/company2.png',
          alt: 'Company 2',
        },
      ],
    };

    const result = LogoCloudSectionSchema.parse(logoCloud);
    expect(result.grayscale).toBe(true);
  });
});

describe('CustomHtmlSectionSchema', () => {
  it('should accept custom HTML section', () => {
    const customHtml = {
      type: 'custom_html' as const,
      id: 'custom-widget',
      html: '<div class="custom-widget">Custom content</div>',
    };

    expect(() => CustomHtmlSectionSchema.parse(customHtml)).not.toThrow();
  });
});

describe('ContentBlockSchema', () => {
  it('should discriminate between different content block types', () => {
    const blocks = [
      { type: 'hero', headline: 'Test' },
      { type: 'features', features: [] },
      { type: 'testimonials', testimonials: [] },
      { type: 'cta', headline: 'CTA', buttons: [] },
      { type: 'pricing', plans: [] },
      { type: 'content', content: 'Test' },
      { type: 'faq', items: [] },
      { type: 'logo_cloud', logos: [] },
      { type: 'custom_html', html: '<div></div>' },
    ];

    blocks.forEach(block => {
      expect(() => ContentBlockSchema.parse(block)).not.toThrow();
    });
  });
});
