import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import path from 'node:path';

export const docs = defineDocs({
  dir: path.resolve(process.cwd(), '../../content/docs'),
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const blogSchema = pageSchema.extend({
  author: z.string().optional(),
  date: z.coerce.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const blog = defineDocs({
  dir: path.resolve(process.cwd(), '../../content/blog'),
  docs: {
    schema: blogSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
