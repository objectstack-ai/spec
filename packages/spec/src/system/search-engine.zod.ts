import { z } from 'zod';

/**
 * Full-text search protocol
 * Supports Elasticsearch, Algolia, Meilisearch, Typesense
 */
export const SearchProviderSchema = z.enum([
  'elasticsearch',
  'algolia',
  'meilisearch',
  'typesense',
  'opensearch',
]);

export type SearchProvider = z.infer<typeof SearchProviderSchema>;

export const AnalyzerConfigSchema = z.object({
  type: z.enum(['standard', 'simple', 'whitespace', 'keyword', 'pattern', 'language']),
  language: z.string().optional(),
  stopwords: z.array(z.string()).optional(),
  customFilters: z.array(z.string()).optional(),
});

export type AnalyzerConfig = z.infer<typeof AnalyzerConfigSchema>;

export const SearchIndexConfigSchema = z.object({
  indexName: z.string(),
  objectName: z.string().describe('Source ObjectQL object'),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'keyword', 'number', 'date', 'boolean', 'geo']),
    analyzer: z.string().optional(),
    searchable: z.boolean().default(true),
    filterable: z.boolean().default(false),
    sortable: z.boolean().default(false),
    boost: z.number().default(1),
  })),
  replicas: z.number().default(1),
  shards: z.number().default(1),
});

export type SearchIndexConfig = z.infer<typeof SearchIndexConfigSchema>;

export const FacetConfigSchema = z.object({
  field: z.string(),
  maxValues: z.number().default(10),
  sort: z.enum(['count', 'alpha']).default('count'),
});

export type FacetConfig = z.infer<typeof FacetConfigSchema>;

export const SearchConfigSchema = z.object({
  provider: SearchProviderSchema,
  indexes: z.array(SearchIndexConfigSchema),
  analyzers: z.record(z.string(), AnalyzerConfigSchema).optional(),
  facets: z.array(FacetConfigSchema).optional(),
  typoTolerance: z.boolean().default(true),
  synonyms: z.record(z.string(), z.array(z.string())).optional(),
  ranking: z.array(z.enum(['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'])).optional(),
});

export type SearchConfig = z.infer<typeof SearchConfigSchema>;
