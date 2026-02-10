import { describe, it, expect } from 'vitest';
import {
  SearchProviderSchema,
  AnalyzerConfigSchema,
  SearchIndexConfigSchema,
  FacetConfigSchema,
  SearchConfigSchema,
} from './search-engine.zod';

describe('SearchProviderSchema', () => {
  it('should accept valid providers', () => {
    const providers = ['elasticsearch', 'algolia', 'meilisearch', 'typesense', 'opensearch'];
    providers.forEach((provider) => {
      expect(() => SearchProviderSchema.parse(provider)).not.toThrow();
    });
  });

  it('should reject invalid providers', () => {
    expect(() => SearchProviderSchema.parse('solr')).toThrow();
    expect(() => SearchProviderSchema.parse('lucene')).toThrow();
  });
});

describe('AnalyzerConfigSchema', () => {
  it('should accept minimal analyzer', () => {
    const analyzer = AnalyzerConfigSchema.parse({ type: 'standard' });
    expect(analyzer.type).toBe('standard');
  });

  it('should accept all analyzer types', () => {
    const types = ['standard', 'simple', 'whitespace', 'keyword', 'pattern', 'language'];
    types.forEach((type) => {
      expect(() => AnalyzerConfigSchema.parse({ type })).not.toThrow();
    });
  });

  it('should accept full analyzer config', () => {
    const analyzer = AnalyzerConfigSchema.parse({
      type: 'language',
      language: 'english',
      stopwords: ['the', 'a', 'an'],
      customFilters: ['lowercase', 'stemmer'],
    });

    expect(analyzer.language).toBe('english');
    expect(analyzer.stopwords).toEqual(['the', 'a', 'an']);
    expect(analyzer.customFilters).toEqual(['lowercase', 'stemmer']);
  });

  it('should reject invalid type', () => {
    expect(() => AnalyzerConfigSchema.parse({ type: 'fuzzy' })).toThrow();
  });

  it('should reject missing type', () => {
    expect(() => AnalyzerConfigSchema.parse({})).toThrow();
  });
});

describe('SearchIndexConfigSchema', () => {
  it('should accept minimal index config with defaults', () => {
    const index = SearchIndexConfigSchema.parse({
      indexName: 'accounts_idx',
      objectName: 'account',
      fields: [{ name: 'name', type: 'text' }],
    });

    expect(index.indexName).toBe('accounts_idx');
    expect(index.objectName).toBe('account');
    expect(index.fields).toHaveLength(1);
    expect(index.fields[0].searchable).toBe(true);
    expect(index.fields[0].filterable).toBe(false);
    expect(index.fields[0].sortable).toBe(false);
    expect(index.fields[0].boost).toBe(1);
    expect(index.replicas).toBe(1);
    expect(index.shards).toBe(1);
  });

  it('should accept all field types', () => {
    const types = ['text', 'keyword', 'number', 'date', 'boolean', 'geo'];
    types.forEach((type) => {
      expect(() =>
        SearchIndexConfigSchema.parse({
          indexName: 'test',
          objectName: 'obj',
          fields: [{ name: 'f', type }],
        }),
      ).not.toThrow();
    });
  });

  it('should accept full index config', () => {
    const index = SearchIndexConfigSchema.parse({
      indexName: 'contacts_idx',
      objectName: 'contact',
      fields: [
        {
          name: 'full_name',
          type: 'text',
          analyzer: 'standard',
          searchable: true,
          filterable: true,
          sortable: true,
          boost: 2.5,
        },
        {
          name: 'status',
          type: 'keyword',
          searchable: false,
          filterable: true,
          sortable: true,
          boost: 1,
        },
      ],
      replicas: 3,
      shards: 5,
    });

    expect(index.fields).toHaveLength(2);
    expect(index.fields[0].boost).toBe(2.5);
    expect(index.replicas).toBe(3);
    expect(index.shards).toBe(5);
  });

  it('should reject missing required fields', () => {
    expect(() => SearchIndexConfigSchema.parse({})).toThrow();
    expect(() =>
      SearchIndexConfigSchema.parse({ indexName: 'test', objectName: 'obj' }),
    ).toThrow();
  });

  it('should reject invalid field type', () => {
    expect(() =>
      SearchIndexConfigSchema.parse({
        indexName: 'test',
        objectName: 'obj',
        fields: [{ name: 'f', type: 'vector' }],
      }),
    ).toThrow();
  });
});

