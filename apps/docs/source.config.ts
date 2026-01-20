import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: '../../content/docs',
}) as any;

export const blog = defineDocs({
  dir: '../../content/blog',
  docs: {
    schema: (ctx) => {
      return ctx.schema.extend({
        author: z.string().optional(),
        date: z.string().date().or(z.date()).optional(),
        tags: z.array(z.string()).optional(),
      });
    },
  },
}) as any;

export default defineConfig();
