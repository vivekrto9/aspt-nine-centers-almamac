export function resolveBootstrapServiceToken(env) {
  if (["template_preview", "template_production"].includes(env.ASTROPAGES_PIPELINE_PURPOSE)) {
    // Template Workers receive this secret; the pipeline-only callback token
    // is not part of their deployed runtime secret contract.
    const token = env.BUILDER_MCP_PROVISION_SECRET;
    if (!token) throw new Error("Template content bootstrap requires BUILDER_MCP_PROVISION_SECRET.");
    return token;
  }

  const token =
    env.ASTROPAGES_CONTROL_PLANE_CALLBACK_TOKEN ||
    env.SERVICE_CALLBACK_BEARER_TOKEN ||
    env.BUILDER_MCP_PROVISION_SECRET;
  if (!token) {
    throw new Error(
      "AstroPages builder content bootstrap requires ASTROPAGES_CONTROL_PLANE_CALLBACK_TOKEN, SERVICE_CALLBACK_BEARER_TOKEN, or BUILDER_MCP_PROVISION_SECRET.",
    );
  }
  return token;
}
