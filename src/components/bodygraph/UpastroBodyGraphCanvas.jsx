import { useMemo, useState } from "react";

const ChartPropertiesPopup = () => null;

const PLANET_SYMBOLS = {
  1: "☉",
  2: "⊕",
  3: "☽",
  4: "☊",
  5: "☋",
  6: "☿",
  7: "♀",
  8: "♂",
  9: "♃",
  10: "♄",
  11: "♅",
  12: "♆",
  13: "♇",
};

const PLANET_NAME_TO_ID = {
  sun: 1,
  earth: 2,
  moon: 3,
  northnode: 4,
  southnode: 5,
  mercury: 6,
  venus: 7,
  mars: 8,
  jupiter: 9,
  saturn: 10,
  uranus: 11,
  neptune: 12,
  pluto: 13,
};

const formatHdPositionOneDecimal = (value, emptyValue = "") => {
  if (value === null || value === undefined || value === "") return emptyValue;
  const rawValue = String(value);
  const [gatePart, linePart] = rawValue.split(".");
  const gate = Number.parseInt(gatePart, 10);
  const line = Number.parseInt(linePart, 10);
  if (Number.isInteger(gate) && Number.isInteger(line)) return `${gate}.${line}`;
  if (Number.isInteger(gate)) return String(gate);
  const numeric = Number(rawValue);
  if (Number.isFinite(numeric)) return String(Math.trunc(numeric * 10) / 10);
  return rawValue;
};

const getGateFromHdPosition = (value = "") => {
  const [gate] = String(value).split(".");
  return Number(gate) || null;
};

const DESIGN_COLOR = "var(--hd-design-pipe)";
const PERSONALITY_COLOR = "var(--hd-personality-pipe)";
const INACTIVE_CHANNEL_COLOR = "var(--hd-pipe-bg)";
const ACTIVE_GATE_FILL = "var(--hd-gate-active-bg)";
const INACTIVE_GATE_FILL = "transparent";
const OPEN_CENTER_FILL = "var(--hd-pipe-bg)";
const DIMMED_CENTER_OPACITY = 0.12;
const DIMMED_CHANNEL_OPACITY = 0.105;
const DIMMED_CHANNEL_BACKDROP_OPACITY = 0.09;

const CENTER_GATES = {
  Head: [64, 61, 63],
  Ajna: [47, 24, 4, 17, 11, 43],
  Throat: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45],
  G: [1, 7, 13, 10, 25, 15, 46, 2],
  Ego: [21, 51, 26, 40],
  Sacral: [5, 14, 29, 34, 27, 59, 42, 3, 9],
  Root: [53, 60, 52, 54, 38, 58, 19, 39, 41],
  Spleen: [48, 57, 44, 50, 32, 28, 18],
  Solar: [36, 22, 37, 6, 49, 55, 30],
};

const DEFAULT_CHANNELS = [
  [64, 47],
  [61, 24],
  [63, 4],
  [17, 62],
  [43, 23],
  [11, 56],
  [31, 7],
  [8, 1],
  [33, 13],
  [45, 21],
  [16, 48],
  [20, 57],
  [35, 36],
  [12, 22],
  [10, 34],
  [25, 51],
  [15, 5],
  [2, 14],
  [46, 29],
  [26, 44],
  [40, 37],
  [42, 53],
  [3, 60],
  [9, 52],
  [32, 54],
  [28, 38],
  [18, 58],
  [55, 39],
  [49, 19],
  [30, 41],
  [50, 27],
  [6, 59],
];

const PRIORITY_ACTIVE_OVERLAY_CHANNELS = new Set(["10-34", "20-57"]);
const INTEGRATION_CLUSTER_GATES = new Set([20, 57, 10, 34]);
const INTEGRATION_CLUSTER_VISIBLE_CHANNELS = new Set(["10-34", "20-57"]);
const INTEGRATION_CLUSTER_ALL_CHANNELS = new Set([
  "10-20",
  "10-34",
  "10-57",
  "20-34",
  "20-57",
  "34-57",
]);

const FORCED_STRAIGHT_CHANNELS = new Set([
  "1-8",
  "3-60",
  "7-31",
  "13-33",
  "17-62",
  "23-43",
  "11-56",
  "47-64",
  "24-61",
  "4-63",
  "2-14",
  "5-15",
  "29-46",
  "42-53",
  "9-52",
]);

const GRAPH = {
  width: 560,
  height: 1050,
  centers: {
    Head: {
      x: 280,
      y: 65,
      w: 160,
      h: 130,
      type: "triangleUp",
      fill: "var(--hd-center-head)",
    },
    Ajna: {
      x: 280,
      y: 224,
      w: 160,
      h: 130,
      type: "triangleDown",
      fill: "var(--hd-center-ajna)",
    },
    Throat: {
      x: 280,
      y: 380,
      w: 104,
      h: 115,
      type: "rect",
      fill: "var(--hd-center-throat)",
    },
    G: {
      x: 280,
      y: 550,
      w: 150,
      h: 150,
      type: "diamond",
      fill: "var(--hd-center-g)",
    },
    Ego: {
      x: 410,
      y: 600,
      w: 120,
      h: 100,
      type: "triangleUp",
      rotationDeg: 14,
      fill: "var(--hd-center-ego)",
    },
    Spleen: {
      x: 80,
      y: 731,
      w: 130,
      h: 150,
      type: "triangleRight",
      fill: "var(--hd-center-spleen)",
    },
    Sacral: {
      x: 280,
      y: 755,
      w: 104,
      h: 115,
      type: "rect",
      fill: "var(--hd-center-sacral)",
    },
    Solar: {
      x: 460,
      y: 731,
      w: 130,
      h: 150,
      type: "triangleLeft",
      fill: "var(--hd-center-solar)",
    },
    Root: {
      x: 280,
      y: 914,
      w: 104,
      h: 115,
      type: "rect",
      fill: "var(--hd-center-root)",
    },
  },
};

const HUMAN_FIGURE_PATH = `M671.25,720.333
        c65.375-9.208,139.079-31.648,174.117-78.966c16.881-22.798,28.908-71.182,24.447-81.59c-5.669-14.687-12.07-18.102-41.12-12.717
        c-15.263,2.493-45.825-2.943-46.283-29.05c1.443-21.161,3.351-77.706-2.598-86.628c-5.948-8.922-25.356-11.331-23.87-21.74
        C757.432,399.234,787.812,340.841,788,329c0.342-11.055-10.485-25.269-14.176-29.8c-0.701-0.861-1.308-2.242-1.308-2.242
        s-0.447-1.587-0.411-2.653c0.353-10.534,3.855-69.289,39.709-123.306c47.271-71.216,126.082-72.703,163-72.703
        c31.227,0,114.516-5.073,179,72.703c87.732,105.736,22,227.669-18,297c-40.653,70.464-34.601,135.015-5.182,173.367
        c51.63,67.306,140.211,75.574,177.034,79.299c6.29,0.775,30.712,2.604,42,10.667c14,10,19.035,27.878,21,32.333
        c33.599,81.192,250.128,602.245,311.976,760.714c9.01,24.849,14.156,42.028,13.288,54.655c-1.088,15.818-10.16,31.84-21.706,44.259
        c-255.071,280.326-426.6,344.511-686.225,344.511l-0.22,0.005c-258.299,0-438.955-66.053-685.481-344.145
        c-10.958-12.36-20.065-29.441-20.555-45.333c-0.033-1.062-2.509-18.369,9.915-48.615
        c65.989-163.213,263.609-628.923,322.634-766.192c10.524-24.476,24.68-31.761,24.832-31.859
        C645.625,727.5,653.981,723.124,671.25,720.333z`;

const LIGHT_CENTER_TEXT = "rgba(0,0,0,0.52)";
const DARK_CENTER_TEXT = "rgba(255,255,255,0.74)";

const GATE_TO_CENTER = Object.entries(CENTER_GATES).reduce(
  (acc, [centerName, gates]) => {
    gates.forEach((gate) => {
      acc[gate] = centerName;
    });
    return acc;
  },
  {},
);

