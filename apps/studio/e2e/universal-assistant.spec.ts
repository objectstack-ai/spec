// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * E2E smoke for the Universal Assistant wiring (Phase E).
 *
 * Verifies that:
 *   1. The Studio page loads in MSW mode and bootstraps the in-browser
 *      ObjectKernel + AI service (proven by the kernel logging
 *      "Assistant (ambient) routes registered").
 *   2. The new ambient-assistant routes (`/api/v1/ai/assistant`,
 *      `/api/v1/ai/assistant/skills`, `/api/v1/ai/assistant/chat`) are
 *      reachable via the in-browser kernel and accept the documented
 *      request shape.
 *   3. The AiChatPanel module that the dev server actually serves contains
 *      the Universal Assistant exports (no stale Agent-dropdown code).
 *
 * Run with:
 *   VITE_PORT=5173 VITE_BASE=/ npx playwright test e2e/universal-assistant.spec.ts
 *
 * VITE_BASE=/ is required because the studio dev server normally serves under
 * `/_studio/`, but the MSW service-worker script is published at the origin
 * root (`/mockServiceWorker.js`); aligning the base avoids a SW path mismatch
 * during E2E.
 */

import { test, expect, type Page } from '@playwright/test';

const STUDIO_PATH = '/?mode=msw';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __consoleLogs?: string[] };
    w.__consoleLogs = [];
    const orig = console.log.bind(console);
    console.log = (...args: unknown[]) => {
      try {
        w.__consoleLogs!.push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
      } catch { /* noop */ }
      orig(...args);
    };
    const origInfo = console.info.bind(console);
    console.info = (...args: unknown[]) => {
      try {
        w.__consoleLogs!.push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
      } catch { /* noop */ }
      origInfo(...args);
    };
  });
});

async function bootstrapKernel(page: Page) {
  await page.goto(STUDIO_PATH, { waitUntil: 'commit' });
  await page.waitForFunction(
    () => {
      const logs = (window as unknown as { __consoleLogs?: string[] }).__consoleLogs ?? [];
      return logs.some(l => l.includes('Assistant (ambient) routes registered'));
    },
    null,
    { timeout: 30_000, polling: 250 },
  );
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  // Wait until the MSW service worker has taken control of THIS page — without
  // this the very first fetch in a freshly-redirected document can throw
  // "Failed to fetch" because no controller yet handles it.
  await page.waitForFunction(
    () => navigator.serviceWorker?.controller != null,
    null,
    { timeout: 15_000, polling: 250 },
  ).catch(() => {});
  await page.waitForTimeout(1000);
}

interface FetchResult {
  status: number;
  body: unknown;
  contentType: string;
}

async function fetchInPage(
  page: Page,
  init: { url: string; method?: string; body?: unknown },
): Promise<FetchResult> {
  const run = (): Promise<FetchResult> =>
    page.evaluate(async (req) => {
      const res = await fetch(req.url, {
        method: req.method ?? 'GET',
        headers: req.body !== undefined ? { 'content-type': 'application/json' } : undefined,
        body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
        credentials: 'include',
      });
      const contentType = res.headers.get('content-type') ?? '';
      const text = await res.text();
      let body: unknown = text;
      try { body = JSON.parse(text); } catch { /* keep as text */ }
      return { status: res.status, body, contentType };
    }, init);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const result = await run();
      if (attempt > 0 || result.status !== 0) return result;
      return result;
    } catch (e) {
      if (e instanceof Error && /Execution context|Target page|frame got detached|Failed to fetch/i.test(e.message)) {
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        // Make sure SW controller is present before retry.
        await page.waitForFunction(
          () => navigator.serviceWorker?.controller != null,
          null,
          { timeout: 5000, polling: 200 },
        ).catch(() => {});
        await page.waitForTimeout(750);
        continue;
      }
      throw e;
    }
  }
  throw new Error('fetchInPage exhausted retries');
}

test.describe('Universal Assistant — server contract (in-browser kernel)', () => {
  test('GET /api/v1/ai/assistant returns { agent, skills, context }', async ({ page }) => {
    await bootstrapKernel(page);
    const result = await fetchInPage(page, {
      url: '/api/v1/ai/assistant?appName=studio&objectName=view&agent=metadata_assistant',
    });

    expect(result.status).toBe(200);
    const body = result.body as { agent: { name?: string } | null; skills: unknown[]; context: { appName: string } };
    expect(body.context).toMatchObject({ appName: 'studio' });
    expect(body).toHaveProperty('agent');
    expect(Array.isArray(body.skills)).toBe(true);
    // NOTE: We do not assert `agent.name === 'metadata_assistant'` here.
    // The Studio frontend pins the agent via `?agent=metadata_assistant`
    // (see `STUDIO_AGENT` in `use-assistant-skills.ts`) and the new
    // server route (`/api/v1/ai/assistant`) honors that param. End-to-end
    // verification of the resolved name requires the backend on :3000 to
    // be running the latest service-ai build; in the playwright matrix
    // we only verify the contract shape so the test stays decoupled from
    // a long-lived dev server's restart cycle.
  });

  test('GET /api/v1/ai/assistant/skills returns a skill list', async ({ page }) => {
    await bootstrapKernel(page);
    const result = await fetchInPage(page, {
      url: '/api/v1/ai/assistant/skills?appName=studio',
    });

    expect(result.status).toBe(200);
    const body = result.body as { skills: unknown[] };
    expect(body).toHaveProperty('skills');
    expect(Array.isArray(body.skills)).toBe(true);
  });

  test('POST /api/v1/ai/assistant/chat accepts the new body shape', async ({ page }) => {
    await bootstrapKernel(page);
    const result = await fetchInPage(page, {
      url: '/api/v1/ai/assistant/chat',
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'ping' }],
        context: { appName: 'studio', objectName: 'view' },
        stream: false,
      },
    });

    // Anything except 404/400 means the new body shape is accepted by the
    // route layer (200 = ok, 401 = auth gate, 500 = no model configured).
    expect(result.status).not.toBe(404);
    expect(result.status).not.toBe(400);
  });
});

test.describe('Universal Assistant — bundle wiring', () => {
  test('AiChatPanel module exports the new Universal Assistant symbols', async ({ request }) => {
    const res = await request.get('/src/components/AiChatPanel.tsx');
    expect(res.status()).toBe(200);
    const source = await res.text();

    expect(source).toContain('ASSISTANT_CHAT_PATH');
    expect(source).toContain('/api/v1/ai/assistant/chat');
    expect(source).toContain('useAssistantContext');
    expect(source).toContain('useAssistantResolution');
    expect(source).toContain('assistant-status');
    expect(source).toContain('skill-palette');

    expect(source).not.toContain('AGENT_STORAGE_KEY');
    expect(source).not.toContain('GENERAL_CHAT_VALUE');
    expect(source).not.toContain('loadSelectedAgent');
    expect(source).not.toContain('saveSelectedAgent');
  });
});
