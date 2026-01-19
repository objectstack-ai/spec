import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: '../../content/docs',
}) as any;

export default defineConfig();
