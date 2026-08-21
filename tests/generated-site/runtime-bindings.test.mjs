import assert from "node:assert/strict";
import test from "node:test";

test("runtime binding resolution times out stalled Secret Store reads", async () => {
  const { resolveRuntimeBinding } = await import("../../src/server/aggregator/runtime-bindings.ts");
  const startedAt = Date.now();
  const value = await resolveRuntimeBinding({
    get: () => new Promise(() => {}),
  });

  assert.equal(value, "");
  assert.ok(Date.now() - startedAt < 2500);
});

test("secret binding resolution prefers Worker secrets and falls back to the legacy bundle", async () => {
  const { integrationSecretBundleBinding, resolveSecretBinding } = await import(
    "../../src/server/aggregator/runtime-bindings.ts"
  );
  const env = {
    DIRECT_ONLY_SECRET: "worker-secret",
    [integrationSecretBundleBinding]: JSON.stringify({
      secrets: {
        DIRECT_ONLY_SECRET: "legacy-secret",
        LEGACY_ONLY_SECRET: "legacy-secret",
      },
    }),
  };

  assert.equal(await resolveSecretBinding(env, "DIRECT_ONLY_SECRET"), "worker-secret");
  assert.equal(await resolveSecretBinding(env, "LEGACY_ONLY_SECRET"), "legacy-secret");
});
