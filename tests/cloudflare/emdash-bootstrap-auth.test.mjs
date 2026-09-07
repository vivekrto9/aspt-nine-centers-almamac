import assert from "node:assert/strict";
import test from "node:test";
import { resolveBootstrapServiceToken } from "../../scripts/emdash-bootstrap-auth.mjs";

for (const purpose of ["template_preview", "template_production"]) {
  test(`${purpose} bootstrap uses the deployed provision secret, not a pipeline-only callback token`, () => {
    assert.equal(resolveBootstrapServiceToken({
      ASTROPAGES_PIPELINE_PURPOSE: purpose,
      ASTROPAGES_CONTROL_PLANE_CALLBACK_TOKEN: "pipeline-only-token",
      SERVICE_CALLBACK_BEARER_TOKEN: "another-callback-token",
      BUILDER_MCP_PROVISION_SECRET: "deployed-provision-secret",
    }), "deployed-provision-secret");
    assert.throws(() => resolveBootstrapServiceToken({
      ASTROPAGES_PIPELINE_PURPOSE: purpose,
      ASTROPAGES_CONTROL_PLANE_CALLBACK_TOKEN: "pipeline-only-token",
    }), /Template content bootstrap requires BUILDER_MCP_PROVISION_SECRET/);
  });
}

for (const purpose of ["generated_preview", "generated_production"]) {
  test(`${purpose} bootstrap keeps callback authentication without requiring template secrets`, () => {
    assert.equal(resolveBootstrapServiceToken({
      ASTROPAGES_PIPELINE_PURPOSE: purpose,
      ASTROPAGES_CONTROL_PLANE_CALLBACK_TOKEN: "deployed-callback-token",
    }), "deployed-callback-token");
    assert.equal(resolveBootstrapServiceToken({
      ASTROPAGES_PIPELINE_PURPOSE: purpose,
      SERVICE_CALLBACK_BEARER_TOKEN: "legacy-callback-token",
    }), "legacy-callback-token");
  });
}

test("standalone bootstrap preserves its existing secret fallback and rejects missing credentials", () => {
  assert.equal(resolveBootstrapServiceToken({
    BUILDER_MCP_PROVISION_SECRET: "deployed-provision-secret",
  }), "deployed-provision-secret");
  assert.throws(() => resolveBootstrapServiceToken({}), /bootstrap requires/);
});
