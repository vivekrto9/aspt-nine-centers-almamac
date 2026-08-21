import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("Google place predictions and details are normalized for the chart form", async () => {
  const { mapGooglePlaceDetails, mapGooglePlacePrediction } = await import(
    "../../src/server/aggregator/places/google-places.ts"
  );
  assert.deepEqual(mapGooglePlacePrediction({
    place_id: "mumbai-id",
    description: "Mumbai, Maharashtra, India",
    structured_formatting: { main_text: "Mumbai", secondary_text: "Maharashtra, India" },
  }), {
    placeId: "mumbai-id",
    description: "Mumbai, Maharashtra, India",
    mainText: "Mumbai",
    secondaryText: "Maharashtra, India",
  });
  const details = mapGooglePlaceDetails({
    result: {
      place_id: "mumbai-id",
      formatted_address: "Mumbai, Maharashtra, India",
      geometry: { location: { lat: 18.9582347, lng: 72.8319514 } },
    },
    date: "1994-03-14",
    time: "06:42",
  });
  assert.equal(details.timezone, "Asia/Kolkata");
  assert.equal(details.offset, "UTC+05:30");
});

test("generated-site place routes proxy autocomplete, details, and timezone lookup", () => {
  const autocomplete = read("src/pages/api/astropages/generated-site/places/autocomplete.ts");
  const details = read("src/pages/api/astropages/generated-site/places/details.ts");
  const timezone = read("src/pages/api/astropages/generated-site/places/timezone.ts");
  assert.match(autocomplete, /maps\.googleapis\.com\/maps\/api\/place\/autocomplete/);
  assert.match(autocomplete, /geocoding-api\.open-meteo\.com\/v1\/search/);
  assert.match(autocomplete, /if \(!apiKey\)/);
  assert.match(autocomplete, /types: "\(cities\)"/);
  assert.match(details, /maps\.googleapis\.com\/maps\/api\/place\/details/);
  assert.match(details, /mapGooglePlaceDetails/);
  assert.match(details, /parseOpenMeteoPlace/);
  assert.match(timezone, /mapCoordinatesToTimezone/);
});
