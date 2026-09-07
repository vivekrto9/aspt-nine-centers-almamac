import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("home chart flow calls the generated-site API and reveals its saved result in place", () => {
  const generator = read(
    "src/components/home/sections/BodygraphGeneratorSection.astro",
  );
  const result = read("src/pages/human-design/[slug].astro");
  assert.match(
    generator,
    /fetch\("\/api\/astropages\/generated-site\/human-design"/,
  );
  assert.match(generator, /payload\?\.readingId/);
  assert.match(generator, /hd:reading:/);
  assert.match(generator, /data-result-view/);
  assert.match(generator, /formView\.hidden = true/);
  assert.match(generator, /resultView\.hidden = false/);
  assert.doesNotMatch(generator, /window\.setTimeout\([\s\S]*2500/);
  assert.doesNotMatch(generator, /SAMPLE_RESULT|handleChartSubmit/);
  assert.match(result, /seo_robots:\s*"noindex,nofollow"/);
});

test("birth city fields use the shared Google Places selector and submit resolved coordinates", () => {
  const generator = read(
    "src/components/home/sections/BodygraphGeneratorSection.astro",
  );
  const chartForm = read("src/pages/human-design.astro");
  const selector = read("src/components/shared/PlaceAutocomplete.astro");
  assert.match(generator, /import PlaceAutocomplete/);
  assert.match(generator, /<PlaceAutocomplete[\s\S]*id="cs-city"/);
  assert.match(generator, /latitude: String\(values\.get\("latitude"\)/);
  assert.match(chartForm, /<PlaceAutocomplete[\s\S]*id="hd-city"/);
  assert.match(selector, /role="combobox"/);
  assert.match(selector, /role="listbox"/);
  assert.match(selector, /name="latitude"/);
  assert.match(selector, /name="longitude"/);
  assert.match(selector, /name="timezoneName"/);
  assert.match(selector, /generated-site\/places\/autocomplete/);
  assert.match(selector, /generated-site\/places\/details/);
  assert.match(selector, /Select a city from the suggestions/);
  assert.match(selector, /:global\(\.place-selector__option\)/);
  assert.match(selector, /grid-template-columns: minmax\(0, 1fr\)/);
});

test("all required Human Design visitor routes are implemented", () => {
  for (const path of [
    "src/pages/human-design.astro",
    "src/pages/human-design/[slug].astro",
  ])
    assert.ok(
      read(path).length > 100,
      `${path} must contain a real implementation`,
    );
  for (const path of [
    "src/pages/compatibility.astro",
    "src/pages/compatibility/[slug].astro",
    "src/pages/transit.astro",
  ])
    assert.equal(
      existsSync(new URL(path, root)),
      false,
      `${path} should be removed`,
    );
  const chartForm = read("src/pages/human-design.astro");
  assert.match(chartForm, /name="email" type="email"/);
  assert.match(read("src/pages/human-design/[slug].astro"), /chart-not-found/);
});

test("bodygraph result page exposes the Field Almanac explorer workspace and interpretation sections", () => {
  const result = read("src/pages/human-design/[slug].astro");
  const canvas = read("src/components/bodygraph/UpastroBodyGraphCanvas.jsx");
  assert.match(result, /Bodygraph explorer/);
  assert.match(
    result,
    /<UpastroBodyGraphCanvas theme="light"[\s\S]*client:only="react"/,
  );
  assert.match(result, /slot="fallback"[\s\S]*<BodyGraphCanvas theme="light"/);
  assert.match(canvas, /const PRIORITY_ACTIVE_OVERLAY_CHANNELS/);
  assert.match(canvas, /const INTEGRATION_CLUSTER_ALL_CHANNELS/);
  assert.match(canvas, /const getChannelSegments/);
  assert.match(canvas, /className={`upastro-bodygraph-canvas/);
  assert.match(canvas, /className={`upastro-activation-row/);
  assert.doesNotMatch(canvas, /<button/);
  assert.match(
    read("src/styles/hd-routes.css"),
    /\.upastro-bodygraph-canvas \{[\s\S]*pointer-events: none;/,
  );
  assert.match(result, /data-properties-open>Properties/);
  assert.doesNotMatch(result, /data-layer-toggle=/);
  assert.match(result, /<ChartPropertiesDrawer activeGates=/);
  const propertiesDrawer = read(
    "src/components/bodygraph/ChartPropertiesDrawer.astro",
  );
  assert.match(propertiesDrawer, /data-property-tab="centres"/);
  assert.match(propertiesDrawer, /data-property-tab="gates"/);
  assert.match(propertiesDrawer, /data-property-tab="channels"/);
  assert.doesNotMatch(
    propertiesDrawer,
    /data-property-tab="summary"|data-property-tab="activations"/,
  );
  assert.match(propertiesDrawer, /data-property-card/);
  assert.match(propertiesDrawer, /data-property-back/);
  assert.match(propertiesDrawer, /data-property-previous/);
  assert.match(propertiesDrawer, /data-property-next/);
  assert.match(
    propertiesDrawer,
    /data-property-locked={String\(detailContent\(/,
  );
  assert.match(
    propertiesDrawer,
    /!unlocked && <div data-property-unlock hidden><UnlockReadingCard upgradeHref={upgradeHref}/,
  );
  assert.match(
    propertiesDrawer,
    /if \(unlock\) unlock\.hidden = card\.dataset\.propertyLocked !== "true"/,
  );
  assert.match(
    propertiesDrawer,
    /copy: \(unlocked \? complete : complete\.slice\(0, 1\)\)\.join\("\\n\\n"\)/,
  );
  assert.match(
    result,
    /<BodyGraphGuidePanel properties={foundationalProperties} chart={chartView} unlocked={hasFullReadingAccess} upgradeHref=/,
  );
  assert.doesNotMatch(result, /<section class="hd-reading-section"/);
  const guide = read("src/components/bodygraph/BodyGraphGuidePanel.astro");
  assert.match(guide, /data-guide-tab="chart"/);
  assert.match(guide, /data-guide-tab="beginner"/);
  assert.match(guide, /data-guide-tab="energy"/);
  assert.match(guide, /The 9 Centres/);
  assert.match(guide, /Planet Symbols/);
  assert.match(guide, /Wait to Respond/);
  assert.match(guide, /const authority = chart\?\.authority/);
  assert.match(guide, /data-energy-open={item\.id}/);
  assert.match(guide, /aria-hidden="true">→<\/i>/);
  assert.match(guide, /manifesting-generator/);
  assert.match(guide, /energyImageKey\[energyType\.toLowerCase\(\)\]/);
  assert.match(
    guide,
    /hasLockedContent: !unlocked && providerSections\.length > visibleSections\.length/,
  );
  assert.match(
    guide,
    /item\.hasLockedContent && <UnlockReadingCard upgradeHref={upgradeHref}/,
  );
  const unlockCard = read("src/components/bodygraph/UnlockReadingCard.astro");
  assert.match(unlockCard, /Unlock the Full Detailed Reading/);
  assert.match(unlockCard, /Upgrade Now/);
  assert.match(unlockCard, /hd-unlock-card__icon/);
  assert.match(guide, /data-energy-back/);
  assert.match(
    read("src/styles/hd-routes.css"),
    /\.hd-explorer-workspace \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    read("src/styles/hd-routes.css"),
    /\.hd-properties-drawer \{[\s\S]*width: 50vw/,
  );
  assert.match(
    read("src/styles/hd-routes.css"),
    /\.hd-energy-visual \{[\s\S]*aspect-ratio: 1 \/ 1/,
  );
  assert.doesNotMatch(
    read("src/styles/hd-routes.css"),
    /\.hd-guide-panel__viewport \{[^}]*overscroll-behavior:\s*contain/,
  );
});

test("successful Stripe payment returns to and unlocks the linked saved chart", () => {
  const checkout = read("src/pages/api/checkout/full-reading.ts");
  const access = read("src/pages/api/checkout/reading-access.ts");
  const result = read("src/pages/human-design/[slug].astro");
  const orders = read(
    "src/server/capabilities/vendor/astropages-capabilities/human-design-orders.ts",
  );
  assert.match(checkout, /successPath = order\.readingId/);
  assert.match(
    checkout,
    /\/human-design\/\$\{encodeURIComponent\(order\.readingId\)\}/,
  );
  assert.match(orders, /hasPaidHumanDesignReadingAccess/);
  assert.match(orders, /payment_status = 'paid'/);
  assert.match(access, /getPaidHumanDesignReadingAccess/);
  assert.match(
    access,
    /chartUrl: access \? `\/human-design\/\$\{encodeURIComponent\(readingId\)\}#bodygraph`/,
  );
  assert.match(result, /hasFullReadingAccess/);
  assert.match(result, /unlocked=\{hasFullReadingAccess\}/);
  assert.match(result, /session-status\?session_id=/);
  assert.match(
    result,
    /window\.location\.replace\(`\/human-design\/\$\{encodeURIComponent\(slug\)\}#bodygraph`\)/,
  );
});

test("homepage plate uses the static non-interactive production bodygraph canvas", () => {
  const section = read("src/components/home/sections/NineCentresSection.astro");
  assert.match(section, /<UpastroBodyGraphCanvas theme="light"/);
  assert.match(section, /chartData={staticChartData}/);
  assert.match(section, /interactive={false}/);
  assert.match(section, /showActivationColumns={false}/);
  assert.doesNotMatch(section, /<BodyGraphCanvas/);
});

test("provider contract is restricted to approved AstrologyAPI Human Design endpoints", () => {
  const provider = read(
    "src/server/capabilities/vendor/astropages-capabilities/human-design-api.ts",
  );
  for (const endpoint of [
    "/v1/human-design",
    "/v1/human-design/chart-interpretation",
    "/v1/human-design/traits-interpretation",
  ])
    assert.equal(
      provider.includes(endpoint),
      true,
      `${endpoint} must be declared`,
    );
  assert.doesNotMatch(
    provider,
    /human-design\/compatibility|human-design\/transit-range/,
  );
  assert.match(provider, /ASTROLOGY_API_BASE_URL/);
  assert.match(provider, /X_ASTROLOGYAPI_KEY/);
  assert.match(provider, /"x-astrologyapi-key": apiKey/);
  assert.match(
    provider,
    /endpoint: humanDesignEndpoints\.chart,\s+payload: buildHumanDesignInterpretationPayload\(input\)/,
  );
  assert.doesNotMatch(
    provider,
    /ASTROLOGYAPI_USER_ID|ASTROLOGYAPI_PASSWORD|Basic \$\{btoa/,
  );
});

test("Human Design requests use the canonical runtime URL and Worker secret", async () => {
  const {
    buildHumanDesignInterpretationPayload,
    humanDesignEndpoints,
    postHumanDesignProvider,
  } =
    await import("../src/server/capabilities/vendor/astropages-capabilities/human-design-api.ts");
  let captured;
  await postHumanDesignProvider({
    env: {
      ASTROLOGY_API_BASE_URL: "https://astrology.test/v1",
      X_ASTROLOGYAPI_KEY: "test-key",
    },
    endpoint: humanDesignEndpoints.chart,
    payload: { birth_details: {} },
    fetcher: async (url, init) => {
      captured = { url, init };
      return Response.json({ status: true });
    },
  });
  assert.equal(captured.url, "https://astrology.test/v1/human-design");
  assert.equal(captured.init.headers["x-astrologyapi-key"], "test-key");
  assert.equal(captured.init.headers.authorization, undefined);
  assert.deepEqual(
    buildHumanDesignInterpretationPayload({
      name: "Asha",
      day: 1,
      month: 9,
      year: 1990,
      hour: 12,
      minute: 30,
      latitude: 28.6139,
      longitude: 77.209,
      timezone_offset: 5.5,
    }),
    {
      name: "Asha",
      day: 1,
      month: 9,
      year: 1990,
      hour: 12,
      min: 30,
      lat: 28.6139,
      lon: 77.209,
      tzone: 5.5,
    },
  );
});

test("all 64 bodygraph gates terminate at the correct channel anchors", async () => {
  const {
    DEFAULT_CHANNELS,
    build,
    buildChannelGatePositions,
    buildGatePositions,
  } = await import("../src/data/bodygraph-geometry.ts");
  const canvas = read("src/components/bodygraph/BodyGraphCanvas.astro");
  const requiredPairs = [
    [32, 54],
    [28, 38],
    [18, 58],
    [49, 19],
    [55, 39],
    [30, 41],
  ];
  const pairKey = ([first, second]) =>
    [first, second].sort((a, b) => a - b).join("-");
  const channelKeys = new Set(DEFAULT_CHANNELS.map(pairKey));

  assert.equal(
    new Set(DEFAULT_CHANNELS.flat()).size,
    64,
    "every gate must belong to exactly one channel",
  );
  for (const pair of requiredPairs)
    assert.equal(
      channelKeys.has(pairKey(pair)),
      true,
      `${pair.join("–")} must be connected`,
    );

  const labels = buildGatePositions();
  const anchors = buildChannelGatePositions();
  assert.notDeepEqual(
    anchors[32],
    labels[32],
    "channel endpoints must reach centre edges instead of stopping under labels",
  );
  assert.deepEqual(
    [54, 38, 58].map((gate) => anchors[gate].x),
    [228, 228, 228],
  );
  assert.deepEqual(
    [19, 39, 41].map((gate) => anchors[gate].x),
    [332, 332, 332],
  );
  const renderedGraph = build();
  assert.equal(
    renderedGraph.channels.every((channel) => channel.d.length > 0),
    true,
  );
  const attachments = renderedGraph.channels.flatMap(
    (channel) => channel.attachments,
  );
  assert.equal(
    attachments.length,
    64,
    "every gate must have one visible terminal attachment",
  );
  assert.equal(
    attachments.every((attachment) => attachment.d.length > 0),
    true,
  );
  assert.match(canvas, /data-channel-pair/);
  assert.match(canvas, /data-channel-attachment/);
});

test("Human Design readings keep durable storage and catalog-managed secrets out of the custom manifest", () => {
  const migration = read("migrations/0008_human_design_readings.sql");
  const secrets = JSON.parse(read("astropages/secrets.manifest.json"));
  assert.match(
    migration,
    /CREATE TABLE IF NOT EXISTS ap_human_design_readings/,
  );
  const secretKeys = secrets.integrations.flatMap((integration) =>
    integration.secrets.map((secret) => secret.key),
  );
  for (const key of [
    "X_ASTROLOGYAPI_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ]) {
    assert.ok(
      !secretKeys.includes(key),
      `${key} is managed by the integration catalog`,
    );
    assert.ok(
      read("scripts/validate-secrets-contract.mjs").includes(`"${key}"`),
      `${key} remains a supported built-in secret`,
    );
  }
});

test("proprietary masterclass implementation is not mounted or imported", () => {
  const index = read("src/pages/index.astro");
  assert.doesNotMatch(
    index,
    /MasterclassCourseView|masterclass-view-container/,
  );
});

test("home exposes major visible section copy through Content Studio fields", () => {
  const defaults = read("src/data/public-copy.ts");
  const index = read("src/pages/index.astro");
  for (const field of [
    "generator_title",
    "nine_centres_title",
    "concepts_title",
    "types_title",
    "readings_title",
    "how_title",
    "faq_title",
    "articles_title",
    "final_cta_title",
  ]) {
    assert.equal(
      defaults.includes(`${field}:`),
      true,
      `${field} default must exist`,
    );
    assert.equal(
      index.includes(`builderEdit(\"${field}\")`),
      true,
      `${field} must be editable`,
    );
  }
});