const CENTER_KEY_TO_GRAPH_ID = {
  head: "Head",
  ajna: "Ajna",
  throat: "Throat",
  g: "G",
  g_center: "G",
  ego: "Ego",
  heart: "Ego",
  spleen: "Spleen",
  splenic: "Spleen",
  sacral: "Sacral",
  root: "Root",
  solar: "Solar",
  solar_plexus: "Solar",
};

const normalizeCenterKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getCenterGraphId = (center) => {
  if (!center) return "";

  return (
    CENTER_KEY_TO_GRAPH_ID[normalizeCenterKey(center.graphId)] ||
    CENTER_KEY_TO_GRAPH_ID[normalizeCenterKey(center.id)] ||
    CENTER_KEY_TO_GRAPH_ID[normalizeCenterKey(center.name)] ||
    ""
  );
};

const isCenterDefinitionActive = (center) => {
  const state = String(
    center?.natal || center?.state || center?.status || center?.definition || "",
  ).toLowerCase();

  return state === "defined" || state === "active";
};

const getInactiveGateTextColor = (gate, centerFill) => {
  if (centerFill === OPEN_CENTER_FILL) {
    return "var(--hd-personality-pipe)";
  }

  const centerName = GATE_TO_CENTER[gate];

  return ["G", "Head"].includes(centerName)
    ? LIGHT_CENTER_TEXT
    : DARK_CENTER_TEXT;
};

const getActiveGateFill = (centerFill) =>
  centerFill === OPEN_CENTER_FILL ? "var(--hd-personality-pipe)" : ACTIVE_GATE_FILL;

const getActiveGateTextColor = (centerFill) =>
  centerFill === OPEN_CENTER_FILL
    ? "var(--hd-pipe-bg)"
    : "var(--hd-gate-active-text)";

const getGateFontWeight = (gate, active) => {
  return active ? "600" : "400";
};

const getPlanetSymbolScale = (symbol) => {
  return 1;
};

const PLANET_ID_TO_NAME = Object.entries(PLANET_NAME_TO_ID).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {},
);

const channelId = (g1, g2) => `channel-${Math.min(g1, g2)}-${Math.max(g1, g2)}`;
const channelSegmentId = (g1, g2, gate) =>
  `channel-segment-${Math.min(g1, g2)}-${Math.max(g1, g2)}-${gate}`;
const parseChannelSegmentFocus = (id) => {
  if (!id?.startsWith("channel-segment-")) return null;

  const [, , g1, g2, gate] = id.split("-");

  return {
    g1: Number(g1),
    g2: Number(g2),
    gate: Number(gate),
  };
};

const trianglePoints = (cx, cy, w, h, direction) => {
  if (direction === "up") {
    return [
      { x: cx, y: cy - h / 2 },
      { x: cx + w / 2, y: cy + h / 2 },
      { x: cx - w / 2, y: cy + h / 2 },
    ];
  }
  if (direction === "down") {
    return [
      { x: cx - w / 2, y: cy - h / 2 },
      { x: cx + w / 2, y: cy - h / 2 },
      { x: cx, y: cy + h / 2 },
    ];
  }
  if (direction === "right") {
    return [
      { x: cx - w / 2, y: cy - h / 2 },
      { x: cx - w / 2, y: cy + h / 2 },
      { x: cx + w / 2, y: cy },
    ];
  }
  return [
    { x: cx + w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy + h / 2 },
    { x: cx - w / 2, y: cy },
  ];
};

const rotatePoint = (point, origin, angleDeg = 0) => {
  if (!angleDeg) return point;

  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
};

const getCenterShapePoints = (center) => {
  let points = null;

  if (center.type === "triangleUp") {
    points = trianglePoints(center.x, center.y, center.w, center.h, "up");
  } else if (center.type === "triangleDown") {
    points = trianglePoints(center.x, center.y, center.w, center.h, "down");
  } else if (center.type === "triangleRight") {
    points = trianglePoints(center.x, center.y, center.w, center.h, "right");
  } else if (center.type === "triangleLeft") {
    points = trianglePoints(center.x, center.y, center.w, center.h, "left");
  } else if (center.type === "diamond") {
    points = [
      { x: center.x, y: center.y - center.h / 2 },
      { x: center.x + center.w / 2, y: center.y },
      { x: center.x, y: center.y + center.h / 2 },
      { x: center.x - center.w / 2, y: center.y },
    ];
  }

  if (!points) return null;

  return points.map((point) =>
    rotatePoint(point, { x: center.x, y: center.y }, center.rotationDeg),
  );
};

const roundedPolygonPath = (points, radius = 12) => {
  if (!points || points.length < 3) return "";

  const count = points.length;
  const getPoint = (index) => points[(index + count) % count];
  const moveToward = (from, to, length) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;
    return {
      x: from.x + (dx / distance) * length,
      y: from.y + (dy / distance) * length,
    };
  };

  let d = "";

  for (let index = 0; index < count; index += 1) {
    const prev = getPoint(index - 1);
    const current = getPoint(index);
    const next = getPoint(index + 1);

    const prevLength = Math.hypot(current.x - prev.x, current.y - prev.y);
    const nextLength = Math.hypot(next.x - current.x, next.y - current.y);
    const cornerRadius = Math.min(radius, prevLength * 0.4, nextLength * 0.4);

    const start = moveToward(current, prev, cornerRadius);
    const end = moveToward(current, next, cornerRadius);

    d += index === 0 ? `M ${start.x} ${start.y} ` : `L ${start.x} ${start.y} `;
    d += `Q ${current.x} ${current.y} ${end.x} ${end.y} `;
  }

  return `${d}Z`;
};

const pathPairId = (g1, g2) => `${Math.min(g1, g2)}-${Math.max(g1, g2)}`;
const normalizeChannelId = (id = "") => {
  const parts = id.split("-").map((part) => Number(part));

  if (parts.length !== 2 || parts.some(Number.isNaN)) {
    return id;
  }

  return pathPairId(parts[0], parts[1]);
};
const isIntegrationClusterGate = (gate) => INTEGRATION_CLUSTER_GATES.has(gate);
const isIntegrationVisibleChannel = (g1, g2) =>
  INTEGRATION_CLUSTER_VISIBLE_CHANNELS.has(pathPairId(g1, g2));

const pathSpecToD = (pathSpec) => {
  if (!pathSpec) return "";

  if (pathSpec.type === "line") {
    return `M ${pathSpec.start.x} ${pathSpec.start.y} L ${pathSpec.end.x} ${pathSpec.end.y}`;
  }

  return `M ${pathSpec.start.x} ${pathSpec.start.y} C ${pathSpec.c1.x} ${pathSpec.c1.y}, ${pathSpec.c2.x} ${pathSpec.c2.y}, ${pathSpec.end.x} ${pathSpec.end.y}`;
};

const offsetPoint = (point, offset) => ({
  x: point.x + offset.x,
  y: point.y + offset.y,
});

const getPerpendicularOffset = (vector, distance = 0) => {
  const length = Math.hypot(vector.x, vector.y) || 1;

  return {
    x: (-vector.y / length) * distance,
    y: (vector.x / length) * distance,
  };
};

const offsetLinePathSpec = (pathSpec, distance = 0) => {
  if (!distance) return pathSpec;

  const offset = getPerpendicularOffset(
    {
      x: pathSpec.end.x - pathSpec.start.x,
      y: pathSpec.end.y - pathSpec.start.y,
    },
    distance,
  );

  return {
    type: "line",
    start: offsetPoint(pathSpec.start, offset),
    end: offsetPoint(pathSpec.end, offset),
  };
};

const getCubicBezierPoint = (pathSpec, t) => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      mt2 * mt * pathSpec.start.x +
      3 * mt2 * t * pathSpec.c1.x +
      3 * mt * t2 * pathSpec.c2.x +
      t2 * t * pathSpec.end.x,
    y:
      mt2 * mt * pathSpec.start.y +
      3 * mt2 * t * pathSpec.c1.y +
      3 * mt * t2 * pathSpec.c2.y +
      t2 * t * pathSpec.end.y,
  };
};

