import { suite, test, before, after } from 'node:test';
import { strictEqual, ok } from 'node:assert/strict';
import { setupHarperWithFixture, teardownHarper, type ContextWithHarper } from '@harperfast/integration-testing';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '..');

// The `harper` package's `exports` map only exposes ".", so the harness's
// auto-resolution of 'harper/dist/bin/harper.js' fails with ERR_PACKAGE_PATH_NOT_EXPORTED.
// Resolve the CLI from the (exported) main entry and pass it explicitly.
const require = createRequire(import.meta.url);
const harperBinPath = resolve(dirname(require.resolve('harper')), 'bin/harper.js');

function authFetch(ctx: ContextWithHarper, path: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
    const { headers = {}, ...rest } = init;
    const creds = Buffer.from(`${ctx.harper.admin.username}:${ctx.harper.admin.password}`).toString('base64');
    return fetch(`${ctx.harper.httpURL}${path}`, { ...rest, headers: { Authorization: `Basic ${creds}`, ...headers } });
}

void suite('Application template', (ctx: ContextWithHarper) => {
    before(async () => {
        await setupHarperWithFixture(ctx, FIXTURE_PATH, { harperBinPath });
    });

    after(async () => {
        await teardownHarper(ctx);
    });

    void test('Harper starts successfully', async () => {
        const res = await authFetch(ctx, '/');
        ok([200, 400, 404].includes(res.status), `Unexpected status ${res.status}`);
    });

    void test('GET /TableName/ returns an array', async () => {
        const res = await authFetch(ctx, '/TableName/');
        strictEqual(res.status, 200);
        const body = await res.json();
        ok(Array.isArray(body), 'expected array response');
    });

    void test('POST /TableName/ creates a record', async () => {
        const res = await authFetch(ctx, '/TableName/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'test-1', name: 'Test Item', tag: 'test' }),
        });
        ok([200, 201, 204].includes(res.status), `expected successful create, got HTTP ${res.status}`);
    });

    void test('GET /TableName/:id returns the created record', async () => {
        await authFetch(ctx, '/TableName/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'test-get', name: 'Get Test', tag: 'lookup' }),
        });
        const res = await authFetch(ctx, '/TableName/test-get');
        strictEqual(res.status, 200);
        const body = await res.json() as { id: string; name: string; tag: string };
        strictEqual(body.name, 'Get Test');
    });

    void test('GET /Greeting returns hello world greeting', async () => {
        const res = await authFetch(ctx, '/Greeting');
        strictEqual(res.status, 200);
        if (res.status === 200) {
            const body = await res.json() as { greeting: string };
            ok(body.greeting, 'expected greeting field');
        }
    });
});
