// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * production-flow.test.ts
 *
 * End-to-end verification of the full production deployment shape:
 *
 *   Browser → DNS (project.hostname)
 *           → apps/cloud (or apps/objectos as runtime node)
 *               1. EnvironmentRegistry.resolveByHostname(host)
 *                  → control-plane lookup of sys_project by hostname
 *               2. Per-project kernel created (or fetched from cache)
 *                  with the project's database driver + the bundle
 *                  loaded by the chosen template ('crm' here)
 *               3. Request dispatched to the project kernel; hooks
 *                  (e.g. account_protection.beforeInsert) execute
 *
 * In production, apps/cloud and apps/objectos can run as a single
 * unified binary (this test) or as two separate processes connected by
 * `OS_CLOUD_URL`. Both topologies share the *exact same code paths*
 * exercised here — the only difference is the transport between the
 * EnvironmentRegistry and the control-plane SQL driver (in-process
 * driver vs HTTP). This test validates the in-process flavour because
 * it covers all the framework-side code; cross-process transport is a
 * deployment concern.
 */

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const workdir = mkdtempSync(join(tmpdir(), 'objectstack-prod-flow-'));
const controlDb = join(workdir, 'control.db');

process.env.OS_MODE = 'cloud';
process.env.OS_DATABASE_URL = `file:${controlDb}`;
process.env.AUTH_SECRET = 'production-flow-test-secret-must-be-at-least-32-chars-long';
process.env.PORT = '0';
process.env.OS_KERNEL_CACHE_SIZE = '8';
delete process.env.OS_PROJECT_ARTIFACTS;
delete process.env.OS_ARTIFACT_PATH;

const { ensureApp, ensureBoot } = await import('../server/index.js');

type Init = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    /** Sets the `Host` header — drives EnvironmentRegistry.resolveByHostname. */
    host?: string;
};

async function call(path: string, init: Init = {}): Promise<{ status: number; body: any }> {
    const app = await ensureApp();
    const headers: Record<string, string> = {
        'content-type': 'application/json',
        ...(init.headers ?? {}),
    };
    const reqInit: RequestInit = { method: init.method ?? 'GET', headers };
    if (init.body !== undefined) reqInit.body = JSON.stringify(init.body);
    // The `Host` header is forbidden for fetch() Requests — it's always
    // derived from the URL. To exercise hostname-based routing we have
    // to put the project's hostname into the URL itself; that's what
    // production does too (DNS resolves the vanity domain to the
    // runtime node, which then receives `Host: vanity.example.com`).
    const url = `http://${init.host ?? 'localhost'}${path}`;
    const res = await app.fetch(new Request(url, reqInit));
    const text = await res.text();
    let body: any = text;
    try { body = text ? JSON.parse(text) : null; } catch { /* leave as text */ }
    return { status: res.status, body };
}

async function waitForActive(projectId: string, timeoutMs = 30_000): Promise<any> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const { status, body } = await call(`/api/v1/cloud/projects/${projectId}`);
        if (status === 200 && body?.data?.project?.status === 'active') return body.data.project;
        if (status === 200 && body?.data?.project?.status === 'failed') {
            throw new Error(
                `Project ${projectId} failed to provision: ${JSON.stringify(body?.data?.project?.metadata)}`,
            );
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

const state = { orgId: '', projectId: '', hostname: '' };

test('boot apps/cloud and seed organization', async () => {
    const boot = await ensureBoot();
    const ql = (boot.kernel as any).getService('objectql');
    if (!ql || typeof ql.insert !== 'function') {
        throw new Error('control-plane objectql unavailable on cloud kernel');
    }
    state.orgId = (globalThis as any).crypto.randomUUID();
    await ql.insert('sys_organization', {
        id: state.orgId,
        name: 'Production Flow Test Org',
        slug: `prod-${state.orgId.slice(0, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
});

test('GET /cloud/templates exposes the CRM template', async () => {
    const { status, body } = await call('/api/v1/cloud/templates');
    assert(status === 200, `templates GET expected 200, got ${status}`);
    const ids = (body?.data?.templates ?? []).map((t: any) => t.id);
    assert(ids.includes('crm'), `expected 'crm' in templates, got ${JSON.stringify(ids)}`);
});

test('POST /cloud/projects with template_id=crm + hostname provisions an active project', async () => {
    state.hostname = `crm-${Date.now().toString(36)}.test.localhost`;
    const { status, body } = await call('/api/v1/cloud/projects', {
        method: 'POST',
        body: {
            organization_id: state.orgId,
            display_name: 'CRM Production Flow',
            driver: 'sqlite',
            hostname: state.hostname,
            template_id: 'crm',
            metadata: { __simulateDelayMs: 0 },
        },
    });
    if (status < 200 || status >= 300) {
        throw new Error(`project create failed: ${status} ${JSON.stringify(body)}`);
    }
    state.projectId = body?.data?.project?.id ?? body?.data?.id;
    assert(state.projectId, `no project id returned: ${JSON.stringify(body)}`);
    const project = await waitForActive(state.projectId);
    assert(
        project?.hostname === state.hostname,
        `persisted hostname mismatch: expected ${state.hostname}, got ${project?.hostname}`,
    );
});

test('POST /api/v1/data/account with bad website (Host: <project hostname>) → 400 from CRM hook', async () => {
    const { status, body } = await call('/api/v1/data/account', {
        method: 'POST',
        host: state.hostname,
        body: {
            name: 'Production Flow Co.',
            website: 'bogus',
            account_number: 'pf-001',
        },
    });
    assert(status === 400, `expected 400 (hook), got ${status} body=${JSON.stringify(body)}`);
    assert(
        typeof body?.error === 'string' && /website must start with/i.test(body.error),
        `expected CRM hook error, got ${JSON.stringify(body)}`,
    );
});

test('POST /api/v1/data/account with valid payload → 201 + uppercased account_number', async () => {
    const { status, body } = await call('/api/v1/data/account', {
        method: 'POST',
        host: state.hostname,
        body: {
            name: 'Acme Hostname Inc.',
            website: 'https://acme.example.com',
            account_number: 'pf-002',
        },
    });
    assert(status === 200 || status === 201, `expected 2xx, got ${status} body=${JSON.stringify(body)}`);
    const record = body?.record ?? body?.data?.record ?? body?.data;
    assert(record, `no record returned: ${JSON.stringify(body)}`);
    assert(
        record.account_number === 'PF-002',
        `account_number not uppercased by hook (got ${JSON.stringify(record.account_number)})`,
    );
});

test('seeded CRM data is queryable through the hostname-routed kernel', async () => {
    const { status, body } = await call('/api/v1/data/account?limit=200', { host: state.hostname });
    assert(status === 200, `query expected 200, got ${status}`);
    const rows: any[] = body?.data ?? body?.records ?? [];
    assert(Array.isArray(rows) && rows.length >= 1, `expected ≥1 account, got ${rows.length}`);
    const acme = rows.find((r) => /Acme/i.test(r.name));
    assert(acme, `inserted account not found in list response`);
});

let exitCode = 0;
console.log(`[production-flow] workdir: ${workdir}`);
for (const t of tests) {
    process.stdout.write(`  • ${t.name} ... `);
    try {
        await t.run();
        console.log('OK');
    } catch (err) {
        exitCode = 1;
        console.log('FAIL');
        console.error((err as Error).message);
    }
}
process.exit(exitCode);
