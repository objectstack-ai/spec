import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'ObjectStack Protocol',
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
  ],
  githubUrl: 'https://github.com/objectstack-ai/spec',
};
