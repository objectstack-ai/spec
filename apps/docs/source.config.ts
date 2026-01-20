import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: '../../content/docs',
});

const blogSchema = frontmatterSchema.extend({
  author: z.string().optional(),
  date: z.coerce.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const blog = defineDocs({
  dir: '../../content/blog',
  docs: {
    schema: blogSchema,
  },
});

export default defineConfig();
