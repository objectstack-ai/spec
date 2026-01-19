import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
       <div className="flex items-center gap-2 font-bold">
        <Image 
          src="https://objectstack.ai/logo.svg" 
          alt="ObjectStack" 
          width={30} 
          height={30} 
        />
        ObjectStack Protocol
      </div>
    ),
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Guides',
      url: '/docs/guides/getting-started',
      active: 'nested-url',
    },
    {
      text: 'Concepts',
      url: '/docs/concepts/manifesto',
      active: 'nested-url',
    },
    {
      text: 'Specs',
      url: '/docs/specifications/data/architecture',
      active: 'nested-url',
    },
    {
      text: 'Reference',
      url: '/docs/references/data/core/Object',
      active: 'nested-url',
    },
  ],
  githubUrl: 'https://github.com/objectstack-ai/spec',
};
