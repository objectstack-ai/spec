// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * E2E smoke for the Universal Assistant wiring (Phase E).
 *
 * Verifies that:
 *   1. The Studio page loads and bootstraps MSW + the in-browser ObjectKernel.
 *   2. The new ambient-assistant routes (`/api/v1/ai/assistant`,
 *      `/api/v1/ai/assistant/skills`) are registered and respond with the
 *      contract the new AiChatPanel relies on.
 *   3. The AiChatPanel module that the dev server actually serves contains the
 *      Universal Assistant exports (no stale Agent-dropdown code).
 *
 * We intentionally do NOT drive the React UI through the auth flow — Studio
 * delegates login to a separate Account SPA, which makes pure-Studio E2E
 * coverage of the panel's visible state out of scope. The UI behaviour itself
 * is covered by the vitest unit tests in `test/ai-chat-panel.test.tsx`.
 */

import { test, expect } from '@playwright/test';

const STUDIO_PATH = '/?mode=msw';

async function waitForKernel(page: import('@playwright/test').Page) {
  await page.goto(STUDIO_PATH, { waitUntil: 'networkidle' });
  // Wait for the in-browser kernel to log "Service started" — proves the
  // ObjectStack kernel + AI plugin finished bootstrapping inside the page.
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __aiReady?: boolean };
      return w.__aiReady === true;
    },
    null,
    { timeout: 30_000 },
  ).catch(() => {
    /* fall back to a fixed timeout if the marker hook isn't installed */
  });
  // Allow any post-init redirects (login redirect etc.) to settle.
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(500);
}

test.describe('Universal Assistant — server contract (in-browser kernel)', () => {
  test('GET /api/v1/ai/assistant returns { agent, skills, context }', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    await waitForKernel(page);

    const result = await page.evaluate(async () => {
      const res = await fetch(
        '/api/v1/ai/assistant?appName=studio&objectName=view',
        { credentials: 'include' },
      );
      return { status: res.status, body: await res.json().catch(() => null) };
    });

    // Also try the older /api/v1/ai/agents to confirm AI routes are wired at all
    const agentsCheck = await page.evaluate(async () => {
      const res = await fetch('/api/v1/ai/agents', { credentials: 'include' });
      return { status: res.status };
    });
    const aiChatCheck = await page.evaluate(async () => {
      const res = await fetch('/api/v1/ai/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}', credentials: 'include' });
      return { status: res.status };
    });
    const dataCheck = await page.evaluate(async () => {
      const res = await fetch('/api/v1/data/sys_user', { credentials: 'include' });
      return { status: res.status };
    });
    const wellKnown = await page.evaluate(async () => {
      const res = await fetch('/.well-known/objectstack', { credentials: 'include' });
      return { status: res.status, body: await res.text().catch(() => '') };
    });

    console.log('--- ALL page console logs ---');
    consoleLogs.filter(l => /\[AI\]|\[MSW\]|\[KernelFactory\]|\[Console\]|service.*started|routes registered/i.test(l)).forEach(l => console.log(l));
    const kernelDiag = await page.evaluate(async () => {
      const w: any = window;
      const k = w.__objectStackKernel || w.kernel || null;
      if (!k) return { hasKernel: false, keys: Object.keys(w).filter(x => /kernel|stack/i.test(x)) };
      return {
        hasKernel: true,
        services: Array.from(k.services?.keys?.() ?? []),
        hasAiRoutes: Array.isArray(k.__aiRoutes),
        aiRoutesCount: k.__aiRoutes?.length ?? 0,
        aiRoutesPaths: (k.__aiRoutes ?? []).map((r: any) => `${r.method} ${r.path}`).slice(0, 20),
      };
    });
    console.log('--- kernel diag:', JSON.stringify(kernelDiag, null, 2));
    console.log('--- /api/v1/ai/chat check:', aiChatCheck);
    console.log('--- /api/v1/data/sys_user check:', dataCheck);
    console.log('--- /.well-known/objectstack check:', wellKnown);
    console.log('--- /api/v1/ai/assistant result:', result);

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      context: expect.objectContaining({ appName: 'studio' }),
    });
    // `agent` may be null if no default agent is bound; that's fine.
    expect(result.body).toHaveProperty('agent');
    expect(Array.isArray(result.body.skills)).toBe(true);
  });

  test('GET /api/v1/ai/assistant/skills returns a skill list', async ({ page }) => {
    await waitForKernel(page);

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/v1/ai/assistant/skills?appName=studio', {
        credentials: 'include',
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('skills');
    expect(Array.isArray(result.body.skills)).toBe(true);
  });

  test('POST /api/v1/ai/assistant/chat accepts the new body shape', async ({ page }) => {
    await waitForKernel(page);

    const result = await page.evaluate(async () => {
      const res = await fetch('/api/v1/ai/assistant/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          context: { appName: 'studio', objectName: 'view' },
          stream: false,
        }),
      });
      return {
        status: res.status,
        // The response may be a streamed data-stream; for this contract test
        // we only care that the route accepted the new body shape (i.e. did
        // not 404 / 400 on the new fields).
        contentType: res.headers.get('content-type') ?? '',
      };
    });

    // 200 = responded; 401 = auth-gated (still proves the route exists);
    // 500 = handler reached but model not configured. Anything except 404/400
    // means the new body shape is accepted by the route layer.
    expect([200, 401, 500]).toContain(result.status);
  });
});

test.describe('Universal Assistant — bundle wiring', () => {
  test('AiChatPanel module exports the new Universal Assistant symbols', async ({ request }) => {
    const res = await request.get('/src/components/AiChatPanel.tsx');
    expect(res.status()).toBe(200);
    const source = await res.text();

    // New exports / wiring must be present:
    expect(source).toContain('ASSISTANT_CHAT_PATH');
    expect(source).toContain('/api/v1/ai/assistant/chat');
    expect(source).toContain('useAssistantContext');
    expect(source).toContain('useAssistantResolution');
    expect(source).toContain('assistant-status');
    expect(source).toContain('skill-palette');

    // Old Agent-dropdown wiring must be GONE:
    expect(source).not.toContain('AGENT_STORAGE_KEY');
    expect(source).not.toContain('GENERAL_CHAT_VALUE');
    expect(source).not.toContain('loadSelectedAgent');
    expect(source).not.toContain('saveSelectedAgent');
  });
});
