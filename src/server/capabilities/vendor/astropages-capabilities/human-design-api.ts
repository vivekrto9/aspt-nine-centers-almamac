import { resolveSecretBinding } from "../../../aggregator/runtime-bindings.ts";
import { getRuntimeConfigValue } from "../../../aggregator/runtime-config.ts";
import { linkBusinessLead } from "../../../aggregator/lead-records.ts";
import {
  createId,
  nowIso,
  safeString,
  type RuntimeEnv,
} from "../../../aggregator/runtime.ts";
import { normalizeHumanDesignInput } from "./human-design-input.ts";

export const humanDesignFeature = "nine-centres.human-design";

export const humanDesignEndpoints = {
  chart: "/v1/human-design",
  chartInterpretation: "/v1/human-design/chart-interpretation",
  aboutInterpretation: "/v1/human-design/traits-interpretation",
} as const;

type JsonRecord = Record<string, unknown>;
type ReadingKind = "chart";
type ProviderFetch = typeof fetch;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const providerMessage = (fallback: string, body: JsonRecord) =>
  safeString(body.message) || safeString(body.error) || fallback;

const resolveProviderConfig = async (env: RuntimeEnv) => {
  const [configuredBaseUrl, apiKey] = await Promise.all([
    getRuntimeConfigValue(env, "ASTROLOGY_API_BASE_URL"),
    resolveSecretBinding(env, "X_ASTROLOGYAPI_KEY"),
  ]);
  const baseUrl = safeString(configuredBaseUrl).replace(/\/+$/, "");
  if (!baseUrl) throw new Error("ASTROLOGY_API_BASE_URL is not configured.");
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("ASTROLOGY_API_BASE_URL is invalid.");
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("ASTROLOGY_API_BASE_URL must use HTTPS.");
  }
  if (!apiKey) throw new Error("AstrologyAPI token is not configured.");
  return { baseUrl, apiKey };
};

const joinProviderUrl = (baseUrl: string, endpoint: string) =>
  baseUrl.endsWith("/v1") && endpoint.startsWith("/v1/")
    ? `${baseUrl}${endpoint.slice(3)}`
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

export const postHumanDesignProvider = async ({
  env,
  endpoint,
  payload,
  locale = "en",
  fetcher = fetch,
}: {
  env: RuntimeEnv;
  endpoint: (typeof humanDesignEndpoints)[keyof typeof humanDesignEndpoints];
  payload: JsonRecord;
  locale?: string;
  fetcher?: ProviderFetch;
}) => {
  const { baseUrl, apiKey } = await resolveProviderConfig(env);
  const response = await fetcher(joinProviderUrl(baseUrl, endpoint), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept-language": /^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)
        ? locale
        : "en",
      "x-astrologyapi-key": apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await response.json().catch(() => ({}))) as JsonRecord;
  if (!response.ok || body.status === false) {
    throw new Error(
      providerMessage("AstrologyAPI Human Design request failed.", body),
    );
  }
  return body;
};

const validatePayload = (value: unknown) => {
  if (!isRecord(value))
    throw new Error("Human Design request body is invalid.");
  const encoded = JSON.stringify(value);
  if (encoded.length > 80_000)
    throw new Error("Human Design request body is too large.");
  return value;
};

export const buildHumanDesignInterpretationPayload = (
  input: JsonRecord,
): JsonRecord => ({
  name: input.name,
  day: input.day,
  month: input.month,
  year: input.year,
  hour: input.hour,
  min: input.minute,
  lat: input.latitude,
  lon: input.longitude,
  tzone: input.timezone_offset,
});

const saveReading = async ({
  env,
  kind,
  input,
  result,
  locale,
  now,
}: {
  env: RuntimeEnv;
  kind: ReadingKind;
  input: JsonRecord;
  result: JsonRecord;
  locale: string;
  now: string;
}) => {
  const id = createId(`hd_${kind}`);
  if (!env.DB) throw new Error("Chart storage is not available.");
  await env.DB.prepare(
    "INSERT INTO ap_human_design_readings (id, reading_type, locale, status, input_json, result_json, created_at, updated_at) VALUES (?, ?, ?, 'ready', ?, ?, ?, ?)",
  )
    .bind(
      id,
      kind,
      locale,
      JSON.stringify(input),
      JSON.stringify(result),
      now,
      now,
    )
    .run?.();
  return id;
};

export const createHumanDesignChart = async ({
  env,
  body,
  locale = "en",
  fetcher = fetch,
  now = nowIso(),
}: {
  env: RuntimeEnv;
  body: unknown;
  locale?: string;
  fetcher?: ProviderFetch;
  now?: string;
}) => {
  const rawInput = validatePayload(body);
  const { provider: input, privateInput } = await normalizeHumanDesignInput({
    value: rawInput,
    locale,
    fetcher,
  });
  const chart = await postHumanDesignProvider({
    env,
    endpoint: humanDesignEndpoints.chart,
    payload: input,
    locale,
    fetcher,
  });
  const interpretationPayload = buildHumanDesignInterpretationPayload(input);
  const [interpretation, about] = await Promise.all([
    postHumanDesignProvider({
      env,
      endpoint: humanDesignEndpoints.chartInterpretation,
      payload: interpretationPayload,
      locale,
      fetcher,
    }),
    postHumanDesignProvider({
      env,
      endpoint: humanDesignEndpoints.aboutInterpretation,
      payload: interpretationPayload,
      locale,
      fetcher,
    }),
  ]);
  const result = { chart, interpretation, about };
  const readingId = await saveReading({
    env,
    kind: "chart",
    input: privateInput,
    result,
    locale,
    now,
  });
  if (privateInput.email) {
    await linkBusinessLead({
      env,
      submission: {
        kind: "report",
        source: "human_design_chart",
        formKey: "free-human-design-chart",
        pagePath: "/",
        locale,
        fullName: privateInput.name,
        email: privateInput.email,
        sourceReferenceType: "human_design_reading",
        sourceReferenceId: readingId,
        details: { readingId, chartType: "human-design" },
      },
    });
  }
  return {
    ok: true as const,
    readingId,
    result,
    profile: {
      name: privateInput.name,
      birthDate: privateInput.birthDate,
      birthTime: privateInput.birthTime,
      birthPlace: privateInput.birthPlace,
    },
  };
};

export const getHumanDesignReading = async ({
  env,
  readingId,
  kind,
}: {
  env: RuntimeEnv;
  readingId: string;
  kind?: ReadingKind;
}) => {
  if (!env.DB || !/^[A-Za-z0-9_-]{1,100}$/.test(readingId)) return null;
  const row = (await env.DB.prepare(
    `SELECT id, reading_type, locale, input_json, result_json, created_at FROM ap_human_design_readings WHERE id = ?${kind ? " AND reading_type = ?" : ""} AND status = 'ready' LIMIT 1`,
  )
    .bind(...(kind ? [readingId, kind] : [readingId]))
    .first?.()) as Record<string, unknown> | null | undefined;
  if (!row) return null;
  try {
    return {
      readingId: safeString(row.id),
      kind: safeString(row.reading_type),
      locale: safeString(row.locale),
      profile: JSON.parse(safeString(row.input_json)),
      result: JSON.parse(safeString(row.result_json)),
      createdAt: safeString(row.created_at),
    };
  } catch {
    return null;
  }
};
