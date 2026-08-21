type JsonRecord = Record<string, unknown>;

const record = (value: unknown): JsonRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
const primitiveText = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
const cleanText = (value: unknown) => primitiveText(value)
  .replace(/\s*:contentReference\[[^\]]*\]\{[^}]*\}/g, "")
  .trim();
const displayText = (value: unknown) => {
  const item = record(value);
  return item
    ? cleanText(item.label ?? item.name ?? item.title ?? item.code ?? item.value)
    : cleanText(value);
};
const keyOf = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const findValue = (root: unknown, keys: string[], depth = 0): unknown => {
  if (depth > 7) return undefined;
  const item = record(root);
  if (!item) return undefined;
  const wanted = new Set(keys.map(keyOf));
  for (const [key, value] of Object.entries(item)) {
    if (wanted.has(keyOf(key)) && value !== null && value !== undefined && value !== "") return value;
  }
  for (const value of Object.values(item)) {
    if (record(value)) {
      const found = findValue(value, keys, depth + 1);
      if (found !== undefined) return found;
    }
  }
  return undefined;
};

const findArray = (root: unknown, keys: string[], depth = 0): unknown[] => {
  if (depth > 7) return [];
  const item = record(root);
  if (!item) return [];
  const wanted = new Set(keys.map(keyOf));
  for (const [key, value] of Object.entries(item)) {
    if (wanted.has(keyOf(key)) && Array.isArray(value)) return value;
  }
  for (const value of Object.values(item)) {
    if (record(value)) {
      const found = findArray(value, keys, depth + 1);
      if (found.length) return found;
    }
  }
  return [];
};

