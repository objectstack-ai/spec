import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

// Export without type inference to avoid pnpm zod resolution issues
export const { docs, meta } = defineDocs({
  dir: 'content/docs',
}) as any;

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
