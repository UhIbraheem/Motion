/**
 * Rate Limiter Utility
 * Prevents API quota exhaustion by limiting request frequency
 * Implements token bucket algorithm with request queuing
 */
class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100; // Max requests per window
    this.windowMs = options.windowMs || 60000; // Time window in ms (default: 1 minute)
    this.queueSize = options.queueSize || 50; // Max queued requests

    this.requests = []; // Timestamp log of requests
    this.queue = []; // Pending requests
    this.processing = false;
  }

  /**
   * Clean up expired requests from the log
   */
  cleanupOldRequests() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest() {
    this.cleanupOldRequests();
    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.requests.push(Date.now());
  }

  /**
   * Wait for rate limit to allow request
   * @returns {Promise<void>}
   */
  async waitForSlot() {
    this.cleanupOldRequests();

    if (this.canMakeRequest()) {
      this.recordRequest();
      return;
    }

    // Calculate wait time until oldest request expires
    const oldestRequest = this.requests[0];
    const waitTime = (oldestRequest + this.windowMs) - Date.now();

    console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);

    await new Promise(resolve => setTimeout(resolve, waitTime + 100));

    // Retry after waiting
    return this.waitForSlot();
  }

  /**
   * Execute a function with rate limiting
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>}
   */
  async execute(fn) {
    await this.waitForSlot();
    return await fn();
  }

  /**
   * Add request to queue
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>}
   */
  async enqueue(fn) {
    // Check queue size
    if (this.queue.length >= this.queueSize) {
      throw new Error('Rate limiter queue is full');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const { fn, resolve, reject } = this.queue.shift();

      try {
        await this.waitForSlot();
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 100));
    }

    this.processing = false;
  }

  /**
   * Get current rate limiter stats
   */
  getStats() {
    this.cleanupOldRequests();
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      queuedRequests: this.queue.length,
      availableSlots: this.maxRequests - this.requests.length,
      windowMs: this.windowMs
    };
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
    this.queue = [];
    this.processing = false;
    console.log('🔄 Rate limiter reset');
  }
}

/**
 * Create rate limiters for different APIs
 */
const rateLimiters = {
  // Google Places API: 100 requests/minute (conservative)
  googlePlaces: new RateLimiter({
    maxRequests: 100,
    windowMs: 60000,
    queueSize: 50
  }),

  // OpenAI API: 60 requests/minute
  openai: new RateLimiter({
    maxRequests: 60,
    windowMs: 60000,
    queueSize: 30
  }),

  // Geocoding API: 50 requests/second
  geocoding: new RateLimiter({
    maxRequests: 50,
    windowMs: 1000,
    queueSize: 100
  })
};

module.exports = {
  RateLimiter,
  rateLimiters
};
