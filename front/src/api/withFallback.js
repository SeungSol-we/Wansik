// Wraps a real API call so the UI still renders during local development
// when the FastAPI backend isn't running yet. The real request is always
// attempted first; the fixture is only used if it actually fails.
export function withFallback(apiCallPromise, fallbackData) {
  return apiCallPromise.catch((error) => {
    console.warn('[api] falling back to local fixture:', error?.message || error);
    return fallbackData;
  });
}