import { docs, blog as blogCollection } from 'fumadocs-mdx:collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n } from '@/lib/i18n';

export const source = loader({
  baseUrl: '/docs',
  i18n,
  source: (docs as any).toFumadocsSource(),
});

export const blog = loader({
  baseUrl: '/blog',
  source: (blogCollection as any).toFumadocsSource(),
});
