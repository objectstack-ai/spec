import { describe, it, expect } from 'vitest';
import type { ISearchService, SearchResult, SearchHit, SearchOptions } from './search-service';

describe('Search Service Contract', () => {
  it('should allow a minimal ISearchService implementation with required methods', () => {
    const search: ISearchService = {
      index: async (_object, _id, _document) => {},
      remove: async (_object, _id) => {},
      search: async (_object, _query, _options?) => ({
        hits: [],
        totalHits: 0,
      }),
    };

    expect(typeof search.index).toBe('function');
    expect(typeof search.remove).toBe('function');
    expect(typeof search.search).toBe('function');
  });

  it('should allow a full ISearchService implementation with optional methods', () => {
    const search: ISearchService = {
      index: async () => {},
      remove: async () => {},
      search: async () => ({ hits: [], totalHits: 0 }),
      bulkIndex: async (_object, _documents) => {},
      deleteIndex: async (_object) => {},
    };

    expect(search.bulkIndex).toBeDefined();
    expect(search.deleteIndex).toBeDefined();
  });

  it('should index and search documents', async () => {
    const store = new Map<string, Map<string, Record<string, unknown>>>();

    const search: ISearchService = {
      index: async (object, id, document) => {
        if (!store.has(object)) store.set(object, new Map());
        store.get(object)!.set(id, document);
      },
      remove: async (object, id) => {
        store.get(object)?.delete(id);
      },
      search: async (object, query, options?): Promise<SearchResult> => {
        const docs = store.get(object);
        if (!docs) return { hits: [], totalHits: 0 };

        const hits: SearchHit[] = [];
        docs.forEach((doc, id) => {
          const match = Object.values(doc).some(
            (v) => typeof v === 'string' && v.toLowerCase().includes(query.toLowerCase()),
          );
          if (match) {
            hits.push({ id, score: 1.0, document: doc });
          }
        });

        const limited = hits.slice(0, options?.limit ?? hits.length);
        return { hits: limited, totalHits: hits.length, processingTimeMs: 1 };
      },
    };

    await search.index('products', '1', { title: 'Red Widget', price: 10 });
    await search.index('products', '2', { title: 'Blue Widget', price: 20 });
    await search.index('products', '3', { title: 'Green Gadget', price: 30 });

    const result = await search.search('products', 'widget');
    expect(result.totalHits).toBe(2);
    expect(result.hits).toHaveLength(2);
    expect(result.hits[0].score).toBe(1.0);
  });

  it('should remove documents from the index', async () => {
    const docs = new Map<string, Record<string, unknown>>();

    const search: ISearchService = {
      index: async (_obj, id, doc) => { docs.set(id, doc); },
      remove: async (_obj, id) => { docs.delete(id); },
      search: async () => ({ hits: [], totalHits: docs.size }),
    };

    await search.index('items', '1', { name: 'test' });
    expect((await search.search('items', '')).totalHits).toBe(1);

    await search.remove('items', '1');
    expect((await search.search('items', '')).totalHits).toBe(0);
  });

  it('should support search options', async () => {
    const search: ISearchService = {
      index: async () => {},
      remove: async () => {},
      search: async (_object, _query, options?: SearchOptions): Promise<SearchResult> => {
        const allHits: SearchHit[] = [
          { id: '1', score: 1.0, document: { name: 'A' } },
          { id: '2', score: 0.9, document: { name: 'B' } },
          { id: '3', score: 0.8, document: { name: 'C' } },
        ];
        const limited = allHits.slice(options?.offset ?? 0, (options?.offset ?? 0) + (options?.limit ?? allHits.length));
        return {
          hits: limited,
          totalHits: allHits.length,
          facets: options?.facets ? { category: { widgets: 2, gadgets: 1 } } : undefined,
        };
      },
    };

    const page = await search.search('items', 'test', { limit: 2, offset: 0 });
    expect(page.hits).toHaveLength(2);
    expect(page.totalHits).toBe(3);

    const withFacets = await search.search('items', 'test', { facets: ['category'] });
    expect(withFacets.facets).toBeDefined();
    expect(withFacets.facets!.category.widgets).toBe(2);
  });
});
