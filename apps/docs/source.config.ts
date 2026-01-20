import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: '../../content/docs',
}) as any;

export const blog = defineDocs({
  dir: '../../content/blog',
  schema: frontmatterSchema.extend({
    author: z.string().optional(),
    date: z.string().date().optional(),
    tags: z.array(z.string()).optional(),
  }),
}) as any;

export default defineConfig();
