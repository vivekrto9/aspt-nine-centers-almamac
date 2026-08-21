// Upastrology-faithful Human Design BodyGraph Vector Geometry Engine

export const HUMAN_FIGURE_PATH = `M671.25,720.333
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

export const GRAPH = {
  width: 560,
  height: 1050,
  centers: {
    Head: { x: 280, y: 65, w: 160, h: 130, type: "triangleUp", fill: "#9B7E3E" },
    Ajna: { x: 280, y: 224, w: 160, h: 130, type: "triangleDown", fill: "#4B9468" },
    Throat: { x: 280, y: 380, w: 104, h: 115, type: "rect", fill: "#9E6441" },
    G: { x: 280, y: 550, w: 150, h: 150, type: "diamond", fill: "#9B7E3E" },
    Ego: { x: 410, y: 600, w: 120, h: 100, type: "triangleUp", rotationDeg: 14, fill: "#A84C4C" },
    Spleen: { x: 80, y: 731, w: 130, h: 150, type: "triangleRight", fill: "#9E6441" },
    Sacral: { x: 280, y: 755, w: 104, h: 115, type: "rect", fill: "#A84C4C" },
    Solar: { x: 460, y: 731, w: 130, h: 150, type: "triangleLeft", fill: "#9E6441" },
    Root: { x: 280, y: 914, w: 104, h: 115, type: "rect", fill: "#9E6441" },
  },
};

export const CENTER_GATES: Record<string, number[]> = {
  Head: [64, 61, 63],
  Ajna: [47, 24, 4, 17, 11, 43],
  Throat: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45],
  G: [1, 7, 13, 10, 25, 15, 46, 2],
  Ego: [21, 51, 26, 40],
  Spleen: [48, 57, 44, 50, 32, 28, 18],
  Sacral: [5, 14, 29, 34, 27, 59, 42, 3, 9],
  Solar: [36, 22, 37, 6, 49, 55, 30],
  Root: [53, 60, 52, 54, 38, 58, 19, 39, 41],
};

export const GATE_TO_CENTER: Record<number, string> = Object.entries(CENTER_GATES).reduce(
  (acc, [centerName, gates]) => {
    gates.forEach((gate) => {
      acc[gate] = centerName;
    });
    return acc;
  },
  {} as Record<number, string>,
);

export const DEFAULT_CHANNELS: [number, number][] = [
  [64, 47], [61, 24], [63, 4],
  [17, 62], [43, 23], [11, 56],
  [31, 7], [8, 1], [33, 13], [45, 21], [16, 48], [20, 57], [35, 36], [12, 22], [10, 34],
  [25, 51], [15, 5], [2, 14], [46, 29],
  [26, 44], [40, 37], [42, 53], [3, 60], [9, 52],
  [32, 54], [28, 38], [18, 58], [55, 39], [49, 19], [30, 41], [50, 27], [6, 59],
];

const FORCED_STRAIGHT_CHANNELS = new Set([
  "1-8", "3-60", "7-31", "13-33", "17-62", "23-43", "11-56",
  "47-64", "24-61", "4-63", "2-14", "5-15", "29-46", "42-53", "9-52"
]);

const trianglePoints = (cx: number, cy: number, w: number, h: number, direction: string) => {
  if (direction === "up") {
    return [{ x: cx, y: cy - h / 2 }, { x: cx + w / 2, y: cy + h / 2 }, { x: cx - w / 2, y: cy + h / 2 }];
  }
  if (direction === "down") {
    return [{ x: cx - w / 2, y: cy - h / 2 }, { x: cx + w / 2, y: cy - h / 2 }, { x: cx, y: cy + h / 2 }];
  }
  if (direction === "right") {
    return [{ x: cx - w / 2, y: cy - h / 2 }, { x: cx - w / 2, y: cy + h / 2 }, { x: cx + w / 2, y: cy }];
  }
  return [{ x: cx + w / 2, y: cy - h / 2 }, { x: cx + w / 2, y: cy + h / 2 }, { x: cx - w / 2, y: cy }];
};

const rotatePoint = (point: { x: number; y: number }, origin: { x: number; y: number }, angleDeg = 0) => {
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

export const getCenterShapePoints = (center: any) => {
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
    rotatePoint(point, { x: center.x, y: center.y }, center.rotationDeg || 0),
  );
};

export const roundedPolygonPath = (points: { x: number; y: number }[] | null, radius = 16) => {
  if (!points || points.length < 3) return "";
  const count = points.length;
  const getPoint = (index: number) => points[(index + count) % count];
  const moveToward = (from: { x: number; y: number }, to: { x: number; y: number }, length: number) => {
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
    d += index === 0 ? `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} ` : `L ${start.x.toFixed(1)} ${start.y.toFixed(1)} `;
    d += `Q ${current.x.toFixed(1)} ${current.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)} `;
  }
  return `${d}Z`;
};

export const buildGatePositions = () => {
  const centers = GRAPH.centers as Record<string, any>;
  const positions: Record<number, { id: number; x: number; y: number; center: string }> = {};
  const setGate = (id: number, centerName: string, dx: number, dy: number) => {
    positions[id] = {
      id,
      x: centers[centerName].x + dx,
      y: centers[centerName].y + dy,
      center: centerName,
    };
  };

  // Head
  setGate(64, "Head", -30, 55);
  setGate(61, "Head", 0, 55);
  setGate(63, "Head", 30, 55);

  // Ajna
  setGate(47, "Ajna", -30, -49);
  setGate(24, "Ajna", 0, -49);
  setGate(4, "Ajna", 30, -49);
  setGate(17, "Ajna", -26, -4);
  setGate(11, "Ajna", 26, -4);
  setGate(43, "Ajna", 0, 36);

  // Throat
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

  // G
  setGate(1, "G", 0, -52);
  setGate(7, "G", -26, -28);
  setGate(13, "G", 26, -28);
  setGate(10, "G", -48, 8);
  setGate(25, "G", 48, 8);
  setGate(15, "G", -26, 30);
  setGate(46, "G", 26, 30);
  setGate(2, "G", 0, 54);

  // Ego
  setGate(21, "Ego", 6, -24);
  setGate(51, "Ego", -14, 0);
  setGate(26, "Ego", -42, 28);
  setGate(40, "Ego", 25, 45);

  // Spleen
  setGate(48, "Spleen", -50, -47);
  setGate(18, "Spleen", -50, 50);
  setGate(57, "Spleen", -22, -35);
  setGate(28, "Spleen", -22, 34);
  setGate(44, "Spleen", 8, -18);
  setGate(32, "Spleen", 8, 18);
  setGate(50, "Spleen", 35, 1);

  // Sacral
  setGate(5, "Sacral", -26, -43);
  setGate(14, "Sacral", 0, -43);
  setGate(29, "Sacral", 26, -43);
  setGate(34, "Sacral", -40, -17);
  setGate(27, "Sacral", -40, 13);
  setGate(59, "Sacral", 40, 14);
  setGate(42, "Sacral", -26, 43);
  setGate(3, "Sacral", 0, 43);
  setGate(9, "Sacral", 26, 43);

  // Solar Plexus
  setGate(36, "Solar", 52, -50);
  setGate(30, "Solar", 50, 49);
  setGate(22, "Solar", 28, -34);
  setGate(55, "Solar", 22, 36);
  setGate(37, "Solar", -8, -18);
  setGate(49, "Solar", -8, 18);
  setGate(6, "Solar", -40, 0);

  // Root
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

type GraphPoint = { x: number; y: number };

const cross = (a: GraphPoint, b: GraphPoint) => a.x * b.y - a.y * b.x;

const projectGateToCenterEdge = (
  gate: { x: number; y: number; center: string },
  center: any,
) => {
  const origin = { x: center.x, y: center.y };
  const direction = { x: gate.x - origin.x, y: gate.y - origin.y };

  if (center.type === "rect") {
    const xRatio = Math.abs(direction.x) / (center.w / 2);
    const yRatio = Math.abs(direction.y) / (center.h / 2);
    const scale = 1 / Math.max(xRatio, yRatio);
    return {
      ...gate,
      x: origin.x + direction.x * scale,
      y: origin.y + direction.y * scale,
    };
  }

  const boundary = getCenterShapePoints(center);
  if (!boundary) return gate;

  let nearest: GraphPoint | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < boundary.length; index += 1) {
    const start = boundary[index];
    const end = boundary[(index + 1) % boundary.length];
    const segment = { x: end.x - start.x, y: end.y - start.y };
    const fromOrigin = { x: start.x - origin.x, y: start.y - origin.y };
    const denominator = cross(direction, segment);
    if (Math.abs(denominator) < 0.0001) continue;
    const distance = cross(fromOrigin, segment) / denominator;
    const alongSegment = cross(fromOrigin, direction) / denominator;
    if (distance < 0 || alongSegment < 0 || alongSegment > 1 || distance >= nearestDistance) continue;
    nearestDistance = distance;
    nearest = {
      x: origin.x + direction.x * distance,
      y: origin.y + direction.y * distance,
    };
  }

  return nearest ? { ...gate, ...nearest } : gate;
};

export const buildChannelGatePositions = () => {
  const centers = GRAPH.centers as Record<string, any>;
  const gatePositions = buildGatePositions();
  return Object.fromEntries(
    Object.entries(gatePositions).map(([gate, position]) => [
      gate,
      projectGateToCenterEdge(position, centers[position.center]),
    ]),
  ) as typeof gatePositions;
};

const createGateAttachmentPath = (
  anchor: { x: number; y: number },
  label: { x: number; y: number },
  clearance: number,
) => {
  const dx = label.x - anchor.x;
  const dy = label.y - anchor.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= clearance) return "";
  const endX = label.x - (dx / distance) * clearance;
  const endY = label.y - (dy / distance) * clearance;
  return `M ${anchor.x.toFixed(1)} ${anchor.y.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
};

