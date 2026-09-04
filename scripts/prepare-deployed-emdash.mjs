import { isExpectedDeployment, isBootstrapCurrent } from "./deployment-readiness.mjs";
import { resolveBootstrapServiceToken } from "./emdash-bootstrap-auth.mjs";

const expectedSha = process.env.ASTROPAGES_COMMIT_SHA?.trim();
const envName = process.argv[2];
if (!["preview", "production"].includes(envName)) {
  fail("Usage: node scripts/prepare-deployed-emdash.mjs <preview|production>");
}

const accountId = requiredEnv("CLOUDFLARE_ACCOUNT_ID");
const token = requiredEnv("CLOUDFLARE_API_TOKEN");
const variablePrefix = deploymentVariablePrefix(envName);
const databaseId = requiredEnv(`${variablePrefix}_SITE_D1_DATABASE_ID`);
const workerUrl = requiredEnv(`${variablePrefix}_SITE_URL`).replace(/\/$/, "");

console.log(`Preparing deployed EmDash runtime for ${envName}...`);
await warmWorkerHealth();
await repairKnownEmDashMigrationState();
await warmEmDashRuntime();
await repairKnownEmDashMigrationState();
const collectionCount = await getCollectionCount();
if (collectionCount === 0) {
  await configureEmDashSite();
} else {
  console.log(`EmDash collections already present (${collectionCount} collection rows).`);
}
await bootstrapAstroPagesBuilderContent();
console.log(`Deployed EmDash runtime is ready for ${envName}.`);

async function warmWorkerHealth() {
  console.log("Waiting for deployed Worker health...");
  const deadline = Date.now() + 120_000;
  let lastStatus = "unreachable";
  const healthUrl = `${workerUrl}/api/astropages/generated-site/health`;

  while (Date.now() < deadline) {
    try {
      const response = await warmupFetchWithTimeout(healthUrl, { method: "GET" }, 15_000);
      if (response.ok && isExpectedDeployment(await response.json().catch(() => null), expectedSha)) {
        console.log("Deployed Worker health route is ready.");
        return;
      }
      lastStatus = response.ok ? "stale deployment" : response.status;
      if (!response.ok && !isTransientWarmupStatus(response.status)) {
        fail(`worker_unhealthy_after_deploy: health route returned ${response.status}`);
      }
      console.log(`Worker health route returned ${lastStatus}; retrying...`);
    } catch (error) {
      lastStatus = describeWarmupError(error);
      if (!isTransientWarmupError(error)) {
        throw error;
      }
      console.log(`Worker health route ${lastStatus}; retrying...`);
    }
    await sleep(5_000);
  }

  fail(`worker_unhealthy_after_deploy: health route ${lastStatus}`);
}

async function warmEmDashRuntime() {
  console.log("Warming deployed EmDash runtime...");
  const deadline = Date.now() + 360_000;
  let lastStatus = "unreachable";
  while (Date.now() < deadline) {
    try {
      const response = await warmupFetchWithTimeout(
        `${workerUrl}/_emdash/api/setup/status`,
        { method: "GET" },
        240_000,
      );
      if (response.ok) return;
      lastStatus = response.status;
      if (!isTransientWarmupStatus(response.status)) {
        fail(`emdash_setup_unavailable: setup status returned ${response.status}`);
      }
      console.log(`EmDash setup status returned ${response.status}; retrying...`);
    } catch (error) {
      lastStatus = describeWarmupError(error);
      if (!isTransientWarmupError(error)) {
        throw error;
      }
      console.log(`EmDash setup status ${lastStatus}; retrying...`);
    }
    await sleep(5_000);
  }
  fail(`emdash_setup_unavailable: setup status ${lastStatus}`);
}

async function repairKnownEmDashMigrationState() {
  await repairRemovedSectionCategoriesMigration();
  await repairPluginMetadataMigration();
  await repairLegacyTemplateContentColumns();
}

async function repairLegacyTemplateContentColumns() {
  // Existing preview databases can predate fields in the current builder
  // registry. Reconcile only missing content columns before bootstrap.
  const legacyTemplateContentColumns = {
    ec_site_pages: [
      "title",
      "hero_kicker",
      "hero_title",
      "hero_body",
      "hero_subtext",
      "hero_side_note",
      "generator_title",
      "generator_body",
      "nine_centres_eyebrow",
      "nine_centres_title",
      "concepts_eyebrow",
      "concepts_title",
      "types_eyebrow",
      "types_title",
      "types_hint",
      "readings_eyebrow",
      "readings_title",
      "readings_note",
      "how_eyebrow",
      "how_title",
      "letters_eyebrow",
      "faq_eyebrow",
      "faq_title",
      "articles_eyebrow",
      "articles_title",
      "articles_view_all",
      "final_cta_title",
      "final_cta_button",
      "hero_primary_cta",
      "hero_secondary_cta",
      "feature_1_title",
      "feature_1_body",
      "feature_2_title",
      "feature_2_body",
      "feature_3_title",
      "feature_3_body",
      "footer_note",
      "not_found_title",
      "not_found_body",
      "not_found_cta",
      "seo_title",
      "seo_description",
      "seo_canonical_path",
      "seo_robots",
      "og_title",
      "og_description",
      "og_image",
      "og_image_alt",
      "twitter_card",
      "twitter_title",
      "twitter_description",
      "twitter_image",
    ],
    ec_site_chrome: [
      "title",
      "brand_name",
      "nav_home",
      "footer_brand_name",
      "footer_about",
    ],
  };

  for (const [tableName, columns] of Object.entries(legacyTemplateContentColumns)) {
    await addMissingColumns(
      tableName,
      Object.fromEntries(columns.map((column) => [column, "TEXT"])),
    );
  }
}

