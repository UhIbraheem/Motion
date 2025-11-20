/**
 * Retry Utility with Exponential Backoff
 * Handles transient failures for API calls with configurable retry logic
 */

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Result from successful execution
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryOn = (error) => true, // Function to determine if error is retryable
    onRetry = null // Callback on retry attempt
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!retryOn(error)) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        console.error(`❌ Max retries (${maxRetries}) exceeded`);
        throw error;
      }

      // Calculate delay with jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay; // 0-30% jitter
      const actualDelay = Math.min(delay + jitter, maxDelay);

      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(actualDelay)}ms`);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error, actualDelay);
      }

      // Wait before retrying
      await sleep(actualDelay);

      // Increase delay for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Determine if an error is retryable (network/timeout errors)
 */
function isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND') {
    return true;
  }

  // HTTP errors that are retryable
  if (error.response) {
    const status = error.response.status;
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429 || status === 408;
  }

  // Axios network errors
  if (error.message && error.message.includes('network')) {
    return true;
  }

  return false;
}

/**
 * Retry specifically for OpenAI API calls
 */
async function retryOpenAI(fn, options = {}) {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 2000,
    maxDelay: 16000,
    retryOn: (error) => {
      // Retry on rate limits, timeouts, and server errors
      if (error.status === 429) return true; // Rate limit
      if (error.status >= 500) return true; // Server errors
      if (error.code === 'ETIMEDOUT') return true;
      return false;
    },
    onRetry: (attempt, error, delay) => {
      console.log(`⚠️ OpenAI API error: ${error.message || error.status}`);
      console.log(`   Retrying in ${Math.round(delay)}ms...`);
    },
    ...options
  });
}

/**
 * Retry specifically for Google Places API calls
 */
async function retryGooglePlaces(fn, options = {}) {
  return retryWithBackoff(fn, {
    maxRetries: 2,
    initialDelay: 1000,
    maxDelay: 8000,
    retryOn: (error) => {
      const status = error.response?.status;
      // Don't retry on 400 (bad request) or 403 (forbidden)
      if (status === 400 || status === 403) return false;
      // Retry on network errors and 5xx
      return isRetryableError(error);
    },
    onRetry: (attempt, error, delay) => {
      console.log(`⚠️ Google Places API error: ${error.message}`);
    },
    ...options
  });
}

/**
 * Wrap a function with timeout
 */
async function withTimeout(fn, timeoutMs, errorMessage = 'Operation timed out') {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Circuit breaker pattern for API calls
 * Prevents cascading failures by stopping requests after repeated failures
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttempt).toLocaleTimeString()}`);
      }
      // Transition to HALF_OPEN to test if service recovered
      this.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        console.log('✅ Circuit breaker CLOSED - service recovered');
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.log(`🚨 Circuit breaker OPEN - too many failures. Will retry at ${new Date(this.nextAttempt).toLocaleTimeString()}`);
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.state === 'OPEN' ? new Date(this.nextAttempt).toISOString() : null
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    console.log('🔄 Circuit breaker reset');
  }
}

// Create circuit breakers for external services
const circuitBreakers = {
  openai: new CircuitBreaker({
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 120000 // 2 minutes
  }),
  googlePlaces: new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000 // 1 minute
  })
};

module.exports = {
  retryWithBackoff,
  retryOpenAI,
  retryGooglePlaces,
  isRetryableError,
  withTimeout,
  CircuitBreaker,
  circuitBreakers
};