export const createPathSpec = (p1: { x: number; y: number }, p2: { x: number; y: number }, g1: number, g2: number) => {
  const pair = `${Math.min(g1, g2)}-${Math.max(g1, g2)}`;
  const dy = p2.y - p1.y;

  if (FORCED_STRAIGHT_CHANNELS.has(pair)) {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  if (pair === "10-34") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x - 300).toFixed(1)} ${(p1.y + 12).toFixed(1)}, ${(p2.x - 118).toFixed(1)} ${(p2.y - 25).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "16-48") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x - 100).toFixed(1)} ${(p1.y + dy * 0.2).toFixed(1)}, ${p2.x.toFixed(1)} ${(p2.y - dy * 0.5).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "20-57") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x - 60).toFixed(1)} ${(p1.y + dy * 0.2).toFixed(1)}, ${p2.x.toFixed(1)} ${(p2.y - dy * 0.47).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "35-36") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x + 66).toFixed(1)} ${(p1.y + 2).toFixed(1)}, ${(p2.x + 16).toFixed(1)} ${(p2.y - 132).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "12-22") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x + 58).toFixed(1)} ${(p1.y + 4).toFixed(1)}, ${(p2.x + 10).toFixed(1)} ${(p2.y - 128).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "21-45") {
    return `M ${p1.x.toFixed(1)} ${(p1.y + 5).toFixed(1)} C ${(p1.x + 22).toFixed(1)} ${(p1.y + 7).toFixed(1)}, ${(p2.x + 8).toFixed(1)} ${(p2.y - 64).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "25-51") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x + 34).toFixed(1)} ${(p1.y - 2).toFixed(1)}, ${(p2.x + 6).toFixed(1)} ${(p2.y - 18).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "27-50") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x + 14).toFixed(1)} ${(p1.y + 28).toFixed(1)}, ${(p2.x - 22).toFixed(1)} ${(p2.y - 2).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "6-59") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x - 26).toFixed(1)} ${(p1.y + 18).toFixed(1)}, ${(p2.x + 24).toFixed(1)} ${p2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  if (pair === "26-44") {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${(p1.x - 152).toFixed(1)} ${(p1.y - 10).toFixed(1)}, ${(p2.x + 22).toFixed(1)} ${(p2.y - 20).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${p1.x.toFixed(1)} ${(p1.y + dy * 0.5).toFixed(1)}, ${p2.x.toFixed(1)} ${(p2.y - dy * 0.5).toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
};

export const build = () => {
  const gatePositions = buildGatePositions();
  const channelGatePositions = buildChannelGatePositions();
  const centers = GRAPH.centers as Record<string, any>;

  // Defined in sample chart: Throat, G, Sacral, Root, Solar
  const definedCenters = new Set(["Throat", "G", "Sacral", "Root", "Solar"]);
  const activeGatesSet = new Set([
    34, 20, 2, 14, 15, 5, 12, 22, 19, 49, 3, 60, 6, 59, 61, 17, 11, 23, 31, 46, 27, 30
  ]);
  const designGatesSet = new Set([34, 20, 2, 14, 15, 5, 12, 22, 19, 49, 3, 60]);

  const shapes = Object.entries(centers).map(([name, center]) => {
    const defined = definedCenters.has(name);
    let d = "";
    if (center.type === "rect") {
      const rx = 24;
      const x = center.x - center.w / 2;
      const y = center.y - center.h / 2;
      d = `M ${x + rx} ${y} h ${center.w - 2 * rx} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${center.h - 2 * rx} a ${rx} ${rx} 0 0 1 -${rx} ${rx} h -${center.w - 2 * rx} a ${rx} ${rx} 0 0 1 -${rx} -${rx} v -${center.h - 2 * rx} a ${rx} ${rx} 0 0 1 ${rx} -${rx} Z`;
    } else {
      d = roundedPolygonPath(getCenterShapePoints(center), center.type === "diamond" ? 24 : 30);
    }
    return { name, d, defined, x: center.x, y: center.y, fill: center.fill };
  });

  const channels = DEFAULT_CHANNELS.map(([g1, g2]) => {
    const p1 = channelGatePositions[g1];
    const p2 = channelGatePositions[g2];
    const label1 = gatePositions[g1];
    const label2 = gatePositions[g2];
    const d = p1 && p2 ? createPathSpec(p1, p2, g1, g2) : "";
    const g1Active = activeGatesSet.has(g1);
    const g2Active = activeGatesSet.has(g2);
    const full = g1Active && g2Active;
    const half = (g1Active || g2Active) && !full;
    const isDesign = designGatesSet.has(g1) || designGatesSet.has(g2);

    return {
      pair: `${g1}-${g2}`,
      d,
      g1,
      g2,
      full,
      half,
      offset: g1Active ? 0 : 50,
      isDesign,
      attachments: [
        {
          gate: g1,
          d: createGateAttachmentPath(p1, label1, 9.5),
          active: g1Active,
          isDesign: designGatesSet.has(g1),
          onDefined: definedCenters.has(p1.center),
        },
        {
          gate: g2,
          d: createGateAttachmentPath(p2, label2, 9.5),
          active: g2Active,
          isDesign: designGatesSet.has(g2),
          onDefined: definedCenters.has(p2.center),
        },
      ],
    };
  });

  const gates = Object.values(gatePositions).map((pos) => {
    const act = activeGatesSet.has(pos.id);
    const isDesign = designGatesSet.has(pos.id);
    const onDefined = definedCenters.has(pos.center);
    return {
      n: pos.id,
      cx: pos.x,
      cy: pos.y,
      center: pos.center,
      act,
      isDesign,
      onDefined,
    };
  });

  return {
    viewBox: "-60 -50 680 1150",
    silhouette: [HUMAN_FIGURE_PATH],
    shapes,
    channels,
    gates,
  };
};
