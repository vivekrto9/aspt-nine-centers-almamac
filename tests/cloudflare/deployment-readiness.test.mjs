import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { isExpectedDeployment, isDeepReady, isBootstrapCurrent } from '../../scripts/deployment-readiness.mjs';

const source = readFileSync(new URL('../../scripts/prepare-deployed-emdash.mjs', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '');
const ready = (buildSha, value = true, mode = 'deep') => ({ buildSha, ready: value, bootstrap: { ready: value, mode, registryHash: 'hash' } });
const fast = (value = true) => ready('new', value, 'fast');

async function prepare({ health, readiness, batches = [] }) {
  const calls = [];
  await vm.runInNewContext(`(async () => { ${source} })()`, {
    process: { argv: ['node', 'prepare', 'preview'], env: {
      ASTROPAGES_COMMIT_SHA: 'new', CLOUDFLARE_ACCOUNT_ID: 'account',
      CLOUDFLARE_API_TOKEN: 'test', PREVIEW_SITE_D1_DATABASE_ID: 'db',
      PREVIEW_SITE_URL: 'https://worker.test',
    }, exit: () => { throw new Error('preparation failed'); } },
    console: { log() {}, error() {} },
    isExpectedDeployment, isDeepReady, isBootstrapCurrent, resolveBootstrapServiceToken: () => 'test',
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
        const body = readiness.shift();
        assert.equal(url.endsWith('?deep=1'), body.bootstrap.mode === 'deep');
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
    readiness: [ready('old'), ready('new', false), fast(false), ready('new'), fast()],
    batches: [batch('old'), batch('new')],
  });
  const posts = calls.filter(call => call.url.endsWith('/emdash/bootstrap'));
  assert.equal(posts.length, 2);
  assert.deepEqual(posts.map(call => JSON.parse(call.body)), [
    { mode: 'full', cursor: 0, limit: 10 }, { mode: 'full', cursor: 0, limit: 10 },
  ]);
});

test('only matching deep and fast readiness skip bootstrap', async () => {
  const calls = await prepare({ health: [{ buildSha: 'new' }], readiness: [ready('new'), fast()] });
  assert.equal(calls.some(call => call.url.endsWith('/emdash/bootstrap')), false);
  assert.equal(isDeepReady({ ready: true, bootstrap: { ready: true, mode: 'fast' } }), false);
  assert.equal(isExpectedDeployment({}, 'new'), false);
});

test('successful bootstrap cannot hide failed final deep readiness', async () => {
  await assert.rejects(prepare({
    health: [{ buildSha: 'new' }], readiness: [ready('new', false), fast(false), ready('new', false), fast()],
    batches: [{ status: 'ready', data: { buildSha: 'new', nextCursor: null } }],
  }), /preparation failed/);
});

for (const condition of ['missing', 'stale']) {
  test(`existing content with a ${condition} completion record must run full bootstrap`, async () => {
    const outdated = fast(false);
    outdated.bootstrap.registryHash = condition === 'stale' ? 'old-hash' : 'hash';
    const calls = await prepare({
      health: [{ buildSha: 'new' }],
      readiness: [ready('new'), outdated, ready('new'), fast()],
      batches: [{ status: 'ready', data: { buildSha: 'new', nextCursor: null } }],
    });
    assert.equal(calls.filter(call => call.url.endsWith('/emdash/bootstrap')).length, 1);
    assert.ok(calls.at(-1).url.endsWith('/edit-readiness'));
  });
}

test('deep readiness cannot hide a still-stale completion record after bootstrap', async () => {
  await assert.rejects(prepare({
    health: [{ buildSha: 'new' }],
    readiness: [ready('new'), fast(false), ready('new'), fast(false)],
    batches: [{ status: 'ready', data: { buildSha: 'new', nextCursor: null } }],
  }), /preparation failed/);
});
