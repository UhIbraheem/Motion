const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const { extractFirstJsonBlock } = require("../utils/jsonExtractor");
const GooglePlacesService = require("../services/GooglePlacesService");
const GeocodingService = require("../services/GeocodingService");
const { rateLimiters } = require("../utils/rateLimiter");
const {
  countMessagesTokens,
  estimateCost,
  createCachableSystemPrompt,
  usageTracker
} = require("../utils/openaiHelpers");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googlePlaces = require("../services/GooglePlacesService");
const geocoding = GeocodingService;

// Endpoint to get Google Places data for frontend
router.post("/google-places", async (req, res) => {
  try {
    const { businessName, location } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: "Business name is required" });
    }

    console.log(`🔍 Frontend request: Looking up "${businessName}" in "${location}"`);

    // Geocode the location to get coordinates
    const coords = await geocoding.geocode(location || 'San Francisco, CA');

    const places = await googlePlaces.textSearch({
      textQuery: businessName,
      biasCenter: { latitude: coords.latitude, longitude: coords.longitude },
      biasRadiusMeters: 10000,
      pageSize: 1
    });

    if (places && places.length > 0) {
      const place = places[0];
      
      // Get photo URL if available
      let photoUrl = null;
      if (place.photos && place.photos.length > 0) {
        try {
          const photoUri = await googlePlaces.getPhotoUri(place.photos[0].name, 400);
          photoUrl = photoUri;
        } catch (photoError) {
          console.error("📷 Photo fetch error:", photoError);
        }
      }

      const placeData = {
        place_id: place.id || '',
        name: place.displayName?.text || place.displayName || '',
        address: place.formattedAddress || '',
        rating: place.rating || 0,
        user_rating_count: place.userRatingCount || 0,
        price_level: place.priceLevel || 0,
        types: place.types || [],
        photo_url: photoUrl,
        opening_hours: place.regularOpeningHours || null,
        website: place.websiteUri || '',
        phone: place.nationalPhoneNumber || '',
        google_maps_uri: place.googleMapsUri || '',
        last_updated: new Date().toISOString()
      };

      res.json({ success: true, place: placeData });
    } else {
      res.json({ success: false, message: "No places found" });
    }
  } catch (error) {
    console.error("❌ Google Places API error:", error);
    res.status(500).json({ error: "Failed to fetch place data" });
  }
});

// Helper function to enhance adventure with Google Places data
async function enhanceAdventureWithGooglePlaces(adventure, location) {
  console.log("🔍 Enhancing adventure with Google Places data...");
  
  if (!adventure.steps || !Array.isArray(adventure.steps)) {
    return adventure;
  }

  const enhancedSteps = await Promise.all(
    adventure.steps.map(async (step, index) => {
      try {
        if (!step.business_name) {
          console.log(`⚠️ Step ${index + 1}: No business name, skipping Google Places lookup`);
          return step;
        }

        console.log(`🔍 Looking up: "${step.business_name}" near "${step.location || location}"`);

        // Search for the business
        const searchQuery = step.business_name;
        const biasLocation = step.location || location;

        // Geocode the location to get coordinates
        const coords = await geocoding.geocode(biasLocation);

        const places = await googlePlaces.textSearch({
          textQuery: searchQuery,
          biasCenter: { latitude: coords.latitude, longitude: coords.longitude },
          biasRadiusMeters: 10000, // 10km radius
          pageSize: 1
        });

        if (places && places.length > 0) {
          const place = places[0];
          console.log(`✅ Found place: ${place.displayName} (Rating: ${place.rating || 'N/A'})`);
          
          // Get photo URL if available
          let photoUrl = null;
          if (place.photos && place.photos.length > 0) {
            try {
              photoUrl = await googlePlaces.getPhotoUri(place.photos[0].name, 400);
              console.log(`📸 Photo URL retrieved for ${place.displayName}`);
            } catch (photoError) {
              console.log(`⚠️ Failed to get photo URL: ${photoError.message}`);
            }
          }
          
          return {
            ...step,
            google_place_id: place.id,
            google_rating: place.rating,
            google_price_level: place.priceLevel,
            google_address: place.formattedAddress,
            google_phone: place.nationalPhoneNumber,
            google_website: place.websiteUri,
            google_maps_uri: place.googleMapsUri,
            google_photo_reference: place.photos && place.photos.length > 0 ? place.photos[0].name : null,
            google_photo_url: photoUrl,
            google_places: {
              place_id: place.id || '',
              name: place.displayName?.text || place.displayName || '',
              formatted_address: place.formattedAddress || '',
              rating: place.rating || 0,
              user_ratings_total: place.userRatingCount || 0,
              price_level: place.priceLevel || 0,
              google_maps_uri: place.googleMapsUri || '',
              website_uri: place.websiteUri || '',
              national_phone_number: place.nationalPhoneNumber || '',
              opening_hours: place.regularOpeningHours || null,
              photo_url: photoUrl,
              last_updated: new Date().toISOString()
            },
            validated: true
          };
        } else {
          console.log(`❌ No place found for: ${step.business_name}`);
          return {
            ...step,
            validated: false
          };
        }
      } catch (error) {
        console.error(`❌ Error looking up ${step.business_name}:`, error.message);
        return {
          ...step,
          validated: false
        };
      }
    })
  );

  return {
    ...adventure,
    steps: enhancedSteps,
    google_places_enhanced: true
  };
}

// Adventure Plan Schema for Structured Outputs
const adventureSchema = {
  name: "AdventurePlan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { 
        type: "string",
        description: "Adventure name based on the experience" 
      },
      description: { 
        type: "string",
        description: "Brief description of the adventure" 
      },
      estimatedDuration: { 
        type: "string",
        description: "Estimated duration (e.g., '4 hours', '6 hours')" 
      },
      estimatedCost: { 
        type: "string",
        description: "Budget tier symbol: '$' (budget), '$$' (premium), or '$$$' (luxury) - NOT dollar amounts" 
      },
      steps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            time: { 
              type: "string",
              description: "Time in HH:MM format (24-hour)" 
            },
            title: { 
              type: "string",
              description: "Activity name" 
            },
            location: { 
              type: "string",
              description: "Specific address/location" 
            },
            business_name: { 
              type: "string",
              description: "Exact business/venue name" 
            },
            notes: { 
              type: "string",
              description: "Details and tips" 
            },
            booking: {
              type: "object",
              additionalProperties: false,
              properties: {
                method: { 
                  type: "string",
                  description: "How to book/access" 
                },
                link: { 
                  type: "string",
                  description: "Website URL if applicable" 
                },
                fallback: { 
                  type: "string",
                  description: "Alternative if booking fails" 
                }
              },
              required: ["method", "link", "fallback"]
            }
          },
          required: ["time", "title", "location"]
        }
      }
    },
    required: ["title", "description", "estimatedDuration", "estimatedCost", "steps"]
  },
  strict: true
};

// Test route to verify API is working
router.get("/test", (req, res) => {
  res.json({
    message: "AI routes working! 🤖",
    timestamp: new Date().toISOString()
  });
});

// Get usage statistics
router.get("/usage-stats/:sessionId?", (req, res) => {
  try {
    const { sessionId } = req.params;

    if (sessionId) {
      // Get specific session stats
      const stats = usageTracker.getSessionStats(sessionId);

      if (!stats) {
        return res.status(404).json({ error: "Session not found" });
      }

      return res.json({
        sessionId,
        stats
      });
    } else {
      // Get all stats
      const allStats = usageTracker.getAllStats();
      return res.json(allStats);
    }
  } catch (error) {
    console.error("💥 Error fetching usage stats:", error);
    res.status(500).json({
      error: "Failed to fetch usage stats",
      details: error.message
    });
  }
});

// Generate adventure plan
router.post("/generate-plan", async (req, res) => {
  try {
    const { app_filter, radius, userId } = req.body;
    const sessionId = userId || `session_${Date.now()}`;

    console.log("📝 Received request:", { app_filter, radius, sessionId });

    // Create optimized cachable system prompt
    const systemPrompt = createCachableSystemPrompt(null, {
      radius: radius || 10,
      budget: app_filter?.budget,
      includeOpenTable: true
    });

    // Enhanced user prompt with diversity instructions
    const diversityHints = [
      'Explore hidden gems and lesser-known spots',
      'Mix popular attractions with local favorites',
      'Include diverse experiences across different neighborhoods',
      'Suggest unique, memorable activities',
      'Avoid repeating the same type of venue twice'
    ];

    const randomHint = diversityHints[Math.floor(Math.random() * diversityHints.length)];

    const userPrompt = `Create an adventure plan based on these filters: ${JSON.stringify(app_filter)}

DIVERSITY INSTRUCTION: ${randomHint}

Make this adventure unique and engaging!`;

    console.log("🤖 Sending to OpenAI with Structured Outputs...");

    // Estimate token count before API call
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const estimatedTokens = countMessagesTokens(messages);
    console.log(`📊 Estimated input tokens: ${estimatedTokens}`);

    try {
      // PRIMARY: Use Structured Outputs for guaranteed JSON
      console.log("🤖 Attempting Structured Outputs with gpt-4o...");

      // Wrap in rate limiter
      const completion = await rateLimiters.openai.execute(async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: adventureSchema
          },
          temperature: 0.3,
          // Enable prompt caching (automatically done by OpenAI for prompts >1024 tokens)
        });
      });

      // Log usage and cost
      if (completion.usage) {
        const cost = estimateCost(
          completion.usage.prompt_tokens,
          completion.usage.completion_tokens,
          'gpt-4o'
        );

        console.log(`💰 Cost: $${cost.totalCost} (${cost.promptTokens} in + ${cost.completionTokens} out)`);
        console.log(`💾 Potential savings with caching: $${cost.cacheSavings} (${cost.savingsPercentage}%)`);

        // Track usage
        usageTracker.logUsage(sessionId, completion.usage, 'gpt-4o');
      }

      const rawContent = completion.choices[0].message.content;
      console.log("✅ Received structured output from OpenAI");

      try {
        const parsed = JSON.parse(rawContent);
        console.log("✅ Successfully parsed structured JSON:", parsed.title);
        console.log("📊 Adventure has", parsed?.steps?.length || 0, "steps");

        // Validate step quality
        if (!parsed.steps || parsed.steps.length === 0) {
          throw new Error("No steps generated in adventure");
        }

        // Enhance with Google Places data
        const enhancedAdventure = await enhanceAdventureWithGooglePlaces(parsed, app_filter?.location || 'San Francisco, CA');
        console.log("🎯 Enhanced adventure with Google Places data");

        // Add cost metadata to response
        if (completion.usage) {
          const cost = estimateCost(
            completion.usage.prompt_tokens,
            completion.usage.completion_tokens,
            'gpt-4o'
          );

          enhancedAdventure._meta = {
            tokenUsage: completion.usage,
            cost: cost,
            model: 'gpt-4o',
            timestamp: new Date().toISOString()
          };
        }

        return res.json(enhancedAdventure);
      } catch (parseError) {
        console.log("⚠️ Structured output parse failed, trying fallback extractor...");

        // FALLBACK: Use robust JSON extraction
        const extractedJson = extractFirstJsonBlock(rawContent);
        if (extractedJson) {
          const fallbackParsed = JSON.parse(extractedJson);
          console.log("✅ Fallback extraction successful:", fallbackParsed.title);

          // Enhance with Google Places data
          const enhancedFallback = await enhanceAdventureWithGooglePlaces(fallbackParsed, app_filter?.location || 'San Francisco, CA');
          console.log("🎯 Enhanced fallback adventure with Google Places data");

          return res.json(enhancedFallback);
        } else {
          throw new Error("No valid JSON found in response");
        }
      }

    } catch (structuredError) {
      console.log("⚠️ Structured outputs failed:", structuredError.message);
      console.log("🔧 Error details:", structuredError.error?.message || "No additional details");
      console.log("🔄 Falling back to legacy method...");
      
      // LEGACY FALLBACK: Original approach with extraction
      const legacyCompletion = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content: "CRITICAL: You MUST respond with ONLY a JSON object. NO other text whatsoever. Start with { and end with }. NO explanations, NO markdown, NO semicolons, NO text before or after the JSON."
          },
          {
            role: "user", 
            content: `${systemPrompt}

${userPrompt}

RESPOND WITH VALID JSON IN THIS EXACT FORMAT:
{
  "title": "Adventure name",
  "description": "Brief description", 
  "estimatedDuration": "X hours",
  "estimatedCost": "$$",
  "steps": [
    {
      "time": "14:00",
      "title": "Activity name",
      "location": "Specific address/location",
      "business_name": "Exact business/venue name",
      "notes": "Details and tips",
      "booking": {
        "method": "How to book",
        "link": "https://example.com",
        "fallback": "alternative if booking fails"
      }
    }
  ]
}

CRITICAL: START WITH { - END WITH } - NO OTHER TEXT`
          }
        ],
        temperature: 0.3,
      });

      const raw = legacyCompletion.choices[0].message.content;
      console.log("📤 Legacy response received, extracting JSON...");
      
      // Use robust fallback extraction
      const extractedJson = extractFirstJsonBlock(raw);
      if (extractedJson) {
        const parsed = JSON.parse(extractedJson);
        console.log("✅ Legacy extraction successful:", parsed.title);
        console.log("📊 Adventure has", parsed?.steps?.length || 0, "steps");
        
        // Enhance with Google Places data
        const enhancedLegacy = await enhanceAdventureWithGooglePlaces(parsed, app_filter?.location || 'San Francisco, CA');
        console.log("🎯 Enhanced legacy adventure with Google Places data");
        
        return res.json(enhancedLegacy);
      } else {
        console.log("❌ All extraction methods failed");
        
        // Return a fallback response instead of error
        const fallbackPlan = {
          title: "Adventure Planning Unavailable",
          description: "We're experiencing technical difficulties with adventure generation. Please try again in a moment.",
          estimatedDuration: "N/A",
          estimatedCost: "N/A",
          steps: [
            {
              time: "12:00",
              title: "Try Again Later",
              location: "Please refresh and try your request again",
              business_name: "Motion Support",
              notes: "Our AI is temporarily having trouble generating adventures. This usually resolves quickly.",
              booking: {
                method: "Refresh page",
                link: "",
                fallback: "Contact support if this persists"
              }
            }
          ]
        };
        
        return res.json(fallbackPlan);
      }
    }

  } catch (error) {
    console.error("💥 OpenAI error:", error);
    res.status(500).json({ 
      error: "Failed to generate plan",
      details: error.message
    });
  }
});