const getCubicBezierTangent = (pathSpec, t) => {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (pathSpec.c1.x - pathSpec.start.x) +
      6 * mt * t * (pathSpec.c2.x - pathSpec.c1.x) +
      3 * t * t * (pathSpec.end.x - pathSpec.c2.x),
    y:
      3 * mt * mt * (pathSpec.c1.y - pathSpec.start.y) +
      6 * mt * t * (pathSpec.c2.y - pathSpec.c1.y) +
      3 * t * t * (pathSpec.end.y - pathSpec.c2.y),
  };
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const lerpPoint = (start, end, t) => ({
  x: start.x + (end.x - start.x) * t,
  y: start.y + (end.y - start.y) * t,
});

const getPathPointAt = (pathSpec, t) => {
  if (pathSpec.type === "line") {
    return lerpPoint(pathSpec.start, pathSpec.end, t);
  }

  return getCubicBezierPoint(pathSpec, t);
};

const getPathTangentAt = (pathSpec, t) => {
  if (pathSpec.type === "line") {
    return {
      x: pathSpec.end.x - pathSpec.start.x,
      y: pathSpec.end.y - pathSpec.start.y,
    };
  }

  return getCubicBezierTangent(pathSpec, t);
};

const pointsToPathD = (points = []) => {
  if (!points.length) return "";

  return points.reduce(
    (d, point, index) =>
      `${d}${index === 0 ? "M" : " L"} ${point.x} ${point.y}`,
    "",
  );
};

const getPolylineLength = (points = []) =>
  points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

const extendPolylineEndpoints = (
  points = [],
  startExtension = 0,
  endExtension = 0,
) => {
  if (points.length < 2 || (!startExtension && !endExtension)) {
    return points;
  }

  const next = points[1];
  const previous = points[points.length - 2];
  const start = points[0];
  const end = points[points.length - 1];
  const extendedPoints = [...points];

  if (startExtension > 0) {
    const startVector = {
      x: start.x - next.x,
      y: start.y - next.y,
    };
    const startLength = Math.hypot(startVector.x, startVector.y) || 1;

    extendedPoints[0] = {
      x: start.x + (startVector.x / startLength) * startExtension,
      y: start.y + (startVector.y / startLength) * startExtension,
    };
  }

  if (endExtension > 0) {
    const endVector = {
      x: end.x - previous.x,
      y: end.y - previous.y,
    };
    const endLength = Math.hypot(endVector.x, endVector.y) || 1;

    extendedPoints[extendedPoints.length - 1] = {
      x: end.x + (endVector.x / endLength) * endExtension,
      y: end.y + (endVector.y / endLength) * endExtension,
    };
  }

  return extendedPoints;
};

const getSegmentSamplePoints = (
  pathSpec,
  from = 0,
  to = 1,
  distance = 0,
  steps = 48,
) => {
  if (!pathSpec) return [];

  const safeFrom = clamp(from, 0, 1);
  const safeTo = clamp(to, 0, 1);
  const startT = Math.min(safeFrom, safeTo);
  const endT = Math.max(safeFrom, safeTo);

  if (pathSpec.type === "line") {
    const lineSpec = distance
      ? offsetLinePathSpec(pathSpec, distance)
      : pathSpec;
    return [getPathPointAt(lineSpec, startT), getPathPointAt(lineSpec, endT)];
  }

  const pointCount = Math.max(
    2,
    Math.ceil(steps * Math.max(endT - startT, 0.12)),
  );
  const points = [];
  let previousOffset = null;

  for (let index = 0; index <= pointCount; index += 1) {
    const t = startT + (endT - startT) * (index / pointCount);
    const point = getPathPointAt(pathSpec, t);
    const tangent = getPathTangentAt(pathSpec, t);
    const tangentLength = Math.hypot(tangent.x, tangent.y);
    const offset =
      tangentLength > 0
        ? getPerpendicularOffset(tangent, distance)
        : previousOffset || { x: 0, y: 0 };

    points.push(offsetPoint(point, offset));
    previousOffset = offset;
  }

  return points;
};

const getSegmentRange = (segment, epsilon = 0.0025) => ({
  from: segment.from > 0 ? clamp(segment.from - epsilon, 0, 1) : 0,
  to: segment.to < 1 ? clamp(segment.to + epsilon, 0, 1) : 1,
});

const CUSTOM_JUNCTION_CHANNELS = new Set(["10-34", "20-57"]);

const getIntegrationVisualJunctionPoint = (gatePositions) => {
  const gate57 = gatePositions[57];
  const gate10 = gatePositions[10];
  const gate34 = gatePositions[34];

  if (!gate57 || !gate10 || !gate34) return null;

  return {
    x: gate57.x + (gate10.x - gate57.x) * 0.1,
    y: gate57.y + (gate34.y - gate57.y) * -2,
  };
};

const getClosestPathTToPoint = (pathSpec, point, steps = 240) => {
  if (!pathSpec || !point) return 0.5;

  let closestT = 0.5;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const pathPoint = getPathPointAt(pathSpec, t);
    const distance = Math.hypot(pathPoint.x - point.x, pathPoint.y - point.y);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestT = t;
    }
  }

  return clamp(closestT, 0.12, 0.88);
};

const getChannelSplitT = (g1, g2, pathSpec, gatePositions) => {
  const pair = pathPairId(g1, g2);

  if (!CUSTOM_JUNCTION_CHANNELS.has(pair)) return 0.5;

  const junctionPoint = getIntegrationVisualJunctionPoint(gatePositions);
  return getClosestPathTToPoint(pathSpec, junctionPoint);
};

const buildSegmentLanePaths = (pathSpec, segment, laneDistance = 2.5) => {
  const range = getSegmentRange(segment);
  const basePoints = getSegmentSamplePoints(pathSpec, range.from, range.to);
  const base = pointsToPathD(basePoints);

  if (!segment.active) {
    return { base };
  }

  if (!(segment.design && segment.personality)) {
    return { base };
  }

  const designPoints = getSegmentSamplePoints(
    pathSpec,
    range.from,
    range.to,
    laneDistance,
  );
  const personalityPoints = getSegmentSamplePoints(
    pathSpec,
    range.from,
    range.to,
    -laneDistance,
  );
  const designLength = getPolylineLength(designPoints);
  const personalityLength = getPolylineLength(personalityPoints);
  const maxLength = Math.max(designLength, personalityLength);
  const designDiff = Math.max(0, maxLength - designLength);
  const personalityDiff = Math.max(0, maxLength - personalityLength);
  const shouldExtendStart = segment.from === 0;
  const shouldExtendEnd = segment.to === 1;
  const normalizedDesignPoints = extendPolylineEndpoints(
    designPoints,
    shouldExtendStart ? designDiff / (shouldExtendEnd ? 2 : 1) : 0,
    shouldExtendEnd ? designDiff / (shouldExtendStart ? 2 : 1) : 0,
  );
  const normalizedPersonalityPoints = extendPolylineEndpoints(
    personalityPoints,
    shouldExtendStart ? personalityDiff / (shouldExtendEnd ? 2 : 1) : 0,
    shouldExtendEnd ? personalityDiff / (shouldExtendStart ? 2 : 1) : 0,
  );

  return {
    base,
    design: pointsToPathD(normalizedDesignPoints),
    personality: pointsToPathD(normalizedPersonalityPoints),
  };
};

