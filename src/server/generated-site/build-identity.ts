// Replaced at build time; never read mutable Worker configuration for identity.
declare const __ASTROPAGES_BUILD_SHA__: string | null;
export const buildSha = typeof __ASTROPAGES_BUILD_SHA__ === "undefined"
  ? null
  : __ASTROPAGES_BUILD_SHA__;
