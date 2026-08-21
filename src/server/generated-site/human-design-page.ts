import { getHumanDesignReading } from "../capabilities/vendor/astropages-capabilities/human-design-api.ts";
import { normalizeHumanDesignView } from "../capabilities/vendor/astropages-capabilities/human-design-view.ts";
import { hasPaidHumanDesignReadingAccess } from "../capabilities/vendor/astropages-capabilities/human-design-orders.ts";
import type { RuntimeEnv } from "../aggregator/runtime.ts";

export const normalizeHumanDesignPageView = normalizeHumanDesignView;

export const hasPaidHumanDesignPageAccess = hasPaidHumanDesignReadingAccess;

export const loadHumanDesignPage = async ({ env, slug }: { env: RuntimeEnv; slug: string }) => {
  const reading = slug.startsWith("hd_chart_")
    ? await getHumanDesignReading({ env, readingId: slug, kind: "chart" })
    : null;
  return reading ? { reading, chartView: normalizeHumanDesignView(reading.result) } : null;
};
