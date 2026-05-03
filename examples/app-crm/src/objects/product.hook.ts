// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import type { Hook, HookContext } from '@objectstack/spec/data';

/**
 * Product catalog hook.
 *
 * - Enforces `list_price >= cost`.
 * - Normalizes `sku` to uppercase.
 * - Refuses delete when the product is referenced by an active opportunity or quote;
 *   suggests deactivating instead.
 */

type ApiShape = {
  object: (n: string) => {
    count: (q: { filter: Record<string, unknown> }) => Promise<number>;
  };
};

const productHook: Hook = {
  name: 'product_catalog',
  object: 'product',
  events: ['beforeInsert', 'beforeUpdate', 'beforeDelete'],
  priority: 200,
  description: 'Pricing sanity, SKU normalization, and protect referenced products from deletion.',
  handler: async (ctx: HookContext) => {
    const { event, input } = ctx;
    const previous = ctx.previous;

    if (event === 'beforeInsert' || event === 'beforeUpdate') {
      const listPrice =
        typeof input.list_price === 'number'
          ? input.list_price
          : typeof previous?.list_price === 'number'
            ? (previous.list_price as number)
            : undefined;
      const cost =
        typeof input.cost === 'number'
          ? input.cost
          : typeof previous?.cost === 'number'
            ? (previous.cost as number)
            : undefined;
      if (typeof listPrice === 'number' && typeof cost === 'number' && listPrice < cost) {
        throw new Error(
          `List Price (${listPrice}) must be greater than or equal to Cost (${cost}).`,
        );
      }
      if (typeof input.sku === 'string') {
        input.sku = input.sku.toUpperCase();
      }
    }

    if (event === 'beforeDelete') {
      const api = ctx.api as ApiShape | undefined;
      const id = previous?.id;
      if (!api || !id) return;
      const [oppRefs, quoteRefs] = await Promise.all([
        api.object('opportunity').count({ filter: { product: id } }).catch(() => 0),
        api.object('quote').count({ filter: { product: id } }).catch(() => 0),
      ]);
      const total = oppRefs + quoteRefs;
      if (total > 0) {
        throw new Error(
          `Cannot delete product: referenced by ${oppRefs} opportunity(ies) and ${quoteRefs} quote(s). Set is_active=false to retire instead.`,
        );
      }
    }
  },
};

export default productHook;
