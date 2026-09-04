export function isExpectedDeployment(body, expectedSha) {
  return !expectedSha || (body?.buildSha ?? body?.data?.buildSha) === expectedSha;
}

export function isDeepReady(body) {
  return body?.ready === true && body?.bootstrap?.ready === true &&
    body?.bootstrap?.mode === "deep";
}
