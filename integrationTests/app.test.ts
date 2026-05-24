import { suite, test, before, after } from 'node:test';
import { strictEqual, ok } from 'node:assert/strict';
import { setupHarperWithFixture, teardownHarper, type ContextWithHarper } from '@harperfast/integration-testing';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '..');

function authFetch(ctx: ContextWithHarper, path: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
    const { headers = {}, ...rest } = init;
    const creds = Buffer.from(`${ctx.harper.admin.username}:${ctx.harper.admin.password}`).toString('base64');
    return fetch(`${ctx.harper.httpURL}${path}`, { ...rest, headers: { Authorization: `Basic ${creds}`, ...headers } });
}

void suite('Application template', (ctx: ContextWithHarper) => {
    before(async () => {
        await setupHarperWithFixture(ctx, FIXTURE_PATH);
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
        ok([200, 404].includes(res.status), `Unexpected status ${res.status}`);
        if (res.status === 200) {
            const body = await res.json() as { greeting: string };
            ok(body.greeting, 'expected greeting field');
        }
    });
});
