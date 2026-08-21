import type { APIRoute } from "astro";
import {
  getGooglePlacesApiKey,
  mapGooglePlacePrediction,
  normalizePlacesInput,
  normalizePlacesLanguage,
  normalizeSessionToken,
  placesFeature,
} from "../../../../../server/aggregator/places/google-places.ts";
import { getRuntimeEnv } from "../../../../../server/generated-site/request.ts";
import { errorResponse, jsonResponse } from "../../../../../server/generated-site/responses.ts";

export const prerender = false;

const openMeteoPredictions = async (input: string, language: string) => {
  const params = new URLSearchParams({
    name: input,
    count: "7",
    language: /^[a-z]{2}$/i.test(language) ? language.toLowerCase() : "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Fallback place search failed.");
  const payload = await response.json() as { results?: Array<Record<string, unknown>> };
  return [...(payload.results ?? [])]
    .sort((first, second) => Number(second.population ?? 0) - Number(first.population ?? 0))
    .flatMap((entry) => {
    const lat = Number(entry.latitude);
    const lon = Number(entry.longitude);
    const timezone = String(entry.timezone ?? "").trim();
    const mainText = String(entry.name ?? "").trim();
    const secondaryParts = [entry.admin1, entry.country]
      .map((value) => String(value ?? "").trim())
      .filter((value, index, items) => value && items.indexOf(value) === index);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !timezone || !mainText) return [];
    const description = [mainText, ...secondaryParts].join(", ");
    return [{
      placeId: `om|${lat}|${lon}|${timezone}|${description}`,
      description,
      mainText,
      secondaryText: secondaryParts.join(", "),
    }];
    });
};

const readyResponse = (predictions: Array<Record<string, unknown>>) => jsonResponse({
  status: "ready",
  state: "ready",
  feature: placesFeature,
  message: "Place suggestions loaded.",
  data: { predictions },
});

export const GET: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  const url = new URL(context.request.url);
  const input = normalizePlacesInput(url.searchParams.get("input"));
  const sessionToken = normalizeSessionToken(url.searchParams.get("sessionToken"));
  const language = normalizePlacesLanguage(url.searchParams.get("language"));
  if (input.length < 2) return errorResponse(placesFeature, "Enter at least 2 characters to search places.", 400);

  const apiKey = await getGooglePlacesApiKey(env);
  if (!apiKey) {
    try {
      return readyResponse(await openMeteoPredictions(input, language));
    } catch {
      return errorResponse(placesFeature, "Place suggestions are temporarily unavailable.", 502);
    }
  }

  const params = new URLSearchParams({ input, key: apiKey, language, types: "(cities)" });
  if (sessionToken) params.set("sessiontoken", sessionToken);
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
    const payload = await response.json() as { status?: string; predictions?: Array<Record<string, unknown>> };
    if (response.ok && (!payload.status || payload.status === "OK" || payload.status === "ZERO_RESULTS")) {
      const predictions = (payload.predictions ?? []).map(mapGooglePlacePrediction)
        .filter((prediction) => prediction.placeId && prediction.description);
      return readyResponse(predictions);
    }
  } catch {
    return errorResponse(placesFeature, "Place suggestions are temporarily unavailable.", 502);
  }
  return errorResponse(placesFeature, "Place suggestions are temporarily unavailable.", 502);
};
