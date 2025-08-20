/**
 * Utility function to add timeout to any promise
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 5000,
  timeoutMessage: string = 'Operation timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Utility function to add timeout to fetch requests
 */
export function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));

  return fetchPromise;
}
