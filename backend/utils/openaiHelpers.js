/**
 * OpenAI Helper Utilities
 * Token counting, cost estimation, and prompt caching
 */

const { encoding_for_model } = require('tiktoken');

/**
 * Count tokens for text using tiktoken
 * @param {string} text - Text to count
 * @param {string} model - Model name (default: gpt-4o)
 * @returns {number} - Token count
 */
function countTokens(text, model = 'gpt-4o') {
  try {
    // For gpt-4o, use cl100k_base encoding
    const encoding = encoding_for_model('gpt-4-0125-preview'); // Closest available
    const tokens = encoding.encode(text);
    encoding.free();
    return tokens.length;
  } catch (error) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

/**
 * Count tokens for messages array
 * @param {Array} messages - OpenAI messages array
 * @param {string} model - Model name
 * @returns {number} - Total token count
 */
function countMessagesTokens(messages, model = 'gpt-4o') {
  let totalTokens = 0;

  for (const message of messages) {
    // Add tokens for role and content
    totalTokens += countTokens(message.role, model);
    totalTokens += countTokens(message.content, model);

    // Add overhead per message (role wrapping, etc.)
    totalTokens += 4; // Rough estimate for message formatting
  }

  // Add overhead for entire message block
  totalTokens += 3;

  return totalTokens;
}

/**
 * Estimate cost for API call
 * @param {number} promptTokens - Input tokens
 * @param {number} completionTokens - Output tokens
 * @param {string} model - Model name
 * @returns {object} - Cost breakdown
 */
function estimateCost(promptTokens, completionTokens, model = 'gpt-4o') {
  // Pricing as of 2025 (per 1M tokens)
  const pricing = {
    'gpt-4o': {
      input: 2.50,        // $2.50 per 1M tokens
      output: 10.00,      // $10.00 per 1M tokens
      cached: 1.25        // $1.25 per 1M tokens (50% discount for cached)
    },
    'gpt-4o-mini': {
      input: 0.150,       // $0.15 per 1M tokens
      output: 0.600,      // $0.60 per 1M tokens
      cached: 0.075       // $0.075 per 1M tokens
    },
    'gpt-4-0125-preview': {
      input: 10.00,       // $10.00 per 1M tokens
      output: 30.00,      // $30.00 per 1M tokens
      cached: 5.00        // $5.00 per 1M tokens
    }
  };

  const modelPricing = pricing[model] || pricing['gpt-4o'];

  const inputCost = (promptTokens / 1000000) * modelPricing.input;
  const outputCost = (completionTokens / 1000000) * modelPricing.output;
  const totalCost = inputCost + outputCost;

  // Calculate potential savings with prompt caching
  const cachedInputCost = (promptTokens / 1000000) * modelPricing.cached;
  const cacheSavings = inputCost - cachedInputCost;

  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    inputCost: parseFloat(inputCost.toFixed(4)),
    outputCost: parseFloat(outputCost.toFixed(4)),
    totalCost: parseFloat(totalCost.toFixed(4)),
    cachedInputCost: parseFloat(cachedInputCost.toFixed(4)),
    cacheSavings: parseFloat(cacheSavings.toFixed(4)),
    savingsPercentage: Math.round((cacheSavings / inputCost) * 100)
  };
}

/**
 * Create optimized system prompt with caching markers
 * OpenAI caches prompts that are >1024 tokens and repeated
 * @param {string} basePrompt - Base system prompt
 * @param {object} options - Additional options
 * @returns {string} - Optimized prompt
 */
