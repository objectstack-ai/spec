import type { Website } from '@objectstack/spec/website';

/**
 * ObjectStack Official Website Configuration
 * Demonstrates the Website Expression Protocol
 * Preview Release: March 2026
 */
export const websiteConfig: Website.WebsiteConfig = {
  name: 'objectstack_official',
  title: 'ObjectStack - Post-SaaS Operating System',
  description: 'A metadata-driven low-code platform for building enterprise software',
  baseUrl: 'https://objectstack.ai',
  locale: 'en',
  locales: ['en', 'zh-CN'],

  // Theme Configuration
  theme: {
    name: 'ObjectStack Theme',
    primaryColor: '#0070F3',
    secondaryColor: '#10B981',
    fontFamily: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    borderRadius: 'lg',
    darkMode: true,
  },

  // Main Navigation
  navigations: [
    {
      name: 'main_header',
      label: 'Main Navigation',
      position: 'header',
      logo: {
        src: '/logo.svg',
        alt: 'ObjectStack',
        href: '/',
        width: 150,
        height: 40,
      },
      items: [
        {
          id: 'nav_home',
          label: 'Home',
          type: 'link',
          href: '/',
        },
        {
          id: 'nav_products',
          label: 'Products',
          type: 'dropdown',
          children: [
            {
              id: 'nav_protocol',
              label: 'Protocol',
              type: 'link',
              href: '/protocol',
            },
            {
              id: 'nav_runtime',
              label: 'Runtime',
              type: 'link',
              href: '/runtime',
            },
          ],
        },
        {
          id: 'nav_docs',
          label: 'Documentation',
          type: 'link',
          href: '/docs',
        },
        {
          id: 'nav_pricing',
          label: 'Pricing',
          type: 'link',
          href: '/pricing',
        },
        {
          id: 'nav_get_started',
          label: 'Get Started',
          type: 'button',
          href: '/signup',
          variant: 'primary',
        },
      ],
      sticky: true,
    },
  ],

  // Footer
  footers: [
    {
      name: 'main_footer',
      linkGroups: [
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Documentation', href: '/docs' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '/careers' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Community', href: '/community' },
            { label: 'Support', href: '/support' },
            { label: 'GitHub', href: 'https://github.com/objectstack-ai', target: '_blank' },
          ],
        },
      ],
      socialLinks: [
        { platform: 'github', url: 'https://github.com/objectstack-ai', label: 'GitHub' },
        { platform: 'twitter', url: 'https://twitter.com/objectstack', label: 'Twitter' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/objectstack', label: 'LinkedIn' },
      ],
      copyright: '© 2026 ObjectStack. All rights reserved.',
      newsletter: {
        title: 'Stay Updated',
        description: 'Get the latest news and updates from ObjectStack',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
      },
    },
  ],

  // Landing Pages
  pages: [
    {
      name: 'home',
      title: 'ObjectStack - Post-SaaS Operating System',
      slug: '/',
      published: true,

      // SEO Configuration
      seo: {
        meta: {
          title: 'ObjectStack - Post-SaaS Operating System',
          description: 'Build enterprise software faster with metadata-driven low-code platform',
          keywords: ['low-code', 'metadata', 'protocol', 'enterprise', 'objectstack'],
          robots: 'index, follow',
          language: 'en',
        },
        openGraph: {
          title: 'ObjectStack - Post-SaaS Operating System',
          description: 'Build enterprise software faster with metadata',
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
              logo: 'https://objectstack.ai/logo.png',
              description: 'Post-SaaS Operating System for enterprise software',
            },
          },
        ],
      },

      // Page Content Sections
      sections: [
        // Hero Section
        {
          type: 'hero',
          headline: 'Build Enterprise Software Faster',
          subheadline: 'The Post-SaaS Operating System',
          description: 'ObjectStack is a metadata-driven low-code platform that virtualizes data and unifies business logic.',
          buttons: [
            {
              text: 'Get Started',
              href: '/docs/quick-start',
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
        },

        // Features Section
        {
          type: 'features',
          title: 'Why ObjectStack?',
          description: 'Everything you need to build enterprise applications',
          features: [
            {
              icon: 'zap',
              title: 'Metadata-Driven',
              description: 'Define your application structure as code with Zod schemas and TypeScript types.',
            },
            {
              icon: 'database',
              title: 'Data Virtualization',
              description: 'Unified query interface across SQL, NoSQL, and SaaS connectors.',
            },
            {
              icon: 'layers',
              title: 'Server-Driven UI',
              description: 'Define UI layouts and components declaratively with ObjectUI protocol.',
            },
            {
              icon: 'shield',
              title: 'Enterprise Security',
              description: 'Built-in permissions, sharing rules, and audit logging.',
            },
            {
              icon: 'workflow',
              title: 'Workflow Automation',
              description: 'Visual flows, triggers, and validation rules without code.',
            },
            {
              icon: 'code',
              title: 'Developer Friendly',
              description: 'Clean TypeScript APIs with comprehensive documentation.',
            },
          ],
          columns: '3',
        },

        // Logo Cloud
        {
          type: 'logo_cloud',
          title: 'Trusted by Leading Companies',
          logos: [
            { src: '/logos/company1.svg', alt: 'Company 1' },
            { src: '/logos/company2.svg', alt: 'Company 2' },
            { src: '/logos/company3.svg', alt: 'Company 3' },
            { src: '/logos/company4.svg', alt: 'Company 4' },
          ],
        },

        // Pricing Section
        {
          type: 'pricing',
          title: 'Simple, Transparent Pricing',
          description: 'Choose the plan that fits your needs',
          plans: [
            {
              name: 'Open Source',
              price: '$0',
              period: '/forever',
              description: 'Perfect for getting started',
              features: [
                'Core Protocol',
                'Community Support',
                'Self-Hosted',
                'Unlimited Objects',
              ],
              button: {
                text: 'Get Started',
                href: '/docs/quick-start',
                variant: 'outline',
              },
            },
            {
              name: 'Professional',
              price: '$99',
              period: '/month',
              description: 'For growing teams',
              features: [
                'Everything in Open Source',
                'Priority Support',
                'Advanced Features',
                'Cloud Hosting',
                'Custom Integrations',
              ],
              button: {
                text: 'Start Free Trial',
                href: '/signup?plan=pro',
                variant: 'primary',
              },
              highlighted: true,
              badge: 'Popular',
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For large organizations',
              features: [
                'Everything in Professional',
                'Dedicated Support',
                'SLA Guarantee',
                'Custom Development',
                'On-Premise Deployment',
              ],
              button: {
                text: 'Contact Sales',
                href: '/contact',
                variant: 'outline',
              },
            },
          ],
        },

        // FAQ Section
        {
          type: 'faq',
          title: 'Frequently Asked Questions',
          items: [
            {
              question: 'What is ObjectStack?',
              answer: 'ObjectStack is a metadata-driven low-code platform that enables developers to build enterprise software faster by defining applications as code.',
            },
            {
              question: 'How is it different from other low-code platforms?',
              answer: 'ObjectStack is protocol-first, allowing you to define your application structure using Zod schemas and TypeScript. It virtualizes data access and provides a server-driven UI.',
            },
            {
              question: 'Is it open source?',
              answer: 'Yes! The core protocol and runtime are open source under the Apache 2.0 license.',
            },
            {
              question: 'When is the preview release?',
              answer: 'The Website Expression Protocol preview is scheduled for March 2026.',
            },
          ],
          style: 'accordion',
        },

        // CTA Section
        {
          type: 'cta',
          headline: 'Ready to Build Faster?',
          description: 'Join thousands of developers building with ObjectStack',
          buttons: [
            {
              text: 'Start Free Trial',
              href: '/signup',
              variant: 'primary',
              size: 'lg',
            },
            {
              text: 'View Documentation',
              href: '/docs',
              variant: 'outline',
              size: 'lg',
            },
          ],
          backgroundColor: '#0070F3',
          align: 'center',
        },
      ],

      navigation: 'main_header',
      footer: 'main_footer',
    },
  ],

  // Analytics
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
