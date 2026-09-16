export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  const nav = navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } };
  if (!nav.gpu) {
    return false;
  }
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

