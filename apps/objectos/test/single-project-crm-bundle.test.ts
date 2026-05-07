// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * Single-Project CRM Bundle E2E Smoke Test
 *
 * Verifies the production-mode boot path that lets `apps/objectos` host a
 * third-party app bundle (`examples/app-crm`) compiled by `objectstack
 * build`, and that:
 *
 *   1. The compiled JSON manifest **and** its sibling
 *      `objectstack-runtime.<hash>.mjs` are loaded together so hook
 *      handlers (functions) survive across the JSON boundary.
 *   2. Bare URLs like `/api/v1/data/account` (no `/projects/<id>` prefix,
 *      no hostname mapping, no X-Project-Id header) route into the lone
 *      project kernel via the `default-project` service registered by
 *      `createSingleProjectPlugin`.
 *   3. The CRM `account.beforeInsert` hook actually fires — both the
 *      validation branch (HTTP 400) and the side-effect branch
 *      (`account_number` lowercased input → uppercased on disk).
 *   4. SQLite auto-DDL stands up the `account` table on first write.
 *
 * Runs in-process. No child processes, no random port.
 *
 *   pnpm --filter @objectstack/objectos test:crm-bundle
 */

import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const workdir = mkdtempSync(join(tmpdir(), 'objectstack-crm-bundle-'));

const crmBundle = resolve(__dirname, '../../../examples/app-crm/dist/objectstack.json');

if (!existsSync(crmBundle)) {
    console.error(
        `\n[skip] CRM bundle not found at ${crmBundle}\n` +
        `       Run \`pnpm --filter @objectstack/app-crm build\` before this test.\n`,
    );
    process.exit(0);
}

// Env must be set BEFORE importing objectstack.config — it reads them at
// module load. The single-project default (no OS_CLOUD_URL set) is what
// activates createSingleProjectPlugin's `default-project` registration.
process.env.OS_ARTIFACT_PATH = crmBundle;
process.env.OS_DATA_DIR = workdir;
process.env.AUTH_SECRET = 'crm-bundle-test-secret-must-be-at-least-32-chars-long';
process.env.PORT = '0';
delete process.env.OS_CLOUD_URL;
delete process.env.OS_MODE;

const { ensureApp } = await import('../server/index.js');

async function call(path: string, init: { method?: string; body?: unknown } = {}): Promise<{ status: number; body: any }> {
    const app = await ensureApp();
    const reqInit: RequestInit = {
        method: init.method ?? 'GET',
        headers: { 'content-type': 'application/json', host: 'localhost' },
    };
    if (init.body !== undefined) reqInit.body = JSON.stringify(init.body);
    const res = await app.fetch(new Request(`http://localhost${path}`, reqInit));
    const text = await res.text();
    let body: any = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* leave as text */ }
    return { status: res.status, body };
}

function assert(cond: any, msg: string) {
    if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

const tests: Array<{ name: string; run: () => Promise<void> }> = [];
function test(name: string, run: () => Promise<void>) { tests.push({ name, run }); }

test('bare URL — bad website triggers CRM hook (HTTP 400)', async () => {
    const { status, body } = await call('/api/v1/data/account', {
        method: 'POST',
        body: { name: 'BareInvalid', website: 'bogus' },
    });
    assert(status === 400, `expected 400, got ${status} body=${JSON.stringify(body)}`);
    assert(
        typeof body?.error === 'string' && /website must start with/i.test(body.error),
        `expected hook error, got ${JSON.stringify(body)}`,
    );
});

test('bare URL — valid POST persists with uppercased account_number', async () => {
    const { status, body } = await call('/api/v1/data/account', {
        method: 'POST',
        body: { name: 'BareValid', website: 'https://acme.com', account_number: 'abc-9' },
    });
    assert(status === 200 || status === 201, `expected 2xx, got ${status} body=${JSON.stringify(body)}`);
    assert(
        body?.record?.account_number === 'ABC-9',
        `expected account_number ABC-9, got ${JSON.stringify(body?.record)}`,
    );
});

test('scoped URL /projects/proj_local/... still works (regression)', async () => {
    const { status, body } = await call('/api/v1/projects/proj_local/data/account', {
        method: 'POST',
        body: { name: 'ScopedReg', website: 'bogus' },
    });
    assert(status === 400, `expected 400, got ${status} body=${JSON.stringify(body)}`);
    assert(
        typeof body?.error === 'string' && /website must start with/i.test(body.error),
        `expected hook error, got ${JSON.stringify(body)}`,
    );
});

test('seed data from bundle is queryable (Acme Corporation)', async () => {
    const { status, body } = await call('/api/v1/data/account?limit=20', { method: 'GET' });
    assert(status === 200, `expected 200, got ${status} body=${JSON.stringify(body)}`);
    const records: any[] = body?.records ?? [];
    const hit = records.find(r => r?.name === 'Acme Corporation');
    assert(!!hit, `expected seed row "Acme Corporation" in records, got ${JSON.stringify(records.map(r => r?.name))}`);
});

test('action body — mark_primary flips contact.is_primary via QuickJS sandbox', async () => {
    // Pick a seeded contact whose is_primary is currently false. The CRM
    // contact_integrity hook makes ad-hoc inserts fragile, so we operate
    // on existing seed data and assert the action body's mutation lands.
    const list = await call('/api/v1/data/contact?limit=50', { method: 'GET' });
    assert(list.status === 200, `contact list: expected 200, got ${list.status} ${JSON.stringify(list.body)}`);
    const records: any[] = list.body?.records ?? [];
    const target = records.find(r => r?.is_primary === false || r?.is_primary == null);
    assert(!!target?.id, `no seeded contact with is_primary=false found: ${JSON.stringify(records.map(r => ({ id: r?.id, p: r?.is_primary })))}`);

    // Invoke the action whose body lives in metadata only.
    // Use the project-scoped URL form to make the routing explicit.
    const invoke = await call(`/api/v1/projects/proj_local/actions/contact/mark_primary/${target.id}`, { method: 'POST', body: {} });
    assert(
        invoke.status === 200,
        `action invoke: expected 200, got ${invoke.status} ${JSON.stringify(invoke.body)}`,
    );
    const findOkPayload = (v: any, depth = 0): any => {
        if (!v || typeof v !== 'object' || depth > 5) return null;
        if (v.ok === true || v.is_primary === true) return v;
        if (v.data) {
            const d = findOkPayload(v.data, depth + 1);
            if (d) return d;
        }
        if (v.result) return findOkPayload(v.result, depth + 1);
        return null;
    };
    const ret = findOkPayload(invoke.body);
    assert(
        ret,
        `action body did not return success payload: ${JSON.stringify(invoke.body)}`,
    );

    // Confirm the database mutation happened (sandbox -> ctx.api.update).
    const after = await call(`/api/v1/data/contact/${target.id}`, { method: 'GET' });
    assert(after.status === 200, `contact get: expected 200, got ${after.status} ${JSON.stringify(after.body)}`);
    assert(
        after.body?.record?.is_primary === true,
        `expected contact.is_primary=true after action, got ${JSON.stringify(after.body?.record)}`,
    );
});

let exitCode = 0;
for (const t of tests) {
    try {
        await t.run();
        console.log(`  ✓ ${t.name}`);
    } catch (e: any) {
        exitCode = 1;
        console.log(`  ✗ ${t.name}\n      ${e?.message ?? e}`);
    }
}

try { rmSync(workdir, { recursive: true, force: true }); } catch { /* best-effort */ }
process.exit(exitCode);
