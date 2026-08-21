import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { historicalTimezoneOffset, normalizeHumanDesignInput } from "../../src/server/capabilities/vendor/astropages-capabilities/human-design-input.ts";
import { normalizeHumanDesignView } from "../../src/server/capabilities/vendor/astropages-capabilities/human-design-view.ts";
import { hasPaidHumanDesignReadingAccess } from "../../src/server/capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import { verifyStripeSignature } from "../../src/pages/api/checkout/stripe-webhook.ts";

test("birth details resolve to provider coordinates and historical timezone offset", async () => {
  const result = await normalizeHumanDesignInput({
    value: { name: "Ada", email: "ada@example.com", birthDate: "1990-07-01", birthTime: "10:30", birthCity: "London, UK" },
    fetcher: async () => Response.json({ results: [{ name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" }] }),
  });
  assert.equal(result.provider.day, 1);
  assert.equal(result.provider.minute, 30);
  assert.equal(result.provider.timezone_offset, 1);
  assert.equal(result.privateInput.birthPlace, "London, United Kingdom");
  assert.equal(historicalTimezoneOffset({ timezone: "Europe/London", year: 1990, month: 1, day: 1, hour: 10, minute: 30 }), 0);
});

test("provider chart response maps into the canvas and property view", () => {
  const view = normalizeHumanDesignView({ chart: {
    type: "Projector", strategy: "Wait for the invitation", authority: "Splenic", profile: "2/4", definition: "Split Definition",
    planetary_activations: { design: [{ planet_id: 1, hd_position: "10.2" }], personality: [{ planet_id: 1, hd_position: "20.4" }] },
    centers: [{ id: "spleen", state: "defined" }, { id: "sacral", state: "open" }],
    channels: [{ id: "10-20", name: "Awakening", description: "Present expression." }],
  } });
  assert.equal(view.type, "Projector");
  assert.deepEqual(view.activeGates, [10, 20]);
  assert.deepEqual(view.definedCenters, ["spleen"]);
  assert.equal(view.channels[0].id, "10-20");
  assert.equal(view.chartData.planetary_activations.personality[0].hd_position, "20.4");
});

test("object-valued AstrologyAPI fields and interpretation copy map into the saved chart view", () => {
  const view = normalizeHumanDesignView({
    chart: {
      natal: {
        type: { code: "MANIFESTING_GENERATOR", label: "Manifesting Generator" },
        strategy: { code: "RESPOND_THEN_INFORM", label: "Respond then Inform" },
        authority: { code: "EMOTIONAL", label: "Emotional" },
        profile: { code: "6/3", design_line: 3, personality_line: 6 },
        definition: { code: "SINGLE", label: "Single Definition" },
        signature: { code: "SATISFACTION", label: "Satisfaction" },
        not_self_theme: { code: "FRUSTRATION", label: "Frustration" },
        incarnation_cross: { code: "CROSS_7_13_23_43", label: "Left Angle Cross of Cross (7/13 | 23/43)" },
      },
      planetary_activations: { design: [{ planet_id: 1, hd_position: "23.3" }], personality: [{ planet_id: 1, hd_position: "7.6" }] },
      centers: [{ id: "ajna", natal: "defined" }, { id: "head", natal: "open" }],
      channels: [{ id: "43-23", natal: "active" }],
      gates: [{ id: 13, design: "active", natal: "active" }],
    },
    about: { interpretation: { profile: { key: "6_3", sections: [{ title: "What your profile is and what it means", content: "Provider profile copy.", paragraphs: ["Provider profile copy."] }] } } },
    interpretation: { interpretation: {
      centers: { defined: [{ id: "ajna", label: "Ajna", status: "defined", content: "Provider centre copy." }], undefined: [{ id: "head", label: "Head", status: "open", content: "Provider open-centre copy." }] },
      channels: { defined: [{ id: "23-43", label: "Channel 23-43: Channel of Structuring", content: "Provider channel copy." }] },
      gates: { active: [{ id: 13, label: "Gate 13: Fellowship with Men - Gate of the Listener", status: "active", content: "Provider gate copy." }] },
      planets: [{ planet: "Sun", meaning: "Core energy", content: "Provider planet copy." }],
    } },
  });

  assert.equal(view.type, "Manifesting Generator");
  assert.equal(view.strategy, "Respond Then Inform");
  assert.equal(view.authority, "Emotional");
  assert.equal(view.profile, "6/3");
  assert.equal(view.definition, "Single Definition");
  assert.equal(view.signature, "Satisfaction");
  assert.equal(view.notSelf, "Frustration");
  assert.equal(view.cross, "Left Angle Cross of Cross (7/13 | 23/43)");
  assert.deepEqual(view.activeGates, [7, 13, 23]);
  assert.equal(view.aboutDetails.profile.sections[0].content, "Provider profile copy.");
  assert.equal(view.centerDetails[0].description, "Provider centre copy.");
  assert.equal(view.gateDetails[0].description, "Provider gate copy.");
  assert.equal(view.channels[0].label, "Channel of Structuring");
  assert.equal(view.channels[0].description, "Provider channel copy.");
  assert.equal(view.planetDetails[0].description, "Provider planet copy.");
});

test("paid reading access is granted only by a paid order linked to the exact chart", async () => {
  let boundReadingId = "";
  const env = {
    DB: {
      prepare(sql) {
        assert.match(sql, /reading_id = \? AND payment_status = 'paid'/);
        return {
          bind(readingId) {
            boundReadingId = readingId;
            return { first: async () => ({ id: "hd_order_paid" }) };
          },
        };
      },
    },
  };
  assert.equal(await hasPaidHumanDesignReadingAccess({ env, readingId: "hd_chart_abc123" }), true);
  assert.equal(boundReadingId, "hd_chart_abc123");
  assert.equal(await hasPaidHumanDesignReadingAccess({ env, readingId: "fixture" }), false);
});

test("Stripe webhook signatures are verified against the exact raw body", async () => {
  const body = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
  const secret = "whsec_test_only";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  assert.equal(await verifyStripeSignature(body, `t=${timestamp},v1=${signature}`, secret), true);
  assert.equal(await verifyStripeSignature(`${body} `, `t=${timestamp},v1=${signature}`, secret), false);
});
