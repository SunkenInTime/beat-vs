let fallbackCounter = 0;

export const createId = (): string => {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  fallbackCounter += 1;
  return `id-${Date.now().toString(36)}-${fallbackCounter.toString(36)}`;
};