function createCachableSystemPrompt(basePrompt, options = {}) {
  const { radius, budget, includeOpenTable = true } = options;

  // Put static rules first (these get cached)
  const staticRules = `You are an AI concierge planning adventures. Create detailed, personalized adventure plans with ONLY real, currently operating businesses and locations.

🚨 CRITICAL BUSINESS VERIFICATION RULES 🚨:
ONLY suggest businesses that:
1. Are CURRENTLY OPEN and OPERATIONAL (not temporarily closed, not permanently closed, not "opening soon")
2. Have been in operation for at least 6 months
3. Are well-established with verified Google listings
4. Have recent reviews (within last 3 months)
5. Are NOT fictional, speculative, or made-up

STRICTLY FORBIDDEN:
❌ Do NOT suggest businesses that recently closed
❌ Do NOT suggest businesses with "temporarily closed" status
❌ Do NOT suggest businesses that are "opening soon"
❌ Do NOT make up business names that sound plausible but don't exist
❌ Do NOT suggest businesses you're uncertain about - ONLY suggest businesses you KNOW exist
❌ If you're unsure if a business is still open, DO NOT include it

CORE OPERATIONAL RULES:
- Use realistic time windows (e.g., 14:30, 16:00) matching actual business hours
- Ensure the plan flows smoothly between locations (minimize backtracking)
- All recommendations MUST be REAL businesses/locations that are CURRENTLY OPERATIONAL
- Verify business names are exact and currently in use
- Make sure all filters are coherent with each other
- Be diverse with locations and always explore new combinations
- URLs must NOT have semicolons after them - use proper JSON format
${includeOpenTable ? '- When suggesting restaurants/cafés: prioritize OpenTable listings with reservation links' : ''}

CRITICAL BUSINESS NAME REQUIREMENTS:
- ALWAYS include the EXACT, CURRENT business name in the "business_name" field
- Use the official business name as it appears on Google Maps TODAY
- For restaurants: use the exact restaurant name (e.g., "Joe's Pizza", "Le Bernardin")
- For attractions: use the official name (e.g., "Empire State Building", "Brooklyn Bridge")
- For parks/outdoor spaces: use the official park name (e.g., "Central Park", "Prospect Park")
- Business names MUST be searchable and verifiable in Google Places API
- If you cannot verify a business is currently open, DO NOT include it
- When suggesting a business, you MUST be 100% confident it exists and is operational

ACCURACY OVER CREATIVITY:
- It is BETTER to suggest fewer, verified businesses than to include uncertain ones
- If you're unsure about a business, replace it with a well-known, established alternative
- Quality and accuracy trump novelty - suggest tried-and-true businesses if uncertain`;

  // Put dynamic variables after (these change per request)
  const dynamicConstraints = `

DYNAMIC CONSTRAINTS FOR THIS REQUEST:
- Keep all locations within ${radius || 10} miles of each other and of the user's starting point
${budget ? `- Budget tier: ${budget}
  - $ (Budget): Total cost should be $25-50 per person, display as "$"
  - $$ (Premium): Total cost should be $50-100 per person, display as "$$"
  - $$$ (Luxury): Total cost should be $75+ per person, display as "$$$"
  Use the budget symbol (e.g., "$$") as the estimatedCost, NOT dollar ranges like "$140-200".` : '- Consider moderate budget when no specific budget provided'}`;

  return staticRules + dynamicConstraints;
}

/**
 * Track API usage and costs
 */
class UsageTracker {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Log an API call
   * @param {string} sessionId - Session identifier
   * @param {object} usage - Usage data from OpenAI
   * @param {string} model - Model used
   */
  logUsage(sessionId, usage, model) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        calls: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
        models: {}
      });
    }

    const session = this.sessions.get(sessionId);
    session.calls++;
    session.totalPromptTokens += usage.prompt_tokens || 0;
    session.totalCompletionTokens += usage.completion_tokens || 0;

    // Track per-model usage
    if (!session.models[model]) {
      session.models[model] = {
        calls: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0
      };
    }

    session.models[model].calls++;
    session.models[model].promptTokens += usage.prompt_tokens || 0;
    session.models[model].completionTokens += usage.completion_tokens || 0;

    // Calculate cost
    const cost = estimateCost(
      usage.prompt_tokens || 0,
      usage.completion_tokens || 0,
      model
    );

    session.models[model].cost += cost.totalCost;
    session.totalCost += cost.totalCost;
  }

  /**
   * Get usage stats for a session
   * @param {string} sessionId - Session identifier
   * @returns {object|null} - Usage stats
   */
  getSessionStats(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all usage stats
   * @returns {object} - All usage stats
   */
  getAllStats() {
    const stats = {
      totalSessions: this.sessions.size,
      totalCalls: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalCost: 0,
      byModel: {}
    };

    for (const session of this.sessions.values()) {
      stats.totalCalls += session.calls;
      stats.totalPromptTokens += session.totalPromptTokens;
      stats.totalCompletionTokens += session.totalCompletionTokens;
      stats.totalCost += session.totalCost;

      // Aggregate by model
      for (const [model, usage] of Object.entries(session.models)) {
        if (!stats.byModel[model]) {
          stats.byModel[model] = {
            calls: 0,
            promptTokens: 0,
            completionTokens: 0,
            cost: 0
          };
        }

        stats.byModel[model].calls += usage.calls;
        stats.byModel[model].promptTokens += usage.promptTokens;
        stats.byModel[model].completionTokens += usage.completionTokens;
        stats.byModel[model].cost += usage.cost;
      }
    }

    return stats;
  }

  /**
   * Clear old sessions (keep last 100)
   */
  cleanup() {
    if (this.sessions.size > 100) {
      const entries = Array.from(this.sessions.entries());
      const toKeep = entries.slice(-100);
      this.sessions = new Map(toKeep);
    }
  }
}

// Global usage tracker instance
const usageTracker = new UsageTracker();

// Cleanup every hour
setInterval(() => {
  usageTracker.cleanup();
}, 60 * 60 * 1000);

module.exports = {
  countTokens,
  countMessagesTokens,
  estimateCost,
  createCachableSystemPrompt,
  UsageTracker,
  usageTracker
};
