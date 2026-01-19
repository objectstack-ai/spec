import { source } from '@/app/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

export const { GET } = createSearchAPI('simple', {
  indexes: source.getPages().map((page) => ({
    title: page.data.title ?? 'Untitled',
    content: page.data.description ?? '',
    url: page.url,
  })),
});