const title = (value: string) => value
  .replace(/[_-]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const position = (value: unknown) => {
  const item = record(value);
  if (!item) return cleanText(value);
  const direct = cleanText(item.hd_position ?? item.position ?? item.gate_line ?? item.gateLine);
  if (direct) return direct;
  const gate = cleanText(item.gate ?? item.gate_id ?? item.gateId);
  const line = cleanText(item.line ?? item.line_id ?? item.lineId);
  return gate ? `${gate}${line ? `.${line}` : ""}` : "";
};

const normalizeActivations = (value: unknown) => {
  if (Array.isArray(value)) return value.map((entry, index) => {
    const item = record(entry) ?? {};
    return { planet_id: Number(item.planet_id ?? item.planetId ?? item.id ?? index + 1), hd_position: position(item) };
  }).filter((entry) => entry.hd_position);
  const item = record(value);
  return item ? Object.entries(item).map(([planet, entry], index) => {
    const data = record(entry) ?? {};
    return { planet_id: Number(data.planet_id ?? data.planetId ?? data.id ?? index + 1), planet, hd_position: position(data) };
  }).filter((entry) => entry.hd_position) : [];
};

const centerAliases: Record<string, string> = {
  gcenter: "g", identity: "g", heart: "ego", heartcenter: "ego", will: "ego", egocenter: "ego",
  solarplexus: "solar", solarplexuscenter: "solar", emotional: "solar", splenic: "spleen", spleniccenter: "spleen",
};
const normalizeCenterId = (value: unknown) => {
  const key = keyOf(displayText(value));
  return centerAliases[key] || key.replace(/center$/, "");
};

const channelId = (entry: unknown) => {
  const item = record(entry);
  const direct = displayText(item?.id ?? item?.channel ?? item?.name ?? entry);
  const matches = direct.match(/\b(\d{1,2})\D+(\d{1,2})\b/);
  if (matches) return `${matches[1]}-${matches[2]}`;
  const gates = Array.isArray(item?.gates) ? item.gates.map(displayText).filter(Boolean) : [];
  return gates.length >= 2 ? `${gates[0]}-${gates[1]}` : "";
};
const canonicalChannelId = (value: string) => value.split("-").map(Number).sort((a, b) => a - b).join("-");

const paragraphs = (value: unknown, content: string) => Array.isArray(value)
  ? value.map(cleanText).filter(Boolean)
  : content.split(/\n\s*\n/).map(cleanText).filter(Boolean);

const normalizeSection = (value: unknown) => {
  const item = record(value) ?? {};
  const content = cleanText(item.content ?? item.description ?? item.meaning);
  return {
    title: displayText(item.title ?? item.label ?? item.name),
    content,
    paragraphs: paragraphs(item.paragraphs, content),
  };
};

const normalizeAboutDetails = (result: JsonRecord) => {
  const about = record(result.about);
  const interpretation = record(about?.interpretation) ?? {};
  return Object.fromEntries(["type", "strategy", "authority", "profile", "definition"].map((id) => {
    const item = record(interpretation[id]) ?? {};
    const sections = Array.isArray(item.sections) ? item.sections.map(normalizeSection).filter((section) => section.content || section.paragraphs.length) : [];
    return [id, { key: displayText(item.key) || id, sections }];
  }));
};

const normalizeChartInterpretation = (result: JsonRecord) => {
  const interpretationRoot = record(result.interpretation);
  const interpretation = record(interpretationRoot?.interpretation) ?? {};
  const centerGroups = record(interpretation.centers) ?? {};
  const channelGroups = record(interpretation.channels) ?? {};
  const gateGroups = record(interpretation.gates) ?? {};

  const centerDetails = [
    ...(Array.isArray(centerGroups.defined) ? centerGroups.defined : []),
    ...(Array.isArray(centerGroups.undefined) ? centerGroups.undefined : []),
  ].map((entry) => {
    const item = record(entry) ?? {};
    const content = cleanText(item.content ?? item.description);
    return {
      id: normalizeCenterId(item.id ?? item.label),
      name: displayText(item.label ?? item.name ?? item.id),
      state: keyOf(displayText(item.status)) === "defined" ? "Defined" : "Open",
      description: content,
      paragraphs: paragraphs(item.paragraphs, content),
    };
  }).filter((entry) => entry.id);

  const channelDetails = (Array.isArray(channelGroups.defined) ? channelGroups.defined : []).map((entry) => {
    const item = record(entry) ?? {};
    const id = channelId(item.id ?? item.label);
    const content = cleanText(item.content ?? item.description);
    return {
      id,
      name: `Channel ${id}`,
      label: displayText(item.label).replace(new RegExp(`^Channel\\s+${id.replace("-", "[-–]")}\\s*:?\\s*`, "i"), ""),
      description: content,
      paragraphs: paragraphs(item.paragraphs, content),
    };
  }).filter((entry) => entry.id);

  const gateDetails = (Array.isArray(gateGroups.active) ? gateGroups.active : []).map((entry) => {
    const item = record(entry) ?? {};
    const id = Number(item.id ?? item.gate ?? item.number);
    const content = cleanText(item.content ?? item.description);
    return {
      id,
      name: displayText(item.label ?? item.name) || `Gate ${id}`,
      state: "Active",
      description: content,
      paragraphs: paragraphs(item.paragraphs, content),
    };
  }).filter((entry) => entry.id);

  const planetDetails = (Array.isArray(interpretation.planets) ? interpretation.planets : []).map((entry) => {
    const item = record(entry) ?? {};
    const content = cleanText(item.content ?? item.description);
    return {
      name: displayText(item.planet ?? item.name),
      meaning: cleanText(item.meaning),
      description: content,
      paragraphs: paragraphs(item.paragraphs, content),
    };
  }).filter((entry) => entry.name);

  return { centerDetails, channelDetails, gateDetails, planetDetails };
};

export const normalizeHumanDesignView = (rawResult: unknown) => {
  const result = record(rawResult) ?? {};
  const chart = record(result.chart) ?? result;
  const natal = record(chart.natal) ?? {};
  const planetary = record(findValue(chart, ["planetary_activations", "planetaryActivations", "activations"])) ?? {};
  const design = normalizeActivations(planetary.design ?? planetary.unconscious ?? findValue(chart, ["design_activations", "designActivations"]));
  const personality = normalizeActivations(planetary.personality ?? planetary.conscious ?? findValue(chart, ["personality_activations", "personalityActivations"]));
  const designGates = new Set(design.map((entry) => Number(entry.hd_position.split(".")[0])).filter(Boolean));
  const personalityGates = new Set(personality.map((entry) => Number(entry.hd_position.split(".")[0])).filter(Boolean));

  const rawGates = findArray(chart, ["gates", "all_gates", "gateData"]);
  const gateIds = new Set<number>([...designGates, ...personalityGates]);
  rawGates.forEach((entry) => {
    const item = record(entry);
    const id = Number(item?.id ?? item?.gate ?? item?.number ?? entry);
    const state = displayText(item?.state ?? item?.status ?? item?.natal ?? item?.activation).toLowerCase();
    const designState = displayText(item?.design).toLowerCase();
    const personalityState = displayText(item?.personality).toLowerCase();
    const explicitlyActive = item?.active === true
      || item?.defined === true
      || item?.design === true
      || item?.personality === true
      || [state, designState, personalityState].some((value) => ["active", "defined", "true", "1"].includes(value));
    if (id && explicitlyActive) gateIds.add(id);
  });
  const gates = Array.from({ length: 64 }, (_, index) => {
    const id = index + 1;
    return {
      id,
      design: designGates.has(id) ? "active" : "inactive",
      personality: personalityGates.has(id) ? "active" : "inactive",
    };
  });

  const centers = findArray(chart, ["centers", "centres"]).map((entry) => {
    const item = record(entry) ?? {};
    const id = normalizeCenterId(item.id ?? item.key ?? item.name);
    const rawState = displayText(item.natal ?? item.state ?? item.status ?? item.definition ?? item.defined).toLowerCase();
    const active = item.defined === true || item.active === true || ["active", "defined", "true", "1"].includes(rawState);
    return { id, natal: active ? "active" : "open" };
  }).filter((entry) => entry.id);
  const normalizedCenters = centers.length ? centers : ["head", "ajna", "throat", "g", "ego", "spleen", "sacral", "solar", "root"].map((id) => ({ id, natal: "open" }));

  const chartInterpretation = normalizeChartInterpretation(result);
  const channelDetailById = new Map(chartInterpretation.channelDetails.map((entry) => [canonicalChannelId(entry.id), entry]));
  const rawChannels = findArray(chart, ["channels", "active_channels", "activeChannels"]);
  const channels = rawChannels.map((entry) => {
    const item = record(entry) ?? {};
    const id = channelId(entry);
    const detail = channelDetailById.get(canonicalChannelId(id));
    const state = displayText(item.natal ?? item.state ?? item.status ?? item.activation).toLowerCase();
    const explicitlyInactive = item.active === false
      || item.defined === false
      || ["inactive", "open", "undefined", "false", "0"].includes(state);
    return {
      id,
      natal: explicitlyInactive ? "inactive" : "active",
      name: displayText(item.name ?? item.title) || detail?.name || `Channel ${id}`,
      label: displayText(item.label ?? item.keyword ?? item.theme) || detail?.label || "",
      description: cleanText(item.description ?? item.meaning ?? item.interpretation) || detail?.description || `Channel ${id} is active in this chart.`,
      paragraphs: detail?.paragraphs || [],
    };
  }).filter((entry) => entry.id && entry.natal === "active");

  const value = (explicit: unknown, keys: string[], fallback: string) => displayText(explicit)
    || displayText(findValue(chart, keys))
    || displayText(findValue(result.interpretation, keys))
    || displayText(findValue(result.about, keys))
    || fallback;
  const type = value(natal.type, ["type", "energy_type", "energyType"], "Human Design chart");
  const strategy = value(natal.strategy, ["strategy"], "See your chart interpretation");
  const authority = value(natal.authority, ["authority", "inner_authority", "innerAuthority"], "See your chart interpretation");
  const profile = value(natal.profile, ["profile", "profile_name", "profileName"], "See your chart interpretation");
  const definition = value(natal.definition, ["definition", "definition_type", "definitionType"], "See your chart interpretation");
  const signature = value(natal.signature, ["signature"], "—");
  const notSelf = value(natal.not_self_theme, ["not_self_theme", "notSelfTheme"], "—");
  const cross = value(natal.incarnation_cross, ["incarnation_cross", "incarnationCross", "cross"], "—");

  return {
    type: title(type), strategy: title(strategy), authority: title(authority), profile, definition: title(definition), signature: title(signature), notSelf: title(notSelf), cross,
    chartData: { planetary_activations: { design, personality }, gates, centers: normalizedCenters, channels },
    activeGates: [...gateIds].sort((a, b) => a - b),
    channels,
    definedCenters: normalizedCenters.filter((entry) => entry.natal === "active").map((entry) => entry.id),
    aboutDetails: normalizeAboutDetails(result),
    ...chartInterpretation,
  };
};
