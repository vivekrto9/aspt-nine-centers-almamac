// Shared reading content + explorer SVG builder. Each page paints it in its own palette.

export const POSTS = [
  { meta: "Centres · 6 min", title: "Open centres are not weaknesses" },
  { meta: "Authority · 8 min", title: "How to test your gut yes for a week" },
  { meta: "Basics · 5 min", title: "Why birth time changes your chart" }
];

export const CTA = {
  title: "Start with the chart. Decide about the reading after.",
  body: "Free, sent within a day.",
  button: "Get your free bodygraph"
};

export const LEARN = [
  { title: "How to begin", body: "Start with the body graph in the centre. Notice which centres are coloured and which are open. Then read the two side columns — Design on the left, Personality on the right." },
  { title: "Why this chart matters", body: "It shows where your energy is consistent, where you are more open to outside influence, and how you process work, relationships and decisions." },
  { title: "The body graph", body: "Nine energy centres connected by channels. Coloured shapes are defined and consistent in you. Grey outlines are open — that is where you take your cues from the room." },
  { title: "Design and Personality", body: "Two sets of activations: Design is the body you were born with, calculated 88 days before birth. Personality is what you are conscious of." }
];

export const ENERGY_TYPE = "Generator";

export const ENERGY_ROWS = [
  { label: "Type", value: "Generator" },
  { label: "Strategy", value: "Wait to respond" },
  { label: "Authority", value: "Emotional" },
  { label: "Profile", value: "3/5 Martyr Heretic" }
];

export const BEGINNER = {
  "Body graph": {
    title: "What is Human Design?",
    paras: [
      "Human Design is a system for understanding how your energy works and how you make decisions. It draws on astrology, the I Ching, the chakra system, the Kabbalah Tree of Life and quantum physics, and it is calculated from your birth date, time and place.",
      "Open your chart and you see shapes, lines, numbers and symbols. Each one describes how you interact with the world. Some parts show where your energy is stable and reliable; others show where you are more open and influenced by the people around you.",
      "Start with three basics: your Type, your centres and your Authority. Those three explain how to make decisions and use your energy without forcing yourself into patterns that do not fit.",
      "The chart is a map. You still choose how to use it."
    ]
  },
  "Centres": {
    title: "The nine centres",
    paras: [
      "Nine energy centres sit in the body graph. Coloured shapes are defined: consistent, always working the same way in you. Grey outlines are open: they take their cues from whoever you are with.",
      "Defined centres are where you can be relied on, including by yourself. Open centres are where you are sensitive, adaptable, and most likely to mistake someone else's pressure for your own.",
      "Neither is better. Most charts are a mix, and the mix is what makes the reading personal."
    ]
  },
  "Gates": {
    title: "Gates and lines",
    paras: [
      "There are 64 gates, one for each I Ching hexagram, spread across the nine centres. A gate is activated when a planet sat in it at the moment of your birth.",
      "Each gate has six lines. The number after the decimal in your activation list is the line — 55.5 is gate 55, line 5. Lines colour how the gate expresses itself.",
      "Activated gates are the specific flavours in your chart. Two people with the same type can feel very different because of them."
    ]
  },
  "Channels": {
    title: "Channels and definition",
    paras: [
      "A channel forms when two gates at either end of it are both activated. The channel connects two centres and defines them both.",
      "Your channels are the fixed wiring in your chart: consistent themes you carry into every room.",
      "How your defined centres group together gives you your definition — single, split, triple split or quadruple split — which describes how quickly you come to clarity on your own."
    ]
  },
  "Planets": {
    title: "Design and Personality",
    paras: [
      "Two columns flank the graph. Personality is calculated at your birth moment and describes what you are conscious of. Design is calculated about 88 days earlier and describes the body you were given.",
      "Each row is a planet: Sun, Earth, Moon, the nodes, then Mercury through Pluto. The number is the gate and line it activated.",
      "The Sun and Earth rows carry the most weight — together with the same pair in Design they set your profile and incarnation cross."
    ]
  }
};

export const ACTIVATIONS = [
  { glyph: "☉", design: "55.5", personality: "20.2" },
  { glyph: "⊕", design: "59.5", personality: "34.2" },
  { glyph: "☽", design: "30.1", personality: "20.2" },
  { glyph: "☊", design: "39.6", personality: "52.3" },
  { glyph: "☋", design: "38.6", personality: "58.3" },
  { glyph: "☿", design: "13.3", personality: "12.2" },
  { glyph: "♀", design: "21.5", personality: "51.3" },
  { glyph: "♂", design: "34.5", personality: "11.6" },
  { glyph: "♃", design: "20.3", personality: "45.2" },
  { glyph: "♄", design: "8.1", personality: "20.5" },
  { glyph: "♅", design: "49.3", personality: "30.1" },
  { glyph: "♆", design: "41.6", personality: "19.2" },
  { glyph: "♇", design: "58.4", personality: "26.1" }
];
