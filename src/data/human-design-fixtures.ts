import { ACTIVATIONS, SAMPLE_RESULT } from "./human-design.constants.ts";

export type HumanDesignFixtureProfile = {
  name: string;
  email?: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
};

export const defaultHumanDesignProfile: HumanDesignFixtureProfile = {
  name: "Alex",
  birthDate: "1994-03-14",
  birthTime: "06:42",
  birthCity: "Jaipur, India",
};

export const preparedChartFixture = {
  ...SAMPLE_RESULT,
  activations: ACTIVATIONS,
  activeGates: [55, 59, 30, 39, 38, 13, 21, 34, 20, 8, 49, 41, 58, 26],
  activeChannels: [
    { name: "34–20", label: "Charisma", description: "Energy becomes action when there is something real to respond to." },
    { name: "59–6", label: "Mating", description: "A consistent capacity to dissolve barriers and create intimacy." },
    { name: "39–55", label: "Emoting", description: "Emotional depth moves through provocation, spirit, and timing." },
  ],
  centres: [
    { name: "Sacral", state: "Defined", text: "Reliable life-force energy appears in response to what is in front of you." },
    { name: "Solar Plexus", state: "Defined", text: "Clarity develops over time; avoid committing at the top or bottom of the wave." },
    { name: "Throat", state: "Defined", text: "Expression is consistent when it follows the response already moving through the body." },
    { name: "Head", state: "Open", text: "Not every question or pressure to find an answer belongs to you." },
  ],
};

const formatFixtureDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatFixtureBirthline = (profile: HumanDesignFixtureProfile) =>
  [formatFixtureDate(profile.birthDate), profile.birthTime || "Time estimated", profile.birthCity].filter(Boolean).join(" · ");
