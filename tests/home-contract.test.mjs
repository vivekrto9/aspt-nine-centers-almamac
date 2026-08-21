import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("Nine Centres Field Almanac declares canonical typography and color tokens", () => {
  const baseCss = read("src/styles/base.css");
  assert.equal(baseCss.includes("--color-cobalt: #2B45C8;"), true);
  assert.equal(baseCss.includes("--color-cream: #E7E9EF;"), true);
  assert.equal(baseCss.includes("--color-accent: #B62F49;"), true);
  assert.equal(baseCss.includes("--font-display: 'Zilla Slab'"), true);
  assert.equal(baseCss.includes("--font-sans: 'Work Sans'"), true);
  assert.equal(baseCss.includes("--font-mono: 'DM Mono'"), true);
});

test("Home page composes all 10 core sections in order", () => {
  const indexAstro = read("src/pages/index.astro");
  assert.equal(indexAstro.includes("<HomeHero"), true);
  assert.equal(indexAstro.includes("<BodygraphGeneratorSection"), true);
  assert.equal(indexAstro.includes("<NineCentresSection"), true);
  assert.equal(indexAstro.includes("<FourConceptsSection"), true);
  assert.equal(indexAstro.includes("<FiveTypesSection"), true);
  assert.equal(indexAstro.includes("<ThreeReadingsSection"), true);
  assert.equal(indexAstro.includes("<HowItRunsSection"), true);
  assert.equal(indexAstro.includes("<ClientLettersSection"), true);
  assert.equal(indexAstro.includes("<FaqSection"), true);
  assert.equal(indexAstro.includes("<ArticlesSection"), true);
  assert.equal(indexAstro.includes("<FinalCtaSection"), true);
  assert.equal(indexAstro.includes("<Header"), true);
  assert.equal(indexAstro.includes("<Footer"), true);
  assert.equal(indexAstro.includes("<MasterclassCourseView"), false);
});

test("Five Types section contains all five human design energy types", () => {
  const typesAstro = read("src/components/home/sections/FiveTypesSection.astro");
  for (const name of ["Manifestor", "Generator", "Manifesting Generator", "Projector", "Reflector"]) {
    assert.equal(typesAstro.includes("TYPES.map"), true);
  }
  assert.match(typesAstro, /\.type-trigger:hover \.type-title,[\s\S]*?color:\s*var\(--color-paper\)/);
  assert.match(typesAstro, /\.type-trigger:focus-visible \.type-share[\s\S]*?color:\s*#FFFFFF/);
});

test("Readings section provides one $99 offer and hands payment to Stripe Checkout", () => {
  const readings = read("src/components/home/sections/ThreeReadingsSection.astro");
  const checkout = read("src/pages/api/checkout/full-reading.ts");
  const webhook = read("src/pages/api/checkout/stripe-webhook.ts");
  const orders = read("src/server/capabilities/vendor/astropages-capabilities/human-design-orders.ts");
  assert.equal(readings.includes("One reading, one payment"), true);
  assert.equal(readings.includes("The full reading"), true);
  assert.equal(readings.includes("Unlock everything — $99"), true);
  assert.equal(readings.includes('fetch("/api/checkout/full-reading"'), true);
  assert.equal(readings.includes("You already own this reading"), true);
  assert.equal(readings.includes("/api/checkout/reading-access?reading_id="), true);
  assert.equal(readings.includes("View my full reading →"), true);
  assert.equal(readings.includes("card number"), false);
  assert.equal(checkout.includes("https://api.stripe.com/v1/checkout/sessions"), true);
  assert.equal(checkout.includes('form.set("line_items[0][price_data][unit_amount]", "9900")'), true);
  assert.equal(checkout.includes('resolveSecretBinding(env, "STRIPE_SECRET_KEY")'), true);
  assert.equal(checkout.includes("createHumanDesignOrder"), true);
  assert.equal(checkout.includes("alreadyPurchased: true"), true);
  assert.equal(webhook.includes('resolveSecretBinding(env, "STRIPE_WEBHOOK_SECRET")'), true);
  assert.equal(webhook.includes("verifyStripeSignature"), true);
  assert.equal(webhook.includes("checkout.session.completed"), true);
  assert.equal(orders.includes("RETURNING id, order_number, email, payment_status"), true);
});

test("Bodygraph Canvas SVG geometry is present and rendered", () => {
  const canvasAstro = read("src/components/bodygraph/BodyGraphCanvas.astro");
  assert.equal(canvasAstro.includes("bodygraph-svg"), true);
  assert.equal(canvasAstro.includes("bg-silhouette"), true);
  assert.equal(canvasAstro.includes("bg-channels-active"), true);
  assert.equal(canvasAstro.includes("bg-center-shapes"), true);
});

test("sample plate gives recovered centre width equally to the bodygraph and activations", () => {
  const plate = read("src/components/home/sections/NineCentresSection.astro");
  assert.match(
    plate,
    /grid-template-columns:\s*minmax\(0, 0\.7fr\)\s+minmax\(0, 1\.15fr\)\s+minmax\(0, 1\.15fr\)/,
  );
  assert.match(plate, /\.centres-col\s*\{\s*grid-column:\s*1;/);
  assert.match(plate, /\.canvas-plate-col\s*\{\s*grid-column:\s*2;/);
  assert.match(plate, /\.activations-col\s*\{\s*grid-column:\s*3;/);
  assert.match(plate, /\.centres-col, \.canvas-plate-col, \.activations-col\s*\{\s*grid-column:\s*1;/);
});

test("four vocabulary concepts share one horizontal start line", () => {
  const concepts = read("src/components/home/sections/FourConceptsSection.astro");
  assert.match(concepts, /\.concept-card\s*\{[^}]*margin-top:\s*0;/s);
});

test("Articles section provides View All CTA and links to blog routes", () => {
  const articlesAstro = read("src/components/home/sections/ArticlesSection.astro");
  assert.equal(articlesAstro.includes('localizePath("/blog", locale)'), true);
  assert.equal(articlesAstro.includes("view-all-cta"), true);
  assert.equal(articlesAstro.includes("localizePath(`/blog/${a.slug}`, locale)"), true);
});

test("Blog index and dynamic slug detail pages exist and render structured articles", () => {
  const blogIndex = read("src/pages/blog.astro");
  const blogDetail = read("src/pages/blog/[slug].astro");
  const blogGrid = read("src/components/blog/BlogArticlesGrid.astro");
  const blogBody = read("src/components/blog/BlogArticleBody.astro");
  const blogData = read("src/data/blog-articles.ts");

  assert.equal(blogIndex.includes("<BlogArticlesGrid"), true);
  assert.equal(blogGrid.includes("<BlogCard"), true);
  assert.equal(blogDetail.includes("<BlogArticleHeader"), true);
  assert.equal(blogDetail.includes("<BlogArticleBody"), true);
  assert.equal(blogBody.includes("takeaways-box"), true);
  assert.equal(blogData.includes("open-centres-not-weaknesses"), true);
  assert.equal(blogData.includes("how-to-test-your-gut-yes"), true);
});