const createPathSpec = (p1, p2, g1, g2) => {
  const pair = pathPairId(g1, g2);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const absX = Math.abs(dx);

  let c1;
  let c2;

  if (FORCED_STRAIGHT_CHANNELS.has(pair)) {
    return {
      type: "line",
      start: p1,
      end: p2,
    };
  }

  if (pair === "10-34") {
    c1 = { x: p1.x - 300, y: p1.y + 12 };
    c2 = { x: p2.x - 118, y: p2.y - 25 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "16-48") {
    c1 = { x: p1.x - 100, y: p1.y + dy * 0.2 };
    c2 = { x: p2.x, y: p2.y - dy * 0.5 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "20-57") {
    c1 = { x: p1.x - 60, y: p1.y + dy * 0.2 };
    c2 = { x: p2.x, y: p2.y - dy * 0.47 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "35-36") {
    c1 = { x: p1.x + 66, y: p1.y + 2 };
    c2 = { x: p2.x + 16, y: p2.y - 132 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "12-22") {
    c1 = { x: p1.x + 58, y: p1.y + 4 };
    c2 = { x: p2.x + 10, y: p2.y - 128 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "21-45") {
    const start = { x: p1.x, y: p1.y + 5 };
    c1 = { x: start.x + 22, y: start.y + 2 };
    c2 = { x: p2.x + 8, y: p2.y - 64 };
    return {
      type: "cubic",
      start,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "25-51") {
    c1 = { x: p1.x + 34, y: p1.y - 2 };
    c2 = { x: p2.x + 6, y: p2.y - 18 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "27-50") {
    c1 = { x: p1.x + 14, y: p1.y + 28 };
    c2 = { x: p2.x - 22, y: p2.y - 2 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "6-59") {
    c1 = { x: p1.x - 26, y: p1.y + 18 };
    c2 = { x: p2.x + 24, y: p2.y };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }
  if (pair === "26-44") {
    c1 = { x: p1.x - 152, y: p1.y + -10 };
    c2 = { x: p2.x + 22, y: p2.y - 20 };
    return {
      type: "cubic",
      start: p1,
      c1,
      c2,
      end: p2,
    };
  }

  if (absX < 15 && Math.abs(dy) < 15) {
    return {
      type: "line",
      start: p1,
      end: p2,
    };
  }

  if (absX > 100 && dy > 50 && p1.y > 400) {
    if (p1.x < p2.x) {
      c1 = { x: p1.x, y: p1.y + dy * 0.5 };
      c2 = { x: p2.x - 60, y: p2.y - dy * 0.1 };
    } else {
      c1 = { x: p1.x, y: p1.y + dy * 0.5 };
      c2 = { x: p2.x + 60, y: p2.y - dy * 0.1 };
    }
  } else {
    c1 = { x: p1.x, y: p1.y + dy * 0.5 };
    c2 = { x: p2.x, y: p2.y - dy * 0.5 };
  }

  return {
    type: "cubic",
    start: p1,
    c1,
    c2,
    end: p2,
  };
};

const buildGatePositions = () => {
  const centers = GRAPH.centers;
  const positions = {};
  const setGate = (id, centerName, dx, dy) => {
    positions[id] = {
      id,
      x: centers[centerName].x + dx,
      y: centers[centerName].y + dy,
      center: centerName,
    };
  };

  // Head top gates — x must match Ajna top gates for straight channels
  setGate(64, "Head", -30, 55);
  setGate(61, "Head", 0, 55);
  setGate(63, "Head", 30, 55);

  setGate(47, "Ajna", -30, -49);
  setGate(24, "Ajna", 0, -49);
  setGate(4, "Ajna", 30, -49);
  // Ajna bottom gates — x must match Throat top gates for straight channels
  setGate(17, "Ajna", -26, -4);
  setGate(11, "Ajna", 26, -4);
  setGate(43, "Ajna", 0, 36);

  // Throat top gates — x must match Ajna bottom gates (17, 43, 11) for straight channels
  setGate(62, "Throat", -26, -44);
  setGate(23, "Throat", 0, -44);
  setGate(56, "Throat", 26, -44);
  setGate(16, "Throat", -40, -18);
  setGate(20, "Throat", -40, 8);
  setGate(35, "Throat", 40, -18);
  setGate(12, "Throat", 40, 6);
  setGate(45, "Throat", 40, 28);
  setGate(31, "Throat", -26, 44);
  setGate(8, "Throat", 0, 44);
  setGate(33, "Throat", 26, 44);

  setGate(1, "G", 0, -52);
  setGate(7, "G", -26, -28);
  setGate(13, "G", 26, -28);
  setGate(10, "G", -48, 8);
  setGate(25, "G", 48, 8);
  setGate(15, "G", -26, 30);
  setGate(46, "G", 26, 30);
  setGate(2, "G", 0, 54);

  setGate(21, "Ego", 6, -24);
  setGate(51, "Ego", -14, 0);
  setGate(26, "Ego", -42, 28);
  setGate(40, "Ego", 25, 45);

  setGate(48, "Spleen", -50, -47);
  setGate(18, "Spleen", -50, 50);
  setGate(57, "Spleen", -22, -35);
  setGate(28, "Spleen", -22, 34);
  setGate(44, "Spleen", 8, -18);
  setGate(32, "Spleen", 8, 18);
  setGate(50, "Spleen", 35, 1);

  setGate(5, "Sacral", -26, -43);
  setGate(14, "Sacral", 0, -43);
  setGate(29, "Sacral", 26, -43);
  setGate(34, "Sacral", -40, -17);
  setGate(27, "Sacral", -40, 13);
  setGate(59, "Sacral", 40, 14);
  setGate(42, "Sacral", -26, 43);
  setGate(3, "Sacral", 0, 43);
  setGate(9, "Sacral", 26, 43);

  setGate(36, "Solar", 52, -50);
  setGate(30, "Solar", 50, 49);
  setGate(22, "Solar", 28, -34);
  setGate(55, "Solar", 22, 36);
  setGate(37, "Solar", -8, -18);
  setGate(49, "Solar", -8, 18);
  setGate(6, "Solar", -40, 0);

  setGate(53, "Root", -26, -43);
  setGate(60, "Root", 0, -43);
  setGate(52, "Root", 26, -43);
  setGate(54, "Root", -40, -18);
  setGate(38, "Root", -39, 7);
  setGate(58, "Root", -37, 37);
  setGate(19, "Root", 40, -18);
  setGate(39, "Root", 39, 7);
  setGate(41, "Root", 37, 37);

  return positions;
};

const getActivationRows = (items = [], isDesign = false) =>
  items.map((item) => ({
    symbol: PLANET_SYMBOLS[item.planet_id] || "•",
    iconName: PLANET_ID_TO_NAME[item.planet_id] || null,
    planetId: item.planet_id,
    gateLine: formatHdPositionOneDecimal(item.hd_position, "-"),
    gate: getGateFromHdPosition(item.hd_position),
    isDesign,
  }));

const getGateActivationState = (gate, designSet, personalitySet) => ({
  design: designSet.has(gate),
  personality: personalitySet.has(gate),
});

const areGateStatesEqual = (left, right) =>
  left.design === right.design && left.personality === right.personality;

const getChannelSegments = (
  g1,
  g2,
  designSet,
  personalitySet,
  splitT = 0.5,
) => {
  const startState = getGateActivationState(g1, designSet, personalitySet);
  const endState = getGateActivationState(g2, designSet, personalitySet);
  const startActive = startState.design || startState.personality;
  const endActive = endState.design || endState.personality;
  const safeSplitT = clamp(splitT, 0.1, 0.9);

  const createSegment = (state, from, to, gates) => ({
    from,
    to,
    gates,
    design: state.design,
    personality: state.personality,
    active: state.design || state.personality,
  });

  if (!startActive && !endActive) {
    return [
      createSegment({ design: false, personality: false }, 0, 1, [g1, g2]),
    ];
  }

  if (areGateStatesEqual(startState, endState)) {
    return [
      createSegment(startState, 0, safeSplitT, [g1]),
      createSegment(endState, safeSplitT, 1, [g2]),
    ];
  }

  return [
    createSegment(startState, 0, safeSplitT, [g1]),
    createSegment(endState, safeSplitT, 1, [g2]),
  ];
};

const getSegmentStrokeLayers = (segment, lanePaths) => {
  if (!segment.active) {
    return [
      {
        stroke: INACTIVE_CHANNEL_COLOR,
        strokeWidth: "10",
        d: lanePaths.base,
        transform: undefined,
      },
    ];
  }

  if (segment.design && segment.personality) {
    return [
      {
        stroke: DESIGN_COLOR,
        strokeWidth: "5",
        d: lanePaths.design,
        transform: undefined,
      },
      {
        stroke: PERSONALITY_COLOR,
        strokeWidth: "5",
        d: lanePaths.personality,
        transform: undefined,
      },
    ];
  }

  return [
    {
      stroke: segment.design ? DESIGN_COLOR : PERSONALITY_COLOR,
      strokeWidth: "10",
      d: lanePaths.base,
      transform: undefined,
    },
  ];
};

const SideColumn = ({
  title,
  rows,
  align = "left",
  focusId,
  rowHoveredGate,
  isGateHighlighted,
}) => {
  const isLeft = align === "left";

  return (
    <div className={isLeft ? "text-left" : "text-right"}>
      <div
        className={`mb-2 pb-1 text-xs font-cera_medium sm:mb-3 sm:border-b-2 sm:text-center sm:text-sm md:text-base ${
          isLeft
            ? "md:text-left md:pl-4 border-hd-cta-primary text-hd-text-primary"
            : "border-hd-text-primary text-hd-text-primary"
        }`}
      >
        <span
          className={`inline-block border-b-2 px-2 pb-1 sm:border-b-0 sm:px-0 sm:pb-0 ${
            isLeft ? "border-hd-cta-primary" : "border-hd-text-primary"
          }`}
        >
          {title}
        </span>
      </div>
      <div className="space-y-1 text-[10px] sm:space-y-1.5 sm:text-xs md:space-y-2 md:text-base">
        {rows.map((row, index) => {
          const highlighted = row.gate
            ? rowHoveredGate
              ? rowHoveredGate === row.gate
              : isGateHighlighted(row.gate)
            : true;
          const isActiveRow = row.gate
            ? focusId === `gate-${row.gate}` ||
              rowHoveredGate === row.gate
            : false;
          const isHoverLinkedRow = row.gate
            ? highlighted && Boolean(focusId)
            : false;
          const showRowBg = isActiveRow || isHoverLinkedRow;

          return (
            <div
              key={`${row.gateLine}-${index}`}
              className={`flex ${
                isLeft
                  ? "justify-start sm:justify-center"
                  : "justify-end sm:justify-center"
              }`}
            >
              <span
                className={`upastro-activation-row flex h-[24px] w-[72px] items-center gap-1 rounded-[8px] md:px-2 text-center sm:h-[28px] sm:w-[84px] sm:gap-1.5 md:h-[40px] md:w-[104px] md:gap-2 md:rounded-[10px] md:px-3 ${
                  isLeft ? "justify-start" : "justify-end"
                } ${
                  isLeft
                    ? showRowBg
                      ? "bg-hd-cta-primary text-hd-primary-cta-text"
                      : "bg-transparent text-hd-cta-primary"
                    : showRowBg
                    ? "bg-hd-border text-white"
                    : "bg-transparent text-hd-text-primary"
                }`}
                style={{ opacity: highlighted ? 1 : 0.25 }}
              >
                {isLeft ? (
                  <>
                    <span
                      className={`inline-flex h-[14px] w-[14px] items-center justify-center leading-none sm:h-[16px] sm:w-[16px] md:h-[20px] md:w-[20px] ${
                        row.symbol !== "♁" ? "hamburgSymbols" : ""
                      }`}
                      style={{
                        fontSize: "inherit",
                        transform: `scale(${getPlanetSymbolScale(row.symbol)})`,
                        transformOrigin: "center",
                      }}
                    >
                      {row.symbol}
                    </span>
                    <span>{row.gateLine}</span>
                  </>
                ) : (
                  <>
                    <span>{row.gateLine}</span>
                    <span
                      className={`inline-flex h-[14px] w-[14px] items-center justify-center leading-none sm:h-[16px] sm:w-[16px] md:h-[20px] md:w-[20px] ${
                        row.symbol !== "♁" ? "hamburgSymbols" : ""
                      }`}
                      style={{
                        fontSize: "inherit",
                        transform: `scale(${getPlanetSymbolScale(row.symbol)})`,
                        transformOrigin: "center",
                      }}
                    >
                      {row.symbol}
                    </span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BodyGraphCanvas = ({
  theme = "dark",
  interactive = true,
  showActivationColumns = true,
  propertiesOpen = undefined,
  onPropertiesOpenChange = undefined,
  chartData = /** @type {any} */ (null),
  chartError = "",
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [rowHoveredGate, setRowHoveredGate] = useState(null);
  const [internalPanelOpen, setInternalPanelOpen] = useState(false);
  const [propertiesNavOverride, setPropertiesNavOverride] = useState(null);
  const [propertiesCenterGraphId, setPropertiesCenterGraphId] = useState(null);
  const [propertiesChannelId, setPropertiesChannelId] = useState(null);
  const [propertiesGateId, setPropertiesGateId] = useState(null);
  const [propertiesActivationOverride, setPropertiesActivationOverride] =
    useState(null);
  const data = chartData;

  const gatePositions = useMemo(() => buildGatePositions(), []);
  const isLight = theme === "light";
  const isExternallyControlled = typeof propertiesOpen === "boolean";
  const panelOpen = isExternallyControlled ? propertiesOpen : internalPanelOpen;

  const setPanelOpen = (nextOpen) => {
    if (!isExternallyControlled) setInternalPanelOpen(nextOpen);
    if (typeof onPropertiesOpenChange === "function") {
      onPropertiesOpenChange(nextOpen);
    }
  };

  const focusId = hoveredId;
  const focusedChannelSegment = parseChannelSegmentFocus(focusId);
  const focusedChannelId = focusedChannelSegment
    ? channelId(focusedChannelSegment.g1, focusedChannelSegment.g2)
    : null;

  const designRows = useMemo(
    () => getActivationRows(data?.planetary_activations?.design || [], true),
    [data],
  );
  const personalityRows = useMemo(
    () => getActivationRows(data?.planetary_activations?.personality || []),
    [data],
  );

  const designSet = useMemo(() => {
    const activationGates = designRows.map((item) => item.gate).filter(Boolean);
    const fallbackGates = (data?.gates || [])
      .filter((gate) => gate.design === "active")
      .map((gate) => gate.id);
    return new Set(activationGates.length ? activationGates : fallbackGates);
  }, [data, designRows]);

  const personalitySet = useMemo(() => {
    const activationGates = personalityRows
      .map((item) => item.gate)
      .filter(Boolean);
    const fallbackGates = (data?.gates || [])
      .filter((gate) => gate.personality === "active")
      .map((gate) => gate.id);
    return new Set(activationGates.length ? activationGates : fallbackGates);
  }, [data, personalityRows]);

  const activeGates = useMemo(
    () => new Set([...designSet, ...personalitySet]),
    [designSet, personalitySet],
  );
  const centerFillByGraphId = useMemo(() => {
    const centers = Array.isArray(data?.centers) ? data.centers : [];

    if (!centers.length) return null;

    return centers.reduce((acc, center) => {
      const graphId = getCenterGraphId(center);
      if (!graphId) return acc;

      acc[graphId] = isCenterDefinitionActive(center)
        ? GRAPH.centers[graphId]?.fill
        : OPEN_CENTER_FILL;
      return acc;
    }, {});
  }, [data]);

  const getCenterFill = (name, center) =>
    centerFillByGraphId?.[name] || center.fill;

  const activeIntegrationClusterGates = useMemo(
    () => [20, 57, 10, 34].filter((gate) => activeGates.has(gate)),
    [activeGates],
  );
  const activeIntegrationClusterGateSet = useMemo(
    () => new Set(activeIntegrationClusterGates),
    [activeIntegrationClusterGates],
  );
  const activeIntegrationClusterCenters = useMemo(
    () =>
      new Set(
        activeIntegrationClusterGates
          .map((gate) => GATE_TO_CENTER[gate])
          .filter(Boolean),
      ),
    [activeIntegrationClusterGates],
  );
  const activeIntegrationClusterChannelIds = useMemo(() => {
    const ids = [];

    (data?.channels || []).forEach((channel) => {
      if (channel?.natal !== "active") return;

      const normalizedId = normalizeChannelId(channel.id || "");
      if (!INTEGRATION_CLUSTER_ALL_CHANNELS.has(normalizedId)) return;
      ids.push(normalizedId);
    });

    return ids;
  }, [data]);
  const integrationClusterMode =
    activeIntegrationClusterGates.length <= 1
      ? "single"
      : activeIntegrationClusterGates.length === 2
      ? "resolved"
      : "ambiguous";
  const resolvedIntegrationClusterChannelId =
    integrationClusterMode === "resolved"
      ? activeIntegrationClusterChannelIds[0] ||
        pathPairId(
          activeIntegrationClusterGates[0],
          activeIntegrationClusterGates[1],
        )
      : null;
  const integrationClusterVisibleHighlightIds = useMemo(() => {
    if (integrationClusterMode === "single") return new Set();

    if (
      integrationClusterMode === "resolved" &&
      resolvedIntegrationClusterChannelId &&
      INTEGRATION_CLUSTER_VISIBLE_CHANNELS.has(
        resolvedIntegrationClusterChannelId,
      )
    ) {
      return new Set([resolvedIntegrationClusterChannelId]);
    }

    return new Set(
      Array.from(INTEGRATION_CLUSTER_VISIBLE_CHANNELS).filter((id) => {
        const [left, right] = id.split("-").map(Number);
        return (
          activeIntegrationClusterGateSet.has(left) ||
          activeIntegrationClusterGateSet.has(right)
        );
      }),
    );
  }, [
    activeIntegrationClusterGateSet,
    integrationClusterMode,
    resolvedIntegrationClusterChannelId,
  ]);
  const focusedChannelIsFullyConnected = focusedChannelSegment
    ? activeGates.has(focusedChannelSegment.g1) &&
      activeGates.has(focusedChannelSegment.g2)
    : false;
  const focusedIntegrationClusterChannel =
    focusedChannelSegment &&
    isIntegrationVisibleChannel(
      focusedChannelSegment.g1,
      focusedChannelSegment.g2,
    );
  const shouldUseIntegrationClusterFocus =
    focusedIntegrationClusterChannel && integrationClusterMode !== "single";
  const focusedChannelCenters = new Set(
    focusedChannelSegment
      ? shouldUseIntegrationClusterFocus
        ? Array.from(activeIntegrationClusterCenters)
        : focusedChannelIsFullyConnected
        ? [
            GATE_TO_CENTER[focusedChannelSegment.g1],
            GATE_TO_CENTER[focusedChannelSegment.g2],
          ].filter(Boolean)
        : [GATE_TO_CENTER[focusedChannelSegment.gate]].filter(Boolean)
      : [],
  );
  const focusedChannelGates = new Set(
    focusedChannelSegment
      ? shouldUseIntegrationClusterFocus
        ? activeIntegrationClusterGates
        : focusedChannelIsFullyConnected
        ? [focusedChannelSegment.g1, focusedChannelSegment.g2]
        : [focusedChannelSegment.gate]
      : [],
  );

  const isCenterHighlighted = (centerName) => {
    if (!focusId) return true;
    if (focusId === `center-${centerName}`) return true;
    const centerGates = CENTER_GATES[centerName] || [];

    if (focusedChannelSegment) {
      return focusedChannelCenters.has(centerName);
    }

    if (focusId.startsWith("gate-")) {
      const clickedGate = Number(focusId.replace("gate-", ""));
      return centerGates.includes(clickedGate);
    }

    if (focusId.startsWith("channel-")) {
      const [, g1, g2] = focusId.split("-");
      return (
        centerGates.includes(Number(g1)) || centerGates.includes(Number(g2))
      );
    }

    return false;
  };

  const isGateHighlighted = (gate) => {
    if (!focusId) return true;
    if (focusId === `gate-${gate}`) return true;

    if (focusedChannelSegment) {
      return focusedChannelGates.has(gate);
    }

    if (focusId.startsWith("center-")) {
      const centerName = focusId.replace("center-", "");
      return (CENTER_GATES[centerName] || []).includes(gate);
    }

    if (focusId.startsWith("channel-")) {
      const [, g1, g2] = focusId.split("-");
      return gate === Number(g1) || gate === Number(g2);
    }

    return false;
  };

  const isChannelHighlighted = (g1, g2) => {
    if (!focusId) return true;
    if (focusId === channelId(g1, g2)) return true;

    if (focusedChannelSegment) {
      if (shouldUseIntegrationClusterFocus) {
        return integrationClusterVisibleHighlightIds.has(pathPairId(g1, g2));
      }
      return focusedChannelId === channelId(g1, g2);
    }

    if (focusId.startsWith("center-")) {
      const centerName = focusId.replace("center-", "");
      const centerGates = new Set(CENTER_GATES[centerName] || []);
      return centerGates.has(g1) || centerGates.has(g2);
    }

    if (focusId.startsWith("gate-")) {
      const gate = Number(focusId.replace("gate-", ""));
      return gate === g1 || gate === g2;
    }

    return false;
  };

  const getChannelSegmentOpacity = (g1, g2, segment) => {
    const dimmedOpacity = DIMMED_CHANNEL_OPACITY;

    if (!focusId) return 1;
    if (!isChannelHighlighted(g1, g2)) return dimmedOpacity;
    if (!segment.active) return dimmedOpacity;

    if (focusedChannelSegment) {
      if (shouldUseIntegrationClusterFocus) {
        if (!integrationClusterVisibleHighlightIds.has(pathPairId(g1, g2))) {
          return dimmedOpacity;
        }
        if (integrationClusterMode === "ambiguous") {
          return 1;
        }
        return segment.gates.some((gate) =>
          activeIntegrationClusterGateSet.has(gate),
        )
          ? 1
          : dimmedOpacity;
      }
      if (focusedChannelId !== channelId(g1, g2)) return dimmedOpacity;
      if (focusedChannelIsFullyConnected) return 1;
      return segment.gates.includes(focusedChannelSegment.gate)
        ? 1
        : dimmedOpacity;
    }

    if (focusId === channelId(g1, g2)) return 1;

    if (focusId.startsWith("gate-")) {
      const gate = Number(focusId.replace("gate-", ""));
      return segment.gates.includes(gate) ? 1 : dimmedOpacity;
    }

    if (focusId.startsWith("center-")) {
      const centerName = focusId.replace("center-", "");
      const centerGates = new Set(CENTER_GATES[centerName] || []);
      return segment.gates.some((gate) => centerGates.has(gate))
        ? 1
        : dimmedOpacity;
    }

    return dimmedOpacity;
  };

  const shouldHighlightChannelSegment = (g1, g2, segment) => {
    if (!focusId || !segment.active) return false;

    if (focusedChannelSegment) {
      if (shouldUseIntegrationClusterFocus) {
        if (!integrationClusterVisibleHighlightIds.has(pathPairId(g1, g2))) {
          return false;
        }
        if (integrationClusterMode === "ambiguous") {
          return true;
        }
        return segment.gates.some((gate) =>
          activeIntegrationClusterGateSet.has(gate),
        );
      }
      if (focusedChannelId !== channelId(g1, g2)) return false;
      if (focusedChannelIsFullyConnected) return true;
      return segment.gates.includes(focusedChannelSegment.gate);
    }

    if (focusId === channelId(g1, g2)) return true;

    if (focusId.startsWith("gate-")) {
      const gate = Number(focusId.replace("gate-", ""));
      return segment.gates.includes(gate);
    }

    if (focusId.startsWith("center-")) {
      const centerName = focusId.replace("center-", "");
      const centerGates = new Set(CENTER_GATES[centerName] || []);
      return segment.gates.some((gate) => centerGates.has(gate));
    }

    return false;
  };

  const handleSelect = (id, payload = {}) => {
    if (!interactive) return;
    if (id?.startsWith("center-")) {
      const centerName = id.replace("center-", "");
      setPropertiesNavOverride("centers");
      setPropertiesCenterGraphId(centerName);
      setPropertiesChannelId(null);
      setPropertiesGateId(null);
      setPropertiesActivationOverride(null);
    } else if (payload?.type === "channel") {
      setPropertiesNavOverride("channels");
      setPropertiesChannelId(payload.channelId || null);
      setPropertiesCenterGraphId(null);
      setPropertiesGateId(null);
      setPropertiesActivationOverride(null);
    } else if (payload?.type === "gate") {
      setPropertiesNavOverride("gates");
      setPropertiesGateId(payload.gateId || null);
      setPropertiesCenterGraphId(null);
      setPropertiesChannelId(null);
      setPropertiesActivationOverride(null);
    } else if (payload?.type === "activation") {
      setPropertiesNavOverride("activations");
      setPropertiesActivationOverride(payload);
      setPropertiesCenterGraphId(null);
      setPropertiesChannelId(null);
      setPropertiesGateId(null);
    } else {
      setPropertiesNavOverride(null);
      setPropertiesCenterGraphId(null);
      setPropertiesChannelId(null);
      setPropertiesGateId(null);
      setPropertiesActivationOverride(null);
    }
    setPanelOpen(true);
  };

  const handleChannelSegmentSelect = (g1, g2, segmentGate) => {
    if (
      isIntegrationVisibleChannel(g1, g2) &&
      integrationClusterMode === "ambiguous"
    ) {
      handleSelect(channelId(g1, g2), {
        type: "channel",
        channelId: null,
      });
      return;
    }

    if (
      isIntegrationVisibleChannel(g1, g2) &&
      integrationClusterMode === "resolved" &&
      resolvedIntegrationClusterChannelId
    ) {
      handleSelect(`channel-${resolvedIntegrationClusterChannelId}`, {
        type: "channel",
        channelId: resolvedIntegrationClusterChannelId,
      });
      return;
    }

    const isFullyConnected = activeGates.has(g1) && activeGates.has(g2);

    if (isFullyConnected) {
      handleSelect(channelId(g1, g2), {
        type: "channel",
        channelId: `${Math.min(g1, g2)}-${Math.max(g1, g2)}`,
      });
      return;
    }

    handleSelect(`gate-${segmentGate}`, {
      type: "gate",
      gateId: segmentGate,
    });
  };

  const renderChannel = (g1, g2, keyPrefix = "", layer = "base") => {
    const start = gatePositions[g1];
    const end = gatePositions[g2];
    if (!start || !end) return null;

    const pathSpec = createPathSpec(start, end, g1, g2);
    const splitT = getChannelSplitT(g1, g2, pathSpec, gatePositions);
    const d = pathSpecToD(pathSpec);
    const id = channelId(g1, g2);
    const showHoverBorder =
      Boolean(hoveredId) &&
        (hoveredId.startsWith("center-") ||
          hoveredId.startsWith("gate-") ||
          hoveredId.startsWith("channel-") ||
          hoveredId.startsWith("channel-segment-"));
    const segments = getChannelSegments(
      g1,
      g2,
      designSet,
      personalitySet,
      splitT,
    );
    const activeSegments = segments.filter((segment) => segment.active);
    const hasActiveOverlay = segments.some((segment) => segment.active);
    const backdropOpacity = focusId ? DIMMED_CHANNEL_BACKDROP_OPACITY : 1;
    const visibleSegments = hasActiveOverlay
      ? segments.filter((segment) => segment.active)
      : segments;

    const renderedSegments = visibleSegments
      .map((segment) => {
        const shouldHighlight = shouldHighlightChannelSegment(g1, g2, segment);

        return {
          ...segment,
          lanePaths: buildSegmentLanePaths(pathSpec, segment),
          shouldHighlight,
          opacity: getChannelSegmentOpacity(g1, g2, segment),
        };
      })
      .filter((segment) => {
        if (layer === "highlight") return segment.shouldHighlight;
        if (layer === "priority-overlay") return segment.active;
        return !focusId || !segment.shouldHighlight;
      });

    if (
      (layer === "highlight" || layer === "priority-overlay") &&
      !renderedSegments.length
    ) {
      return null;
    }

    return (
      <g
        key={`${keyPrefix}${id}`}
        pointerEvents={
          layer === "highlight" || layer === "priority-overlay"
            ? "none"
            : undefined
        }
        onMouseLeave={() => setHoveredId(null)}
      >
        {layer === "base" && hasActiveOverlay ? (
          <path
            d={d}
            fill="none"
            stroke={INACTIVE_CHANNEL_COLOR}
            strokeWidth="10"
            strokeLinecap="butt"
            opacity={backdropOpacity}
            pointerEvents="none"
          />
        ) : null}
        {renderedSegments.flatMap((segment, index) =>
          getSegmentStrokeLayers(segment, segment.lanePaths).flatMap(
            (strokeLayer, laneIndex) => [
              layer === "highlight" && showHoverBorder ? (
                <path
                  key={`${keyPrefix}${id}-${index}-${laneIndex}-border`}
                  d={strokeLayer.d}
                  fill="none"
                  stroke="var(--hd-focus-color)"
                  strokeWidth={Number(strokeLayer.strokeWidth) + 6}
                  strokeLinecap="butt"
                  opacity={segment.opacity}
                  transform={strokeLayer.transform}
                  pointerEvents="none"
                />
              ) : null,
              <path
                key={`${keyPrefix}${id}-${index}-${laneIndex}`}
                d={strokeLayer.d}
                fill="none"
                stroke={strokeLayer.stroke}
                strokeWidth={strokeLayer.strokeWidth}
                strokeLinecap="butt"
                opacity={segment.opacity}
                transform={strokeLayer.transform}
                pointerEvents="none"
              />,
            ],
          ),
        )}
        {layer === "base" && interactive
          ? activeSegments.map((segment, index) => {
              const hitLanePaths = buildSegmentLanePaths(pathSpec, segment);

              return (
                <path
                  key={`${keyPrefix}${id}-hit-${index}`}
                  d={hitLanePaths.base}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="36"
                  pointerEvents="stroke"
                  onMouseEnter={() =>
                    setHoveredId(channelSegmentId(g1, g2, segment.gates[0]))
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    handleChannelSegmentSelect(g1, g2, segment.gates[0]);
                  }}
                />
              );
            })
          : null}
      </g>
    );
  };

  if (chartError) {
    return (
      <div
        className="mt-6 rounded-xl border p-6 text-center"
        style={{ borderColor: "#ef4444", color: "#ef4444" }}
      >
        {chartError}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="mt-6 rounded-xl border p-6 text-center"
        style={{ borderColor: isLight ? "#d1d5db" : "#4b5563" }}
      >
        No human design data available.
      </div>
    );
  }

  return (
    <>
      <section
        className={`upastro-bodygraph-canvas mt-3 px-0 md:mt-4 md:px-0${showActivationColumns ? "" : " upastro-bodygraph-canvas--graph-only"}`}
        onClick={interactive ? () => {
          setHoveredId(null);
          setRowHoveredGate(null);
        } : undefined}
      >
        <div className="mx-auto w-full max-w-[760px]">
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[72px_minmax(0,1fr)_72px] items-start gap-0 sm:w-fit sm:grid-cols-[110px_minmax(275px,400px)_110px] sm:gap-2 md:grid-cols-[110px_minmax(450px,588px)_110px] md:gap-6">
            <div className="justify-self-start">
              {showActivationColumns ? <SideColumn
                title="Design"
                rows={designRows}
                align="left"
                focusId={focusId}
                rowHoveredGate={rowHoveredGate}
                onHover={(gate) => {
                  setHoveredId(gate ? `gate-${gate}` : null);
                  setRowHoveredGate(gate || null);
                }}
                onLeave={() => {
                  setHoveredId(null);
                  setRowHoveredGate(null);
                }}
                onSelect={(row) =>
                  handleSelect(`gate-${row.gate}`, {
                    type: "activation",
                    tab: row.isDesign ? "design" : "personality",
                    icon: row.iconName,
                  })
                }
                isGateHighlighted={isGateHighlighted}
              /> : null}
            </div>

            <div className="relative mx-auto -mt-[28px] w-[min(100%,300px)] lg:-mt-0 sm:w-[325px] md:w-[450px]">
              <svg
                aria-hidden
                viewBox="190 0 1600 2000"
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none absolute left-1/2 top-[-118px] h-[calc(100%+218px)] w-[calc(100%+88px)] -translate-x-1/2 overflow-visible sm:top-[-136px] sm:h-[calc(100%+250px)] sm:w-[calc(100%+70px)]"
                style={{ opacity: isLight ? 0.16 : 0.2 }}
              >
                <path
                  d={HUMAN_FIGURE_PATH}
                  fill="var(--hd-silhouette)"
                  stroke="none"
                />
              </svg>

              <svg
                viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`}
                className="relative h-auto w-full overflow-visible md:h-[700px]"
              >
                <g>
                  {DEFAULT_CHANNELS.map(([g1, g2]) =>
                    renderChannel(g1, g2, "channel-base-", "base"),
                  )}
                </g>

                <g pointerEvents="none">
                  {DEFAULT_CHANNELS.filter(([g1, g2]) =>
                    PRIORITY_ACTIVE_OVERLAY_CHANNELS.has(pathPairId(g1, g2)),
                  ).map(([g1, g2]) =>
                    renderChannel(
                      g1,
                      g2,
                      "channel-priority-overlay-",
                      "priority-overlay",
                    ),
                  )}
                </g>

                <g pointerEvents="none">
                  {DEFAULT_CHANNELS.map(([g1, g2]) =>
                    renderChannel(g1, g2, "channel-highlight-", "highlight"),
                  )}
                </g>

                <g>
                  {Object.entries(GRAPH.centers).map(([name, center]) => {
                    const highlighted = isCenterHighlighted(name);
                    const showHoverBorder =
                      Boolean(hoveredId) &&
                        (hoveredId.startsWith("center-") ||
                          hoveredId.startsWith("gate-") ||
                          hoveredId.startsWith("channel-") ||
                          hoveredId.startsWith("channel-segment-"));
                    const isRelatedTargetSameCenter = (event) => {
                      const related = event?.relatedTarget;
                      if (!related) return false;
                      return (
                        related.getAttribute?.("data-center") === name ||
                        related.closest?.(`[data-center="${name}"]`) !== null
                      );
                    };
                    const commonProps = {
                      fill: getCenterFill(name, center),
                      opacity: highlighted ? 1 : DIMMED_CENTER_OPACITY,
                      stroke:
                        showHoverBorder && highlighted ? "var(--hd-focus-color)" : "none",
                      strokeWidth: showHoverBorder && highlighted ? 3 : 0,
                      vectorEffect: "non-scaling-stroke",
                      "data-center": name,
                      ...(interactive ? {
                        onMouseEnter: () => setHoveredId(`center-${name}`),
                        onMouseLeave: (event) => {
                          if (isRelatedTargetSameCenter(event)) return;
                          setHoveredId(null);
                        },
                        onClick: (event) => {
                          event.stopPropagation();
                          handleSelect(`center-${name}`);
                        },
                      } : {}),
                    };

                    if (center.type === "triangleUp") {
                      return (
                        <path
                          key={name}
                          d={roundedPolygonPath(
                            getCenterShapePoints(center),
                            30,
                          )}
                          {...commonProps}
                        />
                      );
                    }

                    if (center.type === "triangleDown") {
                      return (
                        <path
                          key={name}
                          d={roundedPolygonPath(
                            getCenterShapePoints(center),
                            30,
                          )}
                          {...commonProps}
                        />
                      );
                    }

                    if (center.type === "triangleRight") {
                      return (
                        <path
                          key={name}
                          d={roundedPolygonPath(
                            getCenterShapePoints(center),
                            30,
                          )}
                          {...commonProps}
                        />
                      );
                    }

                    if (center.type === "triangleLeft") {
                      return (
                        <path
                          key={name}
                          d={roundedPolygonPath(
                            getCenterShapePoints(center),
                            30,
                          )}
                          {...commonProps}
                        />
                      );
                    }

                    if (center.type === "diamond") {
                      return (
                        <path
                          key={name}
                          d={roundedPolygonPath(
                            getCenterShapePoints(center),
                            24,
                          )}
                          {...commonProps}
                        />
                      );
                    }

                    return (
                      <rect
                        key={name}
                        x={center.x - center.w / 2}
                        y={center.y - center.h / 2}
                        width={center.w}
                        height={center.h}
                        rx="24"
                        {...commonProps}
                      />
                    );
                  })}
                </g>

                <g>
                  {Object.entries(gatePositions).map(([idString, position]) => {
                    const gate = Number(idString);
                    const active = activeGates.has(gate);
                    const highlighted = isGateHighlighted(gate);
                    const centerName = GATE_TO_CENTER[gate];
                    const centerFill = centerName
                      ? getCenterFill(centerName, GRAPH.centers[centerName])
                      : null;
                    const interactiveProps = active && interactive
                      ? {
                          onMouseEnter: () => setHoveredId(`gate-${gate}`),
                          onClick: (event) => {
                            event.stopPropagation();
                            handleSelect(`gate-${gate}`, {
                              type: "gate",
                              gateId: gate,
                            });
                          },
                          onMouseLeave: (event) => {
                            const related = event?.relatedTarget;
                            if (!related) {
                              setHoveredId(null);
                              return;
                            }
                            const isSameCenter =
                              related.getAttribute?.("data-center") ===
                                centerName ||
                              related.closest?.(
                                `[data-center="${centerName}"]`,
                              ) !== null;
                            if (!isSameCenter) {
                              setHoveredId(null);
                            }
                          },
                        }
                      : {};

                    return (
                      <g
                        key={gate}
                        transform={`translate(${position.x}, ${position.y})`}
                        opacity={highlighted ? 1 : 0.25}
                        data-center={centerName}
                        pointerEvents={active && interactive ? undefined : "none"}
                        {...interactiveProps}
                      >
                        {active ? (
                          <circle r="10" fill={getActiveGateFill(centerFill)} />
                        ) : null}
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={active ? "14.2" : "13.625"}
                          fontWeight={getGateFontWeight(gate, active)}
                          fill={
                            active
                              ? getActiveGateTextColor(centerFill)
                              : getInactiveGateTextColor(gate, centerFill)
                          }
                        >
                          {gate}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <div className="justify-self-end">
              {showActivationColumns ? <SideColumn
                title="Personality"
                rows={personalityRows}
                align="right"
                focusId={focusId}
                rowHoveredGate={rowHoveredGate}
                onHover={(gate) => {
                  setHoveredId(gate ? `gate-${gate}` : null);
                  setRowHoveredGate(gate || null);
                }}
                onLeave={() => {
                  setHoveredId(null);
                  setRowHoveredGate(null);
                }}
                onSelect={(row) =>
                  handleSelect(`gate-${row.gate}`, {
                    type: "activation",
                    tab: row.isDesign ? "design" : "personality",
                    icon: row.iconName,
                  })
                }
                isGateHighlighted={isGateHighlighted}
              /> : null}
            </div>
          </div>
        </div>
      </section>

      {interactive ? <ChartPropertiesPopup
        open={panelOpen}
        chartData={data}
        activeNav={propertiesNavOverride}
        onNavChange={() => {
          setPropertiesNavOverride(null);
          setPropertiesCenterGraphId(null);
          setPropertiesChannelId(null);
          setPropertiesGateId(null);
          setPropertiesActivationOverride(null);
        }}
        onActivationHover={(gate) => {
          setHoveredId(gate ? `gate-${gate}` : null);
          setRowHoveredGate(null);
        }}
        onActivationLeave={() => {
          setHoveredId(null);
        }}
        onGateHover={(gate) => {
          setHoveredId(gate ? `gate-${gate}` : null);
          setRowHoveredGate(null);
        }}
        onGateLeave={() => {
          setHoveredId(null);
        }}
        onCenterHover={(centerId) => {
          setHoveredId(centerId ? `center-${centerId}` : null);
          setRowHoveredGate(null);
        }}
        onCenterLeave={() => {
          setHoveredId(null);
        }}
        onChannelHover={(channelId) => {
          setHoveredId(channelId || null);
          setRowHoveredGate(null);
        }}
        onChannelLeave={() => {
          setHoveredId(null);
        }}
        selectedCenterGraphId={propertiesCenterGraphId}
        selectedChannelId={propertiesChannelId}
        selectedGateId={propertiesGateId}
        activationTab={propertiesActivationOverride?.tab}
        activationIcon={propertiesActivationOverride?.icon}
        onClose={() => {
          setPanelOpen(false);
          setHoveredId(null);
          setRowHoveredGate(null);
          setPropertiesNavOverride(null);
          setPropertiesCenterGraphId(null);
          setPropertiesChannelId(null);
          setPropertiesGateId(null);
          setPropertiesActivationOverride(null);
        }}
      /> : null}
    </>
  );
};

export default BodyGraphCanvas;
