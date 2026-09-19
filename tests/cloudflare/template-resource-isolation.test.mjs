import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { runtimeContract, loadWranglerConfig } from "../../scripts/cloudflare-runtime-contract.mjs";

test("template deployments isolate resources by template identity and environment", () => {
  const manifest = JSON.parse(readFileSync(new URL("../../template.manifest.json", import.meta.url), "utf8"));
  const config = loadWranglerConfig();
  const key = manifest.templateKey;
  assert.match(key, /^aspt-nine-centers-/);
  for (const environment of ["local", "preview", "production"]) {
    const prefix = environment === "local" ? key : `${key}-${environment}`;
    const resources = runtimeContract.resources[environment];
    const section = environment === "local" ? config : config.env[environment];
    if (environment === "local") {
      assert.equal(resources.workerName, prefix);
      assert.equal(resources.d1DatabaseName, `${prefix}-site`);
      assert.equal(resources.r2BucketName, `${prefix}-media`);
    } else {
      assert.match(resources.workerName, new RegExp(`-${environment}$`));
      assert.match(resources.d1DatabaseName, new RegExp(`-${environment}-site$`));
      assert.match(resources.r2BucketName, new RegExp(`-${environment}-media$`));
    }
    assert.equal(section.name, resources.workerName);
    assert.equal(section.d1_databases.find(item => item.binding === "DB").database_name, resources.d1DatabaseName);
    assert.equal(section.r2_buckets.find(item => item.binding === "MEDIA").bucket_name, resources.r2BucketName);
    if (environment !== "local") {
      assert.match(resources.kvNamespaceName, new RegExp(`-${environment}-session$`));
      const declared = manifest.cloudflare.environments.find(item => item.name === environment);
      for (const field of ["workerName", "d1DatabaseName", "r2BucketName", "kvNamespaceName"]) {
        assert.equal(declared[field], resources[field]);
      }
      const seedUrl = new URL(`../../.astropages/generated-site-workflows/deploy-${environment}.yml`, import.meta.url);
      if (existsSync(seedUrl)) {
        const seed = readFileSync(seedUrl, "utf8");
        assert.ok(seed.includes(`d1 migrations apply ${resources.d1DatabaseName}`));
        assert.ok(!seed.includes("d1 migrations apply astropages-base-template"));
      }
    }
  }
});
