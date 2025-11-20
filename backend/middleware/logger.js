/**
 * Request/Response Logging Middleware
 * Logs all HTTP requests with timing and metadata
 */

const { performanceMonitor } = require('../utils/performanceMonitor');

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitive = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Request logger middleware
 */
function requestLogger(options = {}) {
  const {
    logBody = true,
    logResponse = false,
    excludePaths = ['/health', '/ping'],
    sanitize = true
  } = options;

  return (req, res, next) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Generate request ID
    const requestId = generateRequestId();
    req.id = requestId;

    const startTime = Date.now();
    const ip = getClientIP(req);

    // Log incoming request
    const requestLog = {
      id: requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };

    if (logBody && req.body && Object.keys(req.body).length > 0) {
      requestLog.body = sanitize ? sanitizeData(req.body) : req.body;
    }

    console.log(`📥 ${req.method} ${req.path}`, JSON.stringify(requestLog, null, 2));

    // Capture response
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody;

    res.json = function(data) {
      responseBody = data;
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      responseBody = data;
      return originalSend.call(this, data);
    };

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      const responseLog = {
        id: requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      };

      if (logResponse && responseBody) {
        try {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          responseLog.body = sanitize ? sanitizeData(parsed) : parsed;
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Color code based on status
      const statusEmoji = res.statusCode < 300 ? '✅' :
                         res.statusCode < 400 ? '⚠️' :
                         res.statusCode < 500 ? '❌' : '💥';

      console.log(`📤 ${statusEmoji} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);

      // Track in performance monitor
      performanceMonitor.recordMetric(`HTTP ${req.method} ${req.path}`, {
        duration,
        statusCode: res.statusCode,
        error: res.statusCode >= 400 ? { message: `HTTP ${res.statusCode}` } : null,
        timestamp: responseLog.timestamp
      });
    });

    next();
  };
}

/**
 * Development-only detailed logger
 */
function devLogger() {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      return next();
    }

    console.log('\n' + '='.repeat(80));
    console.log(`🔷 ${req.method} ${req.originalUrl}`);
    console.log('='.repeat(80));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('Query:', JSON.stringify(req.query, null, 2));
    }
    console.log('='.repeat(80) + '\n');

    next();
  };
}

/**
 * Slow request logger (requests taking longer than threshold)
 */
function slowRequestLogger(thresholdMs = 1000) {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > thresholdMs) {
        console.warn(`🐌 SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms (threshold: ${thresholdMs}ms)`);
        console.warn(`   Query:`, req.query);
        console.warn(`   Body:`, sanitizeData(req.body));
      }
    });

    next();
  };
}

/**
 * Create structured log entry
 */
function createLogEntry(level, message, metadata = {}) {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };
}

/**
 * Logger instance
 */
const logger = {
  info: (message, metadata) => {
    console.log('ℹ️', message, metadata ? JSON.stringify(metadata) : '');
  },
  warn: (message, metadata) => {
    console.warn('⚠️', message, metadata ? JSON.stringify(metadata) : '');
  },
  error: (message, metadata) => {
    console.error('❌', message, metadata ? JSON.stringify(metadata) : '');
  },
  debug: (message, metadata) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍', message, metadata ? JSON.stringify(metadata) : '');
    }
  },
  success: (message, metadata) => {
    console.log('✅', message, metadata ? JSON.stringify(metadata) : '');
  }
};

module.exports = {
  requestLogger,
  devLogger,
  slowRequestLogger,
  generateRequestId,
  getClientIP,
  sanitizeData,
  createLogEntry,
  logger
};
