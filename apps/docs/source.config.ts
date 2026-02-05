import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const docs = defineDocs({
  dir: path.resolve(currentDir, '../../content/docs'),
});

const blogSchema = frontmatterSchema.extend({
  author: z.string().optional(),
  date: z.coerce.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const blog = defineDocs({
  dir: path.resolve(currentDir, '../../content/blog'),
  docs: {
    schema: blogSchema,
  },
});

export default defineConfig();
