import { docs, meta } from '@/.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: {
    files: docs.map((doc: any) => ({
      type: 'page' as const,
      path: doc.path,
      data: doc,
    })),
  } as any,
});
