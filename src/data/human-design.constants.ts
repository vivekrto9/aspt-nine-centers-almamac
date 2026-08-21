export interface HumanDesignCentre {
  id: string;
  name: string;
  defined: boolean;
  theme: string;
  body: string;
  gates: number[];
  activeGates: number[];
}

export interface HumanDesignType {
  id: string;
  num: string;
  name: string;
  share: string;
  strategy: string;
  signature: string;
  notSelf: string;
  body: string;
}

export interface VocabularyConcept {
  num: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface ReadingOption {
  tag: string;
  title: string;
  description: string;
  meta: string;
  price: string;
  href: string;
  staggerClass: string;
}

export interface HowItRunsStep {
  step: string;
  title: string;
  body: string;
  accent: boolean;
}

export interface ClientTestimonial {
  quote: string;
  author: string;
  offsetClass?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ArticleItem {
  tag: string;
  title: string;
  href: string;
}

export interface PlanetaryActivation {
  glyph: string;
  name: string;
  design: string;
  personality: string;
}

export interface MasterclassDay {
  dayNum: number;
  title: string;
  teaser: string;
  label: string;
  sectionTitle: string;
  intro: string[];
  paras: string[];
}

export const CENTRES: HumanDesignCentre[] = [
  {
    id: "head",
    name: "Head",
    defined: false,
    theme: "Inspiration & Mental Pressure",
    body: "The pressure to think about what does not matter. When open, inspiration comes from everywhere without needing to solve all questions.",
    gates: [64, 61, 63],
    activeGates: [64, 61],
  },
  {
    id: "ajna",
    name: "Ajna",
    defined: false,
    theme: "Mind & Conceptualization",
    body: "How you process and organize information. When open, your mind is flexible and not locked into rigid belief systems.",
    gates: [47, 24, 4, 17, 11, 43],
    activeGates: [47, 43],
  },
  {
    id: "throat",
    name: "Throat",
    defined: true,
    theme: "Expression & Manifestation",
    body: "The hub of all manifestation and voice. When defined, you have a consistent and recognized way of speaking and initiating communication.",
    gates: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45],
    activeGates: [20, 8, 31, 12],
  },
  {
    id: "g-center",
    name: "G-Center",
    defined: true,
    theme: "Identity, Love & Direction",
    body: "Your internal compass and sense of purpose. When defined, you have a solid inner sense of who you are and where you are headed.",
    gates: [1, 7, 13, 10, 25, 15, 46, 2],
    activeGates: [10, 7, 13, 2],
  },
  {
    id: "heart",
    name: "Heart",
    defined: false,
    theme: "Ego & Willpower",
    body: "Self-worth and competitive drive. When open, you have nothing to prove and should never make binding willpower promises.",
    gates: [21, 51, 26, 40],
    activeGates: [21],
  },
  {
    id: "sacral",
    name: "Sacral",
    defined: true,
    theme: "Life Force & Vitality",
    body: "Sustainable workforce and creative engine. When defined, your energy responds to life in the moment with gut sounds (uh-huh / un-uh).",
    gates: [5, 14, 29, 34, 27, 59, 42, 3, 9],
    activeGates: [34, 59, 14, 5],
  },
  {
    id: "spleen",
    name: "Spleen",
    defined: false,
    theme: "Intuition & Survival",
    body: "Instinctive awareness and immune intelligence. When open, intuition requires mindfulness and holding onto what is good for you.",
    gates: [48, 57, 44, 50, 32, 28, 18],
    activeGates: [57, 28],
  },
  {
    id: "solar-plexus",
    name: "Solar Plexus",
    defined: true,
    theme: "Emotional Wave & Clarity",
    body: "The seat of emotional authority. When defined, clarity only arrives over time by waiting out your natural emotional wave.",
    gates: [36, 22, 37, 6, 49, 55, 30],
    activeGates: [55, 30, 49],
  },
  {
    id: "root",
    name: "Root",
    defined: true,
    theme: "Adrenaline & Pressure",
    body: "Physical stamina and pressure to act. When defined, you handle stress and deadlines with consistent personal pacing.",
    gates: [53, 60, 52, 54, 38, 58, 19, 39, 41],
    activeGates: [52, 38, 58, 39],
  },
];

export const TYPES: HumanDesignType[] = [
  {
    id: "manifestor",
    num: "01",
    name: "Manifestor",
    share: "9%",
    strategy: "Inform before you act.",
    signature: "Peace",
    notSelf: "Anger",
    body: "You initiate. Energy arrives in bursts, then stops — that pause is the design, not laziness. Inform whoever your actions affect before you leap.",
  },
  {
    id: "generator",
    num: "02",
    name: "Generator",
    share: "37%",
    strategy: "Wait to respond, then commit.",
    signature: "Satisfaction",
    notSelf: "Frustration",
    body: "Consistent, renewable life force energy — but only for what you genuinely respond to. When you listen to your gut 'uh-huh', frustration disappears.",
  },
  {
    id: "manifesting-generator",
    num: "03",
    name: "Manifesting Generator",
    share: "33%",
    strategy: "Respond, inform, then move.",
    signature: "Satisfaction",
    notSelf: "Frustration & Anger",
    body: "Two engines at once. You skip steps, master multiple interests in parallel, and move fast. Inform those around you so they don't get startled by your speed.",
  },
  {
    id: "projector",
    num: "04",
    name: "Projector",
    share: "20%",
    strategy: "Wait for the invitation.",
    signature: "Success",
    notSelf: "Bitterness",
    body: "Built to see clearly, guide, and direct rather than generate motor energy. Recognition and specific invitations are the mechanism. Rest is structural.",
  },
  {
    id: "reflector",
    num: "05",
    name: "Reflector",
    share: "1%",
    strategy: "Wait a lunar cycle on big decisions.",
    signature: "Surprise",
    notSelf: "Disappointment",
    body: "All nine centres open. You sample, reflect, and evaluate the health of your environment. Where you live and who you are with is everything.",
  },
];

export const VOCABULARY_CONCEPTS: VocabularyConcept[] = [
  {
    num: "Word one",
    title: "Type",
    subtitle: "Energy Flow",
    body: "How your energy moves, how you interact with the world, and the specific decision strategy that fits your wiring.",
  },
  {
    num: "Word two",
    title: "Authority",
    subtitle: "Internal Signal",
    body: "Where a reliable yes or no is registered in your body — emotional wave, gut response, or splenic instinct.",
  },
  {
    num: "Word three",
    title: "Profile",
    subtitle: "Archetypal Role",
    body: "The two numbers (like 3/5 or 4/6) describing your character, your learning style, and the role you play in groups.",
  },
  {
    num: "Word four",
    title: "Centres",
    subtitle: "Energy Hubs",
    body: "Defined centres are fixed and broadcast energy. Open centres are receptive receptors where you absorb others.",
  },
];

export const READINGS: ReadingOption[] = [
  {
    tag: "Start here",
    title: "Foundational reading",
    description: "Your whole chart once through: type, authority, profile, centres and prime channels explained in plain English.",
    meta: "75 min · recorded · pay once",
    price: "$165",
    href: "#chart",
    staggerClass: "stagger-1",
  },
  {
    tag: "Two charts",
    title: "Composite reading",
    description: "How two charts combine, where electromagnetic attraction sparks, and where relationship friction is structural.",
    meta: "90 min · two people · pay once",
    price: "$240",
    href: "#chart",
    staggerClass: "stagger-2",
  },
  {
    tag: "Ongoing",
    title: "Deconditioning series",
    description: "Three months of guided testing of your strategy on real career, financial, and personal decisions.",
    meta: "4 × 60 min · one payment",
    price: "$540",
    href: "#chart",
    staggerClass: "stagger-3",
  },
];

export const HOW_IT_RUNS: HowItRunsStep[] = [
  {
    step: "One",
    title: "Send your birth data",
    body: "Exact date, time down to the minute, and birth city.",
    accent: true,
  },
  {
    step: "Two",
    title: "Get your chart free",
    body: "Interactive bodygraph and a concise summary within a day.",
    accent: false,
  },
  {
    step: "Three",
    title: "Choose a one-time reading",
    body: "Pay once for the option you choose — no subscription or recurring charges.",
    accent: false,
  },
  {
    step: "Four",
    title: "Keep the recording",
    body: "High-definition video, chart assets, and 30-day email follow-up.",
    accent: false,
  },
];

export const TESTIMONIALS: ClientTestimonial[] = [
  {
    quote: "I had read three books and still could not say what my chart meant on a Tuesday. One session fixed that.",
    author: "Priya · Generator 4/6",
  },
  {
    quote: "Informing people before I start things has done more for my team than any management course.",
    author: "Daniel · Manifestor 1/3",
  },
  {
    quote: "Being told that resting was structural, not lazy, was worth the price on its own.",
    author: "Marta · Projector 5/1",
  },
];

export const FAQS: FaqItem[] = [
  {
    question: "Is this a subscription?",
    answer: "No. Each reading or series is purchased with one payment. There are no recurring charges or automatic renewals.",
  },
  {
    question: "Do I need to know Human Design already?",
    answer: "No. We start directly from your chart in plain everyday language, with zero jargon, and the complete recording stays yours.",
  },
  {
    question: "What if I do not know my exact birth time?",
    answer: "Send your best estimate. We will cast adjacent minute ranges and flag if your chart sits near any gate or type boundary.",
  },
  {
    question: "Is this astrology?",
    answer: "It uses the same birth coordinates but combines astrology, the I Ching, Kabbalah, and the Chakra system to map your decision-making mechanics rather than predicting events.",
  },
  {
    question: "How is a reading different from the free chart?",
    answer: "The free chart gives you the raw geometric diagram. A personalized reading translates the channels, gates, and conditioning into actionable clarity for your work and relationships.",
  },
  {
    question: "Can we read two charts together?",
    answer: "Yes — the Composite Reading overlays two charts to reveal electromagnetic chemistry, dominance channels, and compromise points.",
  },
];

export const ARTICLES: ArticleItem[] = [
  {
    tag: "Centres · 6 min",
    title: "Open centres are not weaknesses",
    href: "#",
  },
  {
    tag: "Authority · 8 min",
    title: "How to test your gut yes for a week",
    href: "#",
  },
  {
    tag: "Basics · 5 min",
    title: "Why birth time changes your chart",
    href: "#",
  },
];

export const ACTIVATIONS: PlanetaryActivation[] = [
  { glyph: "☉", name: "Sun", design: "55.5", personality: "20.2" },
  { glyph: "⊕", name: "Earth", design: "59.5", personality: "34.2" },
  { glyph: "☽", name: "Moon", design: "30.1", personality: "20.2" },
  { glyph: "☊", name: "North Node", design: "39.6", personality: "52.3" },
  { glyph: "☋", name: "South Node", design: "38.6", personality: "58.3" },
  { glyph: "☿", name: "Mercury", design: "13.3", personality: "12.2" },
  { glyph: "♀", name: "Venus", design: "21.5", personality: "51.3" },
  { glyph: "♂", name: "Mars", design: "34.5", personality: "11.6" },
  { glyph: "♃", name: "Jupiter", design: "20.3", personality: "45.2" },
  { glyph: "♄", name: "Saturn", design: "8.1", personality: "20.5" },
  { glyph: "♅", name: "Uranus", design: "49.3", personality: "30.1" },
  { glyph: "♆", name: "Neptune", design: "41.6", personality: "19.2" },
  { glyph: "♇", name: "Pluto", design: "58.4", personality: "26.1" },
];

export const SAMPLE_RESULT = {
  heading: "You are a Generator 3/5.",
  birthLine: "Calculated for 14 Mar 1994 · 06:42 · Jaipur, India",
  keys: [
    { label: "Type", value: "Generator" },
    { label: "Strategy", value: "Respond" },
    { label: "Authority", value: "Emotional" },
    { label: "Profile", value: "3/5 Martyr Heretic" },
    { label: "Definition", value: "Single" },
    { label: "Incarnation cross", value: "Cross of Tension" },
  ],
  notes: [
    {
      title: "Your clarity arrives over time",
      body: "Emotional authority. The reliable answer shows up across the emotional wave, not inside a temporary high or low.",
    },
    {
      title: "Four centres are open",
      body: "Head, Ajna, Heart, and Spleen. Pressure to know for certain and prove your worth is usually borrowed from the room.",
    },
    {
      title: "Trial and error is the method",
      body: "A 3-line profile learns by bumping into things and experimenting. Nothing that didn't work was wasted experience.",
    },
  ],
};

export { LEARN, BEGINNER, ENERGY_ROWS, ENERGY_TYPE } from "./bodygraph-model.ts";
