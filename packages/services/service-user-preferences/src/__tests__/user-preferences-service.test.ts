// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { describe, it, expect, beforeEach } from 'vitest';
import type { IDataEngine } from '@objectstack/spec/contracts';
import { ObjectQLUserPreferencesService } from '../adapters/objectql-preferences-adapter.js';
import { UserFavoritesService } from '../adapters/favorites-adapter.js';
import type { FavoriteEntry } from '@objectstack/spec/identity';

// ─────────────────────────────────────────────────────────────────
// In-memory IDataEngine stub (mimics driver-memory behavior)
// ─────────────────────────────────────────────────────────────────

function createMemoryEngine(): IDataEngine {
  const tables = new Map<string, any[]>();

  const getTable = (name: string) => {
    if (!tables.has(name)) tables.set(name, []);
    return tables.get(name)!;
  };

  /** Evaluate a single filter condition against a row. */
  const matchesCondition = (row: any, where: Record<string, any>): boolean => {
    for (const [key, value] of Object.entries(where)) {
      if (key === '$or') {
        // At least one branch must match
        if (!Array.isArray(value) || !value.some(branch => matchesCondition(row, branch))) {
          return false;
        }
      } else if (typeof value === 'object' && value !== null && '$like' in value) {
        // Simple LIKE pattern matching (prefix only for simplicity)
        const pattern = value.$like as string;
        const prefix = pattern.replace(/%$/, '');
        if (!row[key]?.startsWith(prefix)) return false;
      } else if (typeof value === 'object' && value !== null && '$gt' in value) {
        if (!(row[key] > value.$gt)) return false;
      } else if (row[key] !== value) {
        return false;
      }
    }
    return true;
  };

  return {
    find: async (objectName, query?) => {
      let rows = [...getTable(objectName)];
      if (query?.where) {
        rows = rows.filter(row => matchesCondition(row, query.where as Record<string, any>));
      }
      if (query?.orderBy && query.orderBy.length > 0) {
        rows.sort((a, b) => {
          for (const sort of query.orderBy!) {
            const field = (sort as any).field;
            const dir = (sort as any).order === 'desc' ? -1 : 1;
            if (a[field] < b[field]) return -dir;
            if (a[field] > b[field]) return dir;
          }
          return 0;
        });
      }
      if (query?.limit) {
        rows = rows.slice(0, query.limit);
      }
      return rows;
    },
    findOne: async (objectName, query?) => {
      let rows = [...getTable(objectName)];
      if (query?.where) {
        rows = rows.filter(row => matchesCondition(row, query.where as Record<string, any>));
      }
      return rows[0] ?? null;
    },
    insert: async (objectName, data) => {
      const table = getTable(objectName);
      if (Array.isArray(data)) {
        table.push(...data);
        return data;
      }
      table.push({ ...data });
      return data;
    },
    update: async (objectName, data, options?) => {
      const table = getTable(objectName);
      const where = options?.where as Record<string, any> | undefined;
      for (let i = 0; i < table.length; i++) {
        if (where) {
          let match = true;
          for (const [key, value] of Object.entries(where)) {
            if (table[i][key] !== value) { match = false; break; }
          }
          if (!match) continue;
        }
        Object.assign(table[i], data);
        return table[i];
      }
      return data;
    },
    delete: async (objectName, options?) => {
      const table = getTable(objectName);
      const where = options?.where as Record<string, any> | undefined;
      let deleted = 0;
      const multi = (options as any)?.multi ?? false;
      for (let i = table.length - 1; i >= 0; i--) {
        if (where) {
          let match = true;
          for (const [key, value] of Object.entries(where)) {
            if (table[i][key] !== value) { match = false; break; }
          }
          if (!match) continue;
        }
        table.splice(i, 1);
        deleted++;
        if (!multi) break;
      }
      return { deleted };
    },
    count: async (objectName, query?) => {
      let rows = [...getTable(objectName)];
      if (query?.where) {
        rows = rows.filter(row => matchesCondition(row, query.where as Record<string, any>));
      }
      return rows.length;
    },
    aggregate: async () => [],
  };
}

// ─────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────

