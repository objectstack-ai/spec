// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Multi-Bundle E2E Smoke Test
 *
 * Boots the Server in `cloud` mode and provisions two projects, each
 * bound to a different compiled bundle via `metadata.artifact_path`
 * (Mode 3 in apps/objectos/README.md). Verifies that:
 *
 *   1. Each project kernel loads its own compiled bundle.
 *   2. Hooks from the bundle fire on writes routed via
 *      `/api/v1/projects/<id>/...` URLs (CRM `account.beforeInsert`).
 *   3. Cross-project schema isolation: project A (bound to CRM) sees
 *      `account` but project B (bound to TODO) does not.
 *   4. The `X-Project-Id` header path resolves to the same kernel as
 *      the path-scoped URL (verifies Step 5a end-to-end).
 *
 * Mode 2 (`OS_PROJECT_ARTIFACTS` env override) shares the same code
 * path inside `createFsAppBundleResolver` and is unit-tested in
 * `packages/services/service-cloud/test/fs-bundle-resolver.test.ts`.
 *
 *   pnpm --filter @objectstack/objectos test:multi-bundles
 */

import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const crmBundle = resolve(__dirname, '../../../examples/app-crm/dist/objectstack.json');
const todoBundle = resolve(__dirname, '../../../examples/app-todo/dist/objectstack.json');

if (!existsSync(crmBundle) || !existsSync(todoBundle)) {
    console.error(
        `\n[skip] Bundles missing:\n` +
        `       crm:  ${existsSync(crmBundle) ? 'ok' : 'MISSING'} (${crmBundle})\n` +
        `       todo: ${existsSync(todoBundle) ? 'ok' : 'MISSING'} (${todoBundle})\n` +
        `       Run \`pnpm -r --filter @example/app-crm --filter @example/app-todo build\` first.\n`,
    );
    process.exit(0);
}

const workdir = mkdtempSync(join(tmpdir(), 'objectstack-multi-bundle-'));
const controlDb = join(workdir, 'control.db');

process.env.OS_MODE = 'cloud';
process.env.OS_DATABASE_URL = `file:${controlDb}`;
process.env.AUTH_SECRET = 'multi-bundle-test-secret-must-be-at-least-32-chars-long';
process.env.PORT = '0';
process.env.OS_KERNEL_CACHE_SIZE = '8';
delete process.env.OS_PROJECT_ARTIFACTS;
delete process.env.OS_ARTIFACT_PATH;

const { ensureApp, ensureBoot } = await import('../server/index.js');

type Init = { method?: string; body?: unknown; headers?: Record<string, string>; projectId?: string };

async function call(path: string, init: Init = {}): Promise<{ status: number; body: any }> {
    const app = await ensureApp();
    const headers: Record<string, string> = {
        'content-type': 'application/json',
        host: 'localhost',
        ...(init.headers ?? {}),
    };
    if (init.projectId) headers['x-project-id'] = init.projectId;
    const reqInit: RequestInit = { method: init.method ?? 'GET', headers };
    if (init.body !== undefined) reqInit.body = JSON.stringify(init.body);
    const res = await app.fetch(new Request(`http://localhost${path}`, reqInit));
    const text = await res.text();
    let body: any = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* leave as text */ }
    return { status: res.status, body };
}

