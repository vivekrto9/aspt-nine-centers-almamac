import type { APIRoute } from "astro";
import {
  getGooglePlacesApiKey,
  mapGooglePlaceDetails,
  normalizePlacesInput,
  normalizeSessionToken,
  placesCapabilityKey,
  placesFeature,
  placesMissingSecretNames,
} from "../../../../../server/aggregator/places/google-places.ts";
import { getRuntimeEnv } from "../../../../../server/generated-site/request.ts";
import { blockedProviderResponse, errorResponse, jsonResponse } from "../../../../../server/generated-site/responses.ts";

export const prerender = false;

const parseOpenMeteoPlace = (placeId: string, date: string | null, time: string | null) => {
  if (!placeId.startsWith("om|")) return null;
  const [, latText, lonText, timezone, ...addressParts] = placeId.split("|");
  const lat = Number(latText);
  const lon = Number(lonText);
  const formattedAddress = addressParts.join("|").trim();
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !timezone || !formattedAddress) return null;
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(date ? new Date(`${date}T${time || "00:00"}:00Z`) : new Date())
    .find((part) => part.type === "timeZoneName")?.value
    ?.replace("GMT", "UTC") || "";
  return { placeId, formattedAddress, lat, lon, timezone, offset };
};

export const GET: APIRoute = async (context) => {
  const env = await getRuntimeEnv(context);
  const url = new URL(context.request.url);
  const placeId = normalizePlacesInput(url.searchParams.get("placeId"));
  const sessionToken = normalizeSessionToken(url.searchParams.get("sessionToken"));
  const date = url.searchParams.get("date");
  const time = url.searchParams.get("time");
  if (!placeId) return errorResponse(placesFeature, "Place id is required.", 400);

  const openMeteoPlace = parseOpenMeteoPlace(placeId, date, time);
  if (openMeteoPlace) {
    return jsonResponse({
      status: "ready",
      state: "ready",
      feature: placesFeature,
      message: "Place details loaded.",
      data: { place: openMeteoPlace },
    });
  }

  const apiKey = await getGooglePlacesApiKey(env);
  if (!apiKey) return blockedProviderResponse({
    feature: placesFeature,
    capabilityKey: placesCapabilityKey,
    missingSecretNames: placesMissingSecretNames,
    message: "Place search is temporarily unavailable. Please try again later.",
  });
  const params = new URLSearchParams({ place_id: placeId, fields: "place_id,formatted_address,geometry", key: apiKey });
  if (sessionToken) params.set("sessiontoken", sessionToken);
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const payload = await response.json() as { status?: string; result?: Record<string, unknown> };
    if (!response.ok || payload.status !== "OK" || !payload.result) {
      return errorResponse(placesFeature, "Place details are temporarily unavailable.", 502);
    }
    return jsonResponse({
      status: "ready", state: "ready", feature: placesFeature, message: "Place details loaded.",
      data: { place: mapGooglePlaceDetails({ result: payload.result, date, time }) },
    });
  } catch {
    return errorResponse(placesFeature, "Place details are temporarily unavailable.", 502);
  }
};