describe('ObjectQLUserPreferencesService', () => {
  let engine: IDataEngine;
  let service: ObjectQLUserPreferencesService;

  beforeEach(() => {
    engine = createMemoryEngine();
    service = new ObjectQLUserPreferencesService(engine);
  });

  // ── get() / set() ──────────────────────────────────────────────

  it('should set and get a scalar preference', async () => {
    await service.set('user1', 'theme', 'dark');
    const value = await service.get('user1', 'theme');
    expect(value).toBe('dark');
  });

  it('should return undefined for non-existent preference', async () => {
    const value = await service.get('user1', 'nonexistent');
    expect(value).toBeUndefined();
  });

  it('should update an existing preference', async () => {
    await service.set('user1', 'theme', 'light');
    await service.set('user1', 'theme', 'dark');
    const value = await service.get('user1', 'theme');
    expect(value).toBe('dark');
  });

  it('should handle different value types', async () => {
    await service.set('user1', 'string', 'hello');
    await service.set('user1', 'number', 42);
    await service.set('user1', 'boolean', true);
    await service.set('user1', 'array', [1, 2, 3]);
    await service.set('user1', 'object', { foo: 'bar' });
    await service.set('user1', 'null', null);

    expect(await service.get('user1', 'string')).toBe('hello');
    expect(await service.get('user1', 'number')).toBe(42);
    expect(await service.get('user1', 'boolean')).toBe(true);
    expect(await service.get('user1', 'array')).toEqual([1, 2, 3]);
    expect(await service.get('user1', 'object')).toEqual({ foo: 'bar' });
    expect(await service.get('user1', 'null')).toBe(null);
  });

  it('should isolate preferences by user', async () => {
    await service.set('user1', 'theme', 'dark');
    await service.set('user2', 'theme', 'light');

    expect(await service.get('user1', 'theme')).toBe('dark');
    expect(await service.get('user2', 'theme')).toBe('light');
  });

  // ── setMany() ──────────────────────────────────────────────────

  it('should set multiple preferences at once', async () => {
    await service.setMany('user1', {
      theme: 'dark',
      locale: 'en-US',
      sidebar_collapsed: true,
    });

    expect(await service.get('user1', 'theme')).toBe('dark');
    expect(await service.get('user1', 'locale')).toBe('en-US');
    expect(await service.get('user1', 'sidebar_collapsed')).toBe(true);
  });

  it('should update existing and create new preferences in batch', async () => {
    await service.set('user1', 'theme', 'light');
    await service.setMany('user1', {
      theme: 'dark',
      locale: 'zh-CN',
    });

    expect(await service.get('user1', 'theme')).toBe('dark');
    expect(await service.get('user1', 'locale')).toBe('zh-CN');
  });

  // ── delete() ───────────────────────────────────────────────────

  it('should delete a preference', async () => {
    await service.set('user1', 'theme', 'dark');
    const deleted = await service.delete('user1', 'theme');
    expect(deleted).toBe(true);

    const value = await service.get('user1', 'theme');
    expect(value).toBeUndefined();
  });

  it('should return false when deleting non-existent preference', async () => {
    const deleted = await service.delete('user1', 'nonexistent');
    expect(deleted).toBe(false);
  });

  // ── getAll() ───────────────────────────────────────────────────

  it('should get all preferences for a user', async () => {
    await service.setMany('user1', {
      theme: 'dark',
      locale: 'en-US',
      sidebar_collapsed: true,
    });

    const all = await service.getAll('user1');
    expect(all).toEqual({
      theme: 'dark',
      locale: 'en-US',
      sidebar_collapsed: true,
    });
  });

  it('should return empty object when user has no preferences', async () => {
    const all = await service.getAll('user1');
    expect(all).toEqual({});
  });

  it('should filter by prefix', async () => {
    await service.setMany('user1', {
      'plugin.ai.auto_save': true,
      'plugin.ai.model': 'gpt-4',
      'plugin.security.mfa': false,
      'theme': 'dark',
    });

    const aiPrefs = await service.getAll('user1', { prefix: 'plugin.ai.' });
    expect(aiPrefs).toEqual({
      'plugin.ai.auto_save': true,
      'plugin.ai.model': 'gpt-4',
    });
  });

  // ── has() ──────────────────────────────────────────────────────

  it('should check if a preference exists', async () => {
    await service.set('user1', 'theme', 'dark');

    expect(await service.has('user1', 'theme')).toBe(true);
    expect(await service.has('user1', 'nonexistent')).toBe(false);
  });

  // ── clear() ────────────────────────────────────────────────────

  it('should clear all preferences for a user', async () => {
    await service.setMany('user1', {
      theme: 'dark',
      locale: 'en-US',
    });

    await service.clear('user1');

    const all = await service.getAll('user1');
    expect(all).toEqual({});
  });

  it('should clear preferences by prefix', async () => {
    await service.setMany('user1', {
      'plugin.ai.auto_save': true,
      'plugin.ai.model': 'gpt-4',
      'plugin.security.mfa': false,
      'theme': 'dark',
    });

    await service.clear('user1', { prefix: 'plugin.ai.' });

    const all = await service.getAll('user1');
    expect(all).toEqual({
      'plugin.security.mfa': false,
      'theme': 'dark',
    });
  });

  // ── listEntries() ──────────────────────────────────────────────

  it('should list all preference entries with metadata', async () => {
    await service.setMany('user1', {
      theme: 'dark',
      locale: 'en-US',
    });

    const entries = await service.listEntries('user1');
    expect(entries).toHaveLength(2);

    const themeEntry = entries.find(e => e.key === 'theme');
    expect(themeEntry).toBeDefined();
    expect(themeEntry!.userId).toBe('user1');
    expect(themeEntry!.value).toBe('dark');
    expect(themeEntry!.valueType).toBe('string');
    expect(themeEntry!.createdAt).toBeDefined();
    expect(themeEntry!.updatedAt).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────
// Favorites Service Tests
// ─────────────────────────────────────────────────────────────────

describe('UserFavoritesService', () => {
  let engine: IDataEngine;
  let preferencesService: ObjectQLUserPreferencesService;
  let favoritesService: UserFavoritesService;

  beforeEach(() => {
    engine = createMemoryEngine();
    preferencesService = new ObjectQLUserPreferencesService(engine);
    favoritesService = new UserFavoritesService(preferencesService);
  });

  // ── list() ─────────────────────────────────────────────────────

  it('should return empty array when no favorites exist', async () => {
    const favorites = await favoritesService.list('user1');
    expect(favorites).toEqual([]);
  });

  // ── add() ──────────────────────────────────────────────────────

  it('should add a favorite', async () => {
    const entry = await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
      label: 'My Tasks',
      icon: 'kanban',
    });

    expect(entry.id).toMatch(/^fav_/);
    expect(entry.type).toBe('view');
    expect(entry.target).toBe('kanban_tasks');
    expect(entry.label).toBe('My Tasks');
    expect(entry.icon).toBe('kanban');
    expect(entry.createdAt).toBeDefined();
  });

  it('should not create duplicate favorites (same type + target)', async () => {
    const entry1 = await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    const entry2 = await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    // Should return the existing favorite
    expect(entry1.id).toBe(entry2.id);

    // Verify only one favorite exists
    const favorites = await favoritesService.list('user1');
    expect(favorites).toHaveLength(1);
  });

  // ── remove() ───────────────────────────────────────────────────

  it('should remove a favorite by ID', async () => {
    const entry = await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    const removed = await favoritesService.remove('user1', entry.id);
    expect(removed).toBe(true);

    const favorites = await favoritesService.list('user1');
    expect(favorites).toHaveLength(0);
  });

  it('should return false when removing non-existent favorite', async () => {
    const removed = await favoritesService.remove('user1', 'fav_nonexistent');
    expect(removed).toBe(false);
  });

  // ── has() ──────────────────────────────────────────────────────

  it('should check if an item is favorited', async () => {
    await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    expect(await favoritesService.has('user1', 'view', 'kanban_tasks')).toBe(true);
    expect(await favoritesService.has('user1', 'view', 'other_view')).toBe(false);
    expect(await favoritesService.has('user1', 'object', 'kanban_tasks')).toBe(false);
  });

  // ── toggle() ───────────────────────────────────────────────────

  it('should toggle favorites (add when not exists)', async () => {
    const added = await favoritesService.toggle('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    expect(added).toBe(true);

    const favorites = await favoritesService.list('user1');
    expect(favorites).toHaveLength(1);
  });

  it('should toggle favorites (remove when exists)', async () => {
    await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    const added = await favoritesService.toggle('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    expect(added).toBe(false);

    const favorites = await favoritesService.list('user1');
    expect(favorites).toHaveLength(0);
  });

  // ── Multiple favorites ─────────────────────────────────────────

  it('should handle multiple favorites', async () => {
    await favoritesService.add('user1', {
      type: 'view',
      target: 'kanban_tasks',
    });

    await favoritesService.add('user1', {
      type: 'object',
      target: 'contacts',
    });

    await favoritesService.add('user1', {
      type: 'app',
      target: 'crm',
    });

    const favorites = await favoritesService.list('user1');
    expect(favorites).toHaveLength(3);

    const types = favorites.map(f => f.type);
    expect(types).toContain('view');
    expect(types).toContain('object');
    expect(types).toContain('app');
  });
});
