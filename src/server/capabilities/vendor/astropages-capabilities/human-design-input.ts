import { safeString } from "../../../aggregator/runtime.ts";

type JsonRecord = Record<string, unknown>;

type GeocodingResult = {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

const asRecord = (value: unknown): JsonRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;

const finiteNumber = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const datePartsInZone = (instant: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
};

export const historicalTimezoneOffset = ({
  timezone,
  year,
  month,
  day,
  hour,
  minute,
}: {
  timezone: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}) => {
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instant = new Date(wallClockUtc);
  for (let index = 0; index < 3; index += 1) {
    const zoned = datePartsInZone(instant, timezone);
    const represented = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
    instant = new Date(instant.getTime() + wallClockUtc - represented);
  }
  const zoned = datePartsInZone(instant, timezone);
  const represented = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return Math.round(((represented - instant.getTime()) / 3_600_000) * 4) / 4;
};

export const geocodeBirthPlace = async ({
  query,
  locale = "en",
  fetcher = fetch,
}: {
  query: string;
  locale?: string;
  fetcher?: typeof fetch;
}): Promise<GeocodingResult> => {
  const place = query.trim();
  if (place.length < 2 || place.length > 180) throw new Error("Enter a valid birth city.");
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", place);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", /^[a-z]{2}$/i.test(locale) ? locale.toLowerCase() : "en");
  url.searchParams.set("format", "json");
  const response = await fetcher(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error("Birth-place lookup is temporarily unavailable.");
  const body = asRecord(await response.json().catch(() => ({})));
  const results = Array.isArray(body?.results) ? body.results : [];
  const match = results.map(asRecord).find((entry) => {
    const latitude = finiteNumber(entry?.latitude);
    const longitude = finiteNumber(entry?.longitude);
    return entry && latitude !== null && longitude !== null && safeString(entry.timezone);
  });
  if (!match) throw new Error("We could not find that birth city. Add the country and try again.");
  return {
    name: safeString(match.name),
    admin1: safeString(match.admin1),
    country: safeString(match.country),
    latitude: finiteNumber(match.latitude)!,
    longitude: finiteNumber(match.longitude)!,
    timezone: safeString(match.timezone),
  };
};

export const normalizeHumanDesignInput = async ({
  value,
  locale = "en",
  fetcher = fetch,
}: {
  value: unknown;
  locale?: string;
  fetcher?: typeof fetch;
}) => {
  const input = asRecord(value);
  if (!input) throw new Error("Human Design request body is invalid.");
  const name = (safeString(input.name) || safeString(input.displayName) || "My chart").slice(0, 80);
  const email = safeString(input.email).toLowerCase().slice(0, 254);
  const birthDate = safeString(input.birthDate) || safeString(input.birth_date);
  const birthTime = safeString(input.birthTime) || safeString(input.birth_time) || "12:00";
  const birthPlace = (safeString(input.birthPlace) || safeString(input.birthCity) || safeString(input.birth_city)).slice(0, 180);
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(birthTime);
  if (!emailPattern.test(email)) throw new Error("Enter a valid email address.");
  if (!dateMatch || !timeMatch || !birthPlace) throw new Error("Birth date, time, and city are required.");
  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1900 || year > new Date().getUTCFullYear() || month < 1 || month > 12 || day < 1 ||
    date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day ||
    hour < 0 || hour > 23 || minute < 0 || minute > 59
  ) throw new Error("Enter a valid birth date and time.");

  const providedLatitude = finiteNumber(input.latitude ?? input.lat);
  const providedLongitude = finiteNumber(input.longitude ?? input.lon);
  const providedTimezone = safeString(input.timezoneName);
  const location = providedLatitude !== null && providedLongitude !== null && providedTimezone
    ? { name: birthPlace, latitude: providedLatitude, longitude: providedLongitude, timezone: providedTimezone }
    : await geocodeBirthPlace({ query: birthPlace, locale, fetcher });
  if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) {
    throw new Error("Birth-place coordinates are invalid.");
  }
  const timezoneOffset = historicalTimezoneOffset({ timezone: location.timezone, year, month, day, hour, minute });
  const resolvedPlace = [location.name, "admin1" in location ? location.admin1 : "", "country" in location ? location.country : ""]
    .filter(Boolean).filter((item, index, items) => items.indexOf(item) === index).join(", ");

  return {
    provider: {
      name,
      day,
      month,
      year,
      hour,
      minute,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone_offset: timezoneOffset,
      design_calc_mode: "precise",
    },
    privateInput: {
      name,
      email,
      birthDate,
      birthTime,
      birthPlace: resolvedPlace || birthPlace,
      latitude: location.latitude,
      longitude: location.longitude,
      timezoneName: location.timezone,
      timezoneOffset,
    },
  };
};
