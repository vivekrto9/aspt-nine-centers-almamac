import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { isExpectedDeployment, isDeepReady } from '../../scripts/deployment-readiness.mjs';

const source = readFileSync(new URL('../../scripts/prepare-deployed-emdash.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '');
const ready = (buildSha, value = true) => ({ buildSha, ready: value, bootstrap: { ready: value, mode: 'deep' } });

async function prepare({ health, readiness, batches = [] }) {
  const calls = [];
  await vm.runInNewContext(`(async () => { ${source} })()`, {
    process: { argv: ['node', 'prepare', 'preview'], env: {
      ASTROPAGES_COMMIT_SHA: 'new', CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_API_TOKEN: 'test', PREVIEW_SITE_D1_DATABASE_ID: 'db',
      PREVIEW_SITE_URL: 'https://worker.test',
    }, exit: () => { throw new Error('preparation failed'); } },
    console: { log() {}, error() {} },
    isExpectedDeployment, isDeepReady, resolveBootstrapServiceToken: () => 'test',
    URL, AbortController, Date,
    setTimeout: (callback, ms) => { if (ms === 5000) queueMicrotask(callback); return 1; },
    clearTimeout() {},
    fetch: async (url, options) => {
      calls.push({ url, body: options.body });
      if (url.includes('api.cloudflare.com')) {
        const { sql } = JSON.parse(options.body);
        return Response.json({ result: [{ success: true, results: sql.includes('COUNT(*)') ? [{ count: 1 }] : [] }] });
      }
      if (url.endsWith('/health')) return Response.json(health.shift());
      if (url.includes('/edit-readiness')) {
        assert.ok(url.endsWith('?deep=1'));
        const body = readiness.shift();
        return Response.json(body, { status: body.ready ? 200 : 503 });
      }
      if (url.endsWith('/emdash/bootstrap')) return Response.json(batches.shift());
      return Response.json({});
    },
  });
  return calls;
}

test('rollout ignores old ready responses and retries an old bootstrap batch without advancing', async () => {
  const batch = (buildSha) => ({ status: 'ready', data: { buildSha, nextCursor: null, totalTargets: 3 } });
  const calls = await prepare({
    health: [{ buildSha: 'old' }, { buildSha: 'new' }],
    readiness: [ready('old'), ready('new', false), ready('new')],
    batches: [batch('old'), batch('new')],
  });
  const posts = calls.filter(call => call.url.endsWith('/emdash/bootstrap'));
  assert.equal(posts.length, 2);
  assert.deepEqual(posts.map(call => JSON.parse(call.body)), [
    { mode: 'full', cursor: 0, limit: 10 }, { mode: 'full', cursor: 0, limit: 10 },
  ]);
});

test('only matching deep readiness skips bootstrap', async () => {
  const calls = await prepare({ health: [{ buildSha: 'new' }], readiness: [ready('new')] });
  assert.equal(calls.some(call => call.url.endsWith('/emdash/bootstrap')), false);
  assert.equal(isDeepReady({ ready: true, bootstrap: { ready: true, mode: 'fast' } }), false);
  assert.equal(isExpectedDeployment({}, 'new'), false);
});

test('successful bootstrap cannot hide failed final deep readiness', async () => {
  await assert.rejects(prepare({
    health: [{ buildSha: 'new' }], readiness: [ready('new', false), ready('new', false)],
    batches: [{ status: 'ready', data: { buildSha: 'new', nextCursor: null } }],
  }), /preparation failed/);
});