async function addMissingColumns(tableName, definitions) {
  if (!(await tableExists(tableName))) return;

  const existingColumns = new Set(
    (await d1Query(`PRAGMA table_info(${quoteIdentifier(tableName)});`))
      .map((column) => column.name),
  );
  for (const [columnName, definition] of Object.entries(definitions)) {
    if (existingColumns.has(columnName)) continue;
    console.log(`Repairing legacy template schema: adding ${tableName}.${columnName}`);
    await d1Query(
      `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${quoteIdentifier(columnName)} ${definition};`,
    );
    existingColumns.add(columnName);
  }
}

async function repairRemovedSectionCategoriesMigration() {
  if (!(await tableExists("_emdash_sections")) || !(await tableExists("_emdash_migrations"))) return;

  const hasCategoryId = await columnExists("_emdash_sections", "category_id");
  const migration = await migrationRecorded("021_remove_section_categories");

  if (!hasCategoryId && !migration) {
    console.log("Recording completed EmDash migration: 021_remove_section_categories");
    await recordMigration("021_remove_section_categories");
  }
}

async function repairPluginMetadataMigration() {
  if (!(await tableExists("_plugin_state")) || !(await tableExists("_emdash_migrations"))) return;

  const migration = await migrationRecorded("023_plugin_metadata");
  if (migration) return;

  const hasDisplayName = await columnExists("_plugin_state", "display_name");
  const hasDescription = await columnExists("_plugin_state", "description");

  if (!hasDisplayName) {
    console.log("Repairing partial EmDash migration: adding _plugin_state.display_name");
    await d1Query("ALTER TABLE _plugin_state ADD COLUMN display_name TEXT;");
  }
  if (!hasDescription) {
    console.log("Repairing partial EmDash migration: adding _plugin_state.description");
    await d1Query("ALTER TABLE _plugin_state ADD COLUMN description TEXT;");
  }

  console.log("Recording completed EmDash migration: 023_plugin_metadata");
  await recordMigration("023_plugin_metadata");
}

async function tableExists(tableName) {
  const rows = await d1Query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?;",
    [tableName],
  );
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const columns = await d1Query(`PRAGMA table_info(${quoteIdentifier(tableName)});`);
  return columns.some((column) => column.name === columnName);
}

async function migrationRecorded(name) {
  const rows = await d1Query(
    "SELECT name FROM _emdash_migrations WHERE name = ?;",
    [name],
  );
  return rows.length > 0;
}

async function recordMigration(name) {
  await d1Query(
    "INSERT INTO _emdash_migrations (name, timestamp) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ','now'));",
    [name],
  );
}

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    fail(`Invalid D1 identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

async function getCollectionCount() {
  const rows = await d1Query("SELECT COUNT(*) AS count FROM _emdash_collections;");
  return Number(rows[0]?.count ?? 0);
}

async function configureEmDashSite() {
  console.log("Configuring EmDash through deployed setup API...");
  const response = await fetchWithTimeout(`${workerUrl}/_emdash/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "AstroPages Base Template",
      tagline: "Neutral AstroPages generated-site starter with EmDash content editing",
      includeContent: false,
    }),
  }, 180_000);
  const body = await response.json().catch(() => ({}));
  if (response.status === 409) {
    console.log("EmDash setup is already configured.");
    return;
  }
  if (!response.ok) {
    fail(`EmDash setup failed: ${body.error?.code ?? response.status}`);
  }
  console.log("EmDash configured.");
}

async function bootstrapAstroPagesBuilderContent() {
  if (await bootstrapReadinessIsCurrent()) {
    console.log("Bootstrap already current; skipping full builder content bootstrap.");
    return;
  }

  console.log("Bootstrapping AstroPages EmDash builder content...");
  const serviceToken = bootstrapServiceToken();
  let cursor = 0;
  let batch = 1;
  let totalCollections = 0;
  let totalFields = 0;
  let totalEntries = 0;
  let totalTargets = 0;

  while (cursor !== null) {
    const body = await postBootstrapBatch({ serviceToken, cursor, limit: 10 });
    if (body.status !== "ready" || !body.data) {
      fail(`AstroPages builder content bootstrap failed: ${body.code ?? body.error ?? body.status ?? "invalid_response"}`);
    }
    const result = body.data;
    totalCollections += Number(result.collections ?? 0);
    totalFields += Number(result.fields ?? 0);
    totalEntries += Number(result.entries ?? 0);
    totalTargets = Number(result.totalTargets ?? totalTargets);
    console.log(
      `AstroPages builder content batch ${batch} ready: ${result.processedTargets ?? "?"}/${totalTargets || "?"} targets.`,
    );
    cursor = typeof result.nextCursor === "number" ? result.nextCursor : null;
    batch += 1;
  }

  if (!(await bootstrapReadinessIsCurrent())) {
    fail("AstroPages builder content bootstrap failed: deployed deep or fast readiness is not ready.");
  }

  console.log(
    `AstroPages builder content ready: ${totalCollections} collections, ${totalFields} fields, ${totalEntries} entries.`,
  );
}