async function waitForActive(projectId: string, timeoutMs = 15_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const { status, body } = await call(`/api/v1/cloud/projects/${projectId}`);
        if (status === 200 && body?.data?.project?.status === 'active') return;
        if (status === 200 && body?.data?.project?.status === 'failed') {
            throw new Error(`Project ${projectId} failed: ${JSON.stringify(body?.data?.project?.metadata)}`);
        }
        await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Project ${projectId} did not become active within ${timeoutMs}ms`);
}

function assert(cond: any, msg: string) {
    if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

const tests: Array<{ name: string; run: () => Promise<void> }> = [];
function test(name: string, run: () => Promise<void>) { tests.push({ name, run }); }

const state = {
    orgId: '',
    projectCrm: '',
    projectTodo: '',
};

test('seed organization', async () => {
    const boot = await ensureBoot();
    const ql = (boot.kernel as any).getService('objectql');
    if (!ql || typeof ql.insert !== 'function') {
        throw new Error('control-plane objectql service unavailable');
    }
    state.orgId = (globalThis as any).crypto.randomUUID();
    await ql.insert('sys_organization', {
        id: state.orgId,
        name: 'Multi-Bundle Test Org',
        slug: `mb-${state.orgId.slice(0, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
});

test('provision project bound to CRM bundle', async () => {
    const { status, body } = await call('/api/v1/cloud/projects', {
        method: 'POST',
        body: {
            organization_id: state.orgId,
            display_name: 'CRM Bundle',
            driver: 'sqlite',
            metadata: { artifact_path: crmBundle, __simulateDelayMs: 0 },
        },
    });
    if (status < 200 || status >= 300) {
        throw new Error(`crm project create failed: ${status} ${JSON.stringify(body)}`);
    }
    state.projectCrm = body?.data?.project?.id ?? body?.data?.id;
    assert(state.projectCrm, 'no projectCrm id returned');
    await waitForActive(state.projectCrm);
});

test('provision project bound to TODO bundle', async () => {
    const { status, body } = await call('/api/v1/cloud/projects', {
        method: 'POST',
        body: {
            organization_id: state.orgId,
            display_name: 'TODO Bundle',
            driver: 'sqlite',
            metadata: { artifact_path: todoBundle, __simulateDelayMs: 0 },
        },
    });
    if (status < 200 || status >= 300) {
        throw new Error(`todo project create failed: ${status} ${JSON.stringify(body)}`);
    }
    state.projectTodo = body?.data?.project?.id ?? body?.data?.id;
    assert(state.projectTodo, 'no projectTodo id returned');
    await waitForActive(state.projectTodo);
});

test('CRM project: bad website triggers account.beforeInsert hook (HTTP 400)', async () => {
    const { status, body } = await call(`/api/v1/projects/${state.projectCrm}/data/account`, {
        method: 'POST',
        body: { name: 'Acme', website: 'bogus' },
    });
    assert(status === 400, `expected 400, got ${status} body=${JSON.stringify(body)}`);
    assert(
        typeof body?.error === 'string' && /website must start with/i.test(body.error),
        `expected hook error text, got ${JSON.stringify(body)}`,
    );
});

test('CRM project: valid POST persists with uppercased account_number', async () => {
    const { status, body } = await call(`/api/v1/projects/${state.projectCrm}/data/account`, {
        method: 'POST',
        body: { name: 'Acme OK', website: 'https://acme.com', account_number: 'mb-1' },
    });
    assert(status === 200 || status === 201, `expected 2xx, got ${status} body=${JSON.stringify(body)}`);
    assert(
        body?.record?.account_number === 'MB-1',
        `expected uppercased MB-1, got ${JSON.stringify(body?.record)}`,
    );
});

test('TODO project: account is NOT registered (cross-bundle isolation)', async () => {
    const { status, body } = await call(`/api/v1/projects/${state.projectTodo}/data/account`, {
        method: 'POST',
        body: { name: 'should not work' },
    });
    // Either 404 (object not registered) or some other error — must NOT be 2xx,
    // and must NOT trigger the CRM hook.
    assert(status >= 400, `expected error, got ${status} body=${JSON.stringify(body)}`);
    const text = JSON.stringify(body);
    assert(
        !/website must start with/i.test(text),
        `CRM hook leaked into TODO project: ${text}`,
    );
});

test('TODO project: task object is registered and writable', async () => {
    const { status, body } = await call(`/api/v1/projects/${state.projectTodo}/data/task`, {
        method: 'POST',
        body: {
            subject: 'Write multi-bundle test',
            status: 'in_progress',
            priority: 'high',
            owner: 'tester',
        },
    });
    assert(status === 200 || status === 201, `expected 2xx, got ${status} body=${JSON.stringify(body)}`);
    assert(body?.record?.subject === 'Write multi-bundle test', `record not returned: ${JSON.stringify(body)}`);
});

test('X-Project-Id header routes to the CRM kernel (Step 5a)', async () => {
    const { status, body } = await call('/api/v1/data/account', {
        method: 'POST',
        projectId: state.projectCrm,
        body: { name: 'Header Routed', website: 'bogus' },
    });
    assert(status === 400, `expected 400 via header, got ${status} body=${JSON.stringify(body)}`);
    assert(
        typeof body?.error === 'string' && /website must start with/i.test(body.error),
        `expected hook error via header, got ${JSON.stringify(body)}`,
    );
});

let exitCode = 0;
console.log(`[multi-bundle] workdir: ${workdir}`);
for (const t of tests) {
    process.stdout.write(`  • ${t.name} ... `);
    try {
        await t.run();
        console.log('OK');
    } catch (err) {
        exitCode = 1;
        console.log('FAIL');
        console.error((err as Error).message);
        if ((err as Error).stack) console.error((err as Error).stack);
        break;
    }
}

try { rmSync(workdir, { recursive: true, force: true }); } catch { /* best-effort */ }
process.exit(exitCode);
