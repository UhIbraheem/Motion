/**
 * Performance Monitoring Utilities
 * Tracks API response times, request counts, and performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.requests = [];
    this.maxRequests = 1000; // Keep last 1000 requests
  }

  /**
   * Start timing an operation
   * @param {string} operation - Operation name
   * @returns {Function} - End function to call when operation completes
   */
  startTimer(operation) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    return (metadata = {}) => {
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();

      this.recordMetric(operation, {
        duration,
        memoryDelta: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external
        },
        timestamp: new Date().toISOString(),
        ...metadata
      });

      return duration;
    };
  }

  /**
   * Record a metric
   */
  recordMetric(operation, data) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errors: 0,
        lastError: null,
        recentDurations: []
      });
    }

    const metric = this.metrics.get(operation);
    metric.count++;
    metric.totalDuration += data.duration;
    metric.minDuration = Math.min(metric.minDuration, data.duration);
    metric.maxDuration = Math.max(metric.maxDuration, data.duration);

    // Keep last 100 durations for percentile calculations
    metric.recentDurations.push(data.duration);
    if (metric.recentDurations.length > 100) {
      metric.recentDurations.shift();
    }

    // Track errors
    if (data.error) {
      metric.errors++;
      metric.lastError = {
        message: data.error.message,
        timestamp: data.timestamp
      };
    }

    // Add to requests log
    this.requests.push({
      operation,
      ...data
    });

    // Maintain max requests limit
    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation) {
    const metric = this.metrics.get(operation);
    if (!metric) return null;

    const avgDuration = metric.count > 0 ? metric.totalDuration / metric.count : 0;

    // Calculate percentiles
    const sorted = [...metric.recentDurations].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    return {
      operation,
      count: metric.count,
      avgDuration: Math.round(avgDuration),
      minDuration: metric.minDuration === Infinity ? 0 : metric.minDuration,
      maxDuration: metric.maxDuration,
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      errors: metric.errors,
      errorRate: metric.count > 0 ? (metric.errors / metric.count) * 100 : 0,
      lastError: metric.lastError
    };
  }

  /**
   * Get all statistics
   */
  getAllStats() {
    const stats = {};
    for (const [operation] of this.metrics) {
      stats[operation] = this.getStats(operation);
    }
    return stats;
  }

  /**
   * Get recent requests
   */
  getRecentRequests(limit = 50) {
    return this.requests.slice(-limit).reverse();
  }

  /**
   * Get slow requests (above threshold)
   */
  getSlowRequests(thresholdMs = 1000, limit = 20) {
    return this.requests
      .filter(req => req.duration > thresholdMs)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get error requests
   */
  getErrorRequests(limit = 20) {
    return this.requests
      .filter(req => req.error)
      .slice(-limit)
      .reverse();
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.requests = [];
  }

  /**
   * Get summary report
   */
  getSummary() {
    const allStats = this.getAllStats();
    const totalRequests = Object.values(allStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalErrors = Object.values(allStats).reduce((sum, stat) => sum + stat.errors, 0);

    return {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      operations: Object.keys(allStats).length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      stats: allStats
    };
  }
}

/**
 * Express middleware for automatic request tracking
 */
function createPerformanceMiddleware(monitor) {
  return (req, res, next) => {
    const endTimer = monitor.startTimer(`${req.method} ${req.path}`);

    // Track original end method
    const originalEnd = res.end;

    res.end = function(...args) {
      endTimer({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        error: res.statusCode >= 400 ? { message: `HTTP ${res.statusCode}` } : null
      });

      originalEnd.apply(res, args);
    };

    next();
  };
}

/**
 * Wrapper for async functions with automatic timing
 */
function trackPerformance(monitor, operation) {
  return (fn) => {
    return async (...args) => {
      const endTimer = monitor.startTimer(operation);

      try {
        const result = await fn(...args);
        endTimer({ success: true });
        return result;
      } catch (error) {
        endTimer({ error, success: false });
        throw error;
      }
    };
  };
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor,
  createPerformanceMiddleware,
  trackPerformance
};