async function bootstrapReadinessIsCurrent() {
  const deep = await readEditReadiness("deep");
  const fast = await readEditReadiness("fast");
  if (isBootstrapCurrent(deep, fast)) return true;
  console.log(`Bootstrap verification: content=${deep?.ready === true ? "ready" : "not_ready"}, completion_record=${fast?.ready === true ? "current" : "missing_or_stale"}; full bootstrap required.`);
  return false;
}

async function readEditReadiness(mode) {
  const readinessUrl = `${workerUrl}/api/astropages/generated-site/edit-readiness${mode === "deep" ? "?deep=1" : ""}`;
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await warmupFetchWithTimeout(readinessUrl, { method: "GET", cache: "no-store" }, 15_000);
      const body = await response.json().catch(() => null);
      if (body && isExpectedDeployment(body, expectedSha)) {
        return response.ok ? body : { ...body, ready: false };
      }
      console.log("Waiting for edit readiness from the requested deployment...");
    } catch (error) {
      if (!isTransientWarmupError(error)) throw error;
      console.log(`Edit readiness ${describeWarmupError(error)}; retrying...`);
    }
    await sleep(5_000);
  }
  fail("Edit readiness did not confirm the requested deployment before timeout.");
}

function bootstrapServiceToken() {
  return resolveBootstrapServiceToken(process.env);
}

async function postBootstrapBatch({ serviceToken, cursor, limit }) {
  const deadline = Date.now() + 180_000;
  let lastStatus = "unreachable";
  const url = `${workerUrl}/api/astropages/generated-site/emdash/bootstrap`;
  const body = JSON.stringify({ mode: "full", cursor, limit });

  while (Date.now() < deadline) {
    let response;
    try {
      response = await warmupFetchWithTimeout(
        url,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceToken}`,
            "Content-Type": "application/json",
          },
          body,
        },
        60_000,
      );
    } catch (error) {
      lastStatus = describeWarmupError(error);
      if (!isTransientWarmupError(error)) {
        throw error;
      }
      console.log(`AstroPages builder content bootstrap ${lastStatus}; retrying...`);
      await sleep(5_000);
      continue;
    }

    const payload = await response.json().catch(() => ({}));
    if (response.ok && !isExpectedDeployment(payload, expectedSha)) {
      lastStatus = "stale deployment";
      console.log("Bootstrap reached an older Worker; retrying the same batch...");
      await sleep(5_000);
      continue;
    }
    if (response.ok) {
      return payload;
    }

    lastStatus = response.status;
    if (!isTransientWarmupStatus(response.status)) {
      fail(`AstroPages builder content bootstrap failed: ${payload.code ?? payload.error ?? response.status}`);
    }

    const responseMessage = typeof payload.message === "string" ? payload.message.trim() : "";
    console.log(
      `AstroPages builder content bootstrap returned ${response.status}${responseMessage ? ` (${responseMessage})` : ""}; retrying...`,
    );
    await sleep(5_000);
  }

  fail(`AstroPages builder content bootstrap failed: endpoint ${lastStatus}`);
}

async function d1Query(sql, params = []) {
  const response = await cloudflare(
    `/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      body: JSON.stringify({ sql, params }),
    },
  );
  const first = response.result?.[0];
  if (!first?.success) {
    fail(`D1 query failed while preparing EmDash runtime.`);
  }
  return first.results ?? [];
}

async function cloudflare(path, options = {}) {
  const response = await fetchWithTimeout(
    `https://api.cloudflare.com/client/v4${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    },
    30_000,
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    const message =
      body.errors?.map((error) => error.message).join("; ") || response.statusText;
    fail(`Cloudflare API request failed for ${path}: ${message}`);
  }
  return body;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      fail(`Request timed out after ${timeoutMs}ms for ${new URL(url).pathname}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function warmupFetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function isTransientWarmupStatus(status) {
  return status === 401 || status === 404 || status === 429 || status >= 500;
}

function isTransientWarmupError(error) {
  return error?.name === "AbortError" || error instanceof TypeError;
}

function describeWarmupError(error) {
  if (error?.name === "AbortError") {
    return "timed out";
  }
  if (error instanceof Error && error.message) {
    return `failed: ${error.message}`;
  }
  return "failed";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) fail(`${name} is required`);
  return value;
}

function deploymentVariablePrefix(envName) {
  return envName === "production" ? "PRODUCTION" : "PREVIEW";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
