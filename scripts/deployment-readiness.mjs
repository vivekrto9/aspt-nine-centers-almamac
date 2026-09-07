export function isExpectedDeployment(body, expectedSha) {
  return !expectedSha || (body?.buildSha ?? body?.data?.buildSha) === expectedSha;
}

export function isDeepReady(body) {
  return body?.ready === true && body?.bootstrap?.ready === true &&
    body?.bootstrap?.mode === "deep";
}

export function isBootstrapCurrent(deep, fast) {
  return isDeepReady(deep) && fast?.ready === true &&
    fast?.bootstrap?.ready === true && fast?.bootstrap?.mode === "fast" &&
    deep.bootstrap.registryHash === fast.bootstrap.registryHash;
}
