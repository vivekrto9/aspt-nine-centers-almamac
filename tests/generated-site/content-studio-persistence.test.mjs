import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("Content Studio restores unsaved edits and hydrates saved drafts", () => {
  const client = read("src/builder/BuilderClient.astro");

  assert.match(client, /const pendingChangesStorageKey =/);
  assert.match(client, /sessionStorage\.setItem\(pendingChangesStorageKey/);
  assert.match(client, /const restorePendingChanges =/);
  assert.match(client, /const hydrateSavedDraftPreview = async/);
  assert.match(client, /applyChangeToEditableSurface\(change\)/);
  assert.match(client, /const captureActiveEditForReload =/);
  assert.match(client, /window\.addEventListener\("pagehide", captureActiveEditForReload\)/);
  assert.match(client, /void initializeEditablePreview\(\)/);
});

test("Content Studio repairs stale EmDash schema before save or publish", () => {
  const endpoint = read(
    "src/pages/api/astropages/generated-site/editor/content-field.ts",
  );

  assert.match(
    endpoint,
    /bootstrapAstroPagesEmDashContent\(\{ env, mode: "auto" \}\)/,
  );
  assert.equal(
    endpoint.match(
      /bootstrapAstroPagesEmDashContent\(\{ env, mode: "full" \}\)/g,
    )?.length,
    2,
  );
  assert.match(endpoint, /if \(!contentItem\(updated\)\)/);
  assert.match(endpoint, /updated = await updateItem\(repairedItem\.id\)/);
});

test("homepage renders the persisted hero title instead of hard-coded copy", () => {
  const page = read("src/pages/index.astro");
  const hero = read("src/components/home/sections/HomeHero.astro");

  assert.match(page, /title=\{content\.hero_title\}/);
  assert.match(hero, /title\?: string/);
  assert.match(hero, /data-hero-title[^>]*>\{title\}<\/h1>/);
});

test("content release and EmDash bootstrap use the template manifest identity", () => {
  const manifest = JSON.parse(read("template.manifest.json"));
  const bootstrap = read("src/server/generated-site/emdash-bootstrap.ts");
  const release = read("src/server/generated-site/content-release.ts");

  assert.match(
    bootstrap,
    new RegExp(`bootstrapTemplateKey = "${manifest.templateKey}"`),
  );
  assert.match(
    release,
    new RegExp(`templateKey: "${manifest.templateKey}"`),
  );
  assert.doesNotMatch(bootstrap, /astropages-base-template/);
  assert.doesNotMatch(release, /astropages-base-template/);
});