describe('FacetConfigSchema', () => {
  it('should accept minimal facet with defaults', () => {
    const facet = FacetConfigSchema.parse({ field: 'status' });
    expect(facet.field).toBe('status');
    expect(facet.maxValues).toBe(10);
    expect(facet.sort).toBe('count');
  });

  it('should accept full facet config', () => {
    const facet = FacetConfigSchema.parse({
      field: 'category',
      maxValues: 25,
      sort: 'alpha',
    });

    expect(facet.maxValues).toBe(25);
    expect(facet.sort).toBe('alpha');
  });

  it('should accept all sort options', () => {
    const sorts = ['count', 'alpha'];
    sorts.forEach((sort) => {
      expect(() => FacetConfigSchema.parse({ field: 'f', sort })).not.toThrow();
    });
  });

  it('should reject missing field', () => {
    expect(() => FacetConfigSchema.parse({})).toThrow();
  });

  it('should reject invalid sort', () => {
    expect(() => FacetConfigSchema.parse({ field: 'f', sort: 'relevance' })).toThrow();
  });
});

describe('SearchConfigSchema', () => {
  const minimalIndex = {
    indexName: 'test_idx',
    objectName: 'test',
    fields: [{ name: 'title', type: 'text' as const }],
  };

  it('should accept minimal config with defaults', () => {
    const config = SearchConfigSchema.parse({
      provider: 'elasticsearch',
      indexes: [minimalIndex],
    });

    expect(config.provider).toBe('elasticsearch');
    expect(config.indexes).toHaveLength(1);
    expect(config.typoTolerance).toBe(true);
  });

  it('should accept full configuration', () => {
    const config = SearchConfigSchema.parse({
      provider: 'meilisearch',
      indexes: [minimalIndex],
      analyzers: {
        custom: { type: 'language', language: 'french' },
      },
      facets: [{ field: 'status' }, { field: 'category', maxValues: 20 }],
      typoTolerance: false,
      synonyms: {
        phone: ['telephone', 'mobile'],
        laptop: ['notebook', 'computer'],
      },
      ranking: ['typo', 'words', 'proximity', 'attribute', 'exact'],
    });

    expect(config.provider).toBe('meilisearch');
    expect(config.analyzers?.custom.type).toBe('language');
    expect(config.facets).toHaveLength(2);
    expect(config.typoTolerance).toBe(false);
    expect(config.synonyms?.phone).toEqual(['telephone', 'mobile']);
    expect(config.ranking).toHaveLength(5);
  });

  it('should accept all ranking rules', () => {
    const rules = ['typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'];
    const config = SearchConfigSchema.parse({
      provider: 'algolia',
      indexes: [minimalIndex],
      ranking: rules,
    });

    expect(config.ranking).toEqual(rules);
  });

  it('should reject missing required fields', () => {
    expect(() => SearchConfigSchema.parse({})).toThrow();
    expect(() => SearchConfigSchema.parse({ provider: 'elasticsearch' })).toThrow();
  });

  it('should reject invalid provider', () => {
    expect(() =>
      SearchConfigSchema.parse({ provider: 'solr', indexes: [minimalIndex] }),
    ).toThrow();
  });

  it('should reject invalid ranking rule', () => {
    expect(() =>
      SearchConfigSchema.parse({
        provider: 'elasticsearch',
        indexes: [minimalIndex],
        ranking: ['invalid_rule'],
      }),
    ).toThrow();
  });
});
