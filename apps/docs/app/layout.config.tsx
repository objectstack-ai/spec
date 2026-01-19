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
  githubUrl: 'https://github.com/objectstack-ai/spec',
};