// Regenerate a specific step
router.post("/regenerate-step", async (req, res) => {
  try {
    const { stepIndex, currentStep, allSteps, userRequest, originalFilters, radius } = req.body;

    console.log(`🔄 Regenerating step ${stepIndex}:`, userRequest);

    const prompt = `
You are helping modify one specific step in an adventure plan. The user wants to change something about step ${stepIndex + 1}.

CURRENT STEP ${stepIndex + 1}:
Time: ${currentStep.time}
Title: ${currentStep.title}
Location: ${currentStep.location}
Notes: ${currentStep.notes || 'None'}

USER REQUEST: "${userRequest}"

OTHER STEPS IN THE PLAN:
${allSteps.map((step, i) => `${i + 1}. ${step.time} - ${step.title} at ${step.location}`).join('\n')}

ORIGINAL FILTERS:
${originalFilters}

Create a NEW version of step ${stepIndex + 1} that addresses the user's request while:
- Maintaining logical flow with other steps
- Staying within ${radius} miles of other locations
- Following the same time format
- Including booking info when relevant

Respond ONLY with this JSON format:
{
  "newStep": {
    "time": "2:00 PM",
    "title": "New activity name",
    "location": "Full address",
    "booking": {
      "method": "OpenTable",
      "link": "https://...",
      "fallback": "Call info"
    },
    "notes": "Helpful details"
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(raw);
      console.log("✅ Step regenerated:", parsed.newStep?.title);
      res.json(parsed);
    } catch (parseError) {
      // Fallback extraction for step regeneration
      const extractedJson = extractFirstJsonBlock(raw);
      if (extractedJson) {
        const parsed = JSON.parse(extractedJson);
        res.json(parsed);
      } else {
        throw parseError;
      }
    }

  } catch (error) {
    console.error("💥 Step regeneration error:", error);
    res.status(500).json({ 
      error: "Failed to regenerate step",
      details: error.message
    });
  }
});

// Google Places details endpoint
router.get('/google-places/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    console.log(`🔍 Fetching place details for: ${placeId}`);

    const placeDetails = await googlePlaces.getPlaceDetailsById(placeId);
    
    if (!placeDetails) {
      return res.status(404).json({ error: 'Place not found' });
    }

    console.log(`✅ Place details fetched: ${placeDetails.displayName?.text || 'Unknown'} (${placeDetails.rating}⭐)`);
    
    res.json(placeDetails);
    
  } catch (error) {
    console.error("💥 Google Places details error:", error);
    res.status(500).json({ 
      error: "Failed to fetch place details",
      details: error.message
    });
  }
});

module.exports = router;
