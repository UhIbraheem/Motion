const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const { extractFirstJsonBlock } = require("../utils/jsonExtractor");
const GooglePlacesService = require("../services/GooglePlacesService");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
        description: "Cost range (e.g., '$50-80 per person')" 
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
          required: ["time", "title", "location", "business_name", "notes"]
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

// Generate adventure plan
router.post("/generate-plan", async (req, res) => {
  try {
    const { app_filter, radius } = req.body;

    console.log("📝 Received request:", { app_filter, radius });

    const systemPrompt = `You are an AI concierge planning adventures. Create detailed, personalized adventure plans with real businesses and locations. Follow all user preferences and constraints exactly.

RULES:
- Keep all locations within ${radius} miles of each other and of the user's starting point
- Use realistic time windows (e.g., 14:30, 16:00) to pace the plan realistically
- When suggesting restaurants/cafés: prioritize OpenTable listings with reservation links
- Ensure the plan flows smoothly between locations (minimize backtracking)
- Make sure all recommendations are REAL businesses/locations that are currently open
- CRITICAL: Always provide the exact business name in the "business_name" field (e.g., "Blue Bottle Coffee", "The Met Museum", "Joe's Pizza")
- The "title" should be the activity type (e.g., "Coffee & Pastry", "Art Gallery Visit", "Lunch")
- Do NOT make up fictional places or businesses - use real establishments
- Consider the user's budget when formulating response
- Make sure all filters are coherent with each other
- Be diverse with locations and always explore new combinations
- URLs must NOT have semicolons after them - use proper JSON format`;

    const userPrompt = `Create an adventure plan based on these filters: ${app_filter}`;

    console.log("🤖 Sending to OpenAI with Structured Outputs...");

    try {
      // PRIMARY: Use Structured Outputs for guaranteed JSON
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // gpt-4o supports structured outputs (best model)
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
      });

      const rawContent = completion.choices[0].message.content;
      console.log("✅ Received structured output from OpenAI");
      
      try {
        const parsed = JSON.parse(rawContent);
        console.log("✅ Successfully parsed structured JSON:", parsed.title);
        console.log("📊 Adventure has", parsed?.steps?.length || 0, "steps");
        
        // Validate and enrich with Google Places data
        console.log("🔍 Starting Google Places validation...");
        console.log("📍 Location from frontend:", app_filter.location);
        const enrichedAdventure = await GooglePlacesService.validateAndEnrichSteps(
          parsed.steps, 
          app_filter.location || "current location"
        );
        
        // Filter to only include well-rated places (3+ stars)
        const finalAdventure = GooglePlacesService.filterByRating({
          ...parsed,
          steps: enrichedAdventure
        }, 3.0);
        
        console.log("✅ Adventure enriched with real business data");
        return res.json(finalAdventure);
      } catch (parseError) {
        console.log("⚠️ Structured output parse failed, trying fallback extractor...");
        
        // FALLBACK: Use robust JSON extraction
        const extractedJson = extractFirstJsonBlock(rawContent);
        if (extractedJson) {
          const fallbackParsed = JSON.parse(extractedJson);
          console.log("✅ Fallback extraction successful:", fallbackParsed.title);
          
          // Validate and enrich with Google Places data
          console.log("🔍 Starting Google Places validation (fallback)...");
          console.log("📍 Location from frontend:", app_filter.location);
          const enrichedAdventure = await GooglePlacesService.validateAndEnrichSteps(
            fallbackParsed.steps, 
            app_filter.location || "current location"
          );
          
          // Filter to only include well-rated places (3+ stars)
          const finalAdventure = GooglePlacesService.filterByRating({
            ...fallbackParsed,
            steps: enrichedAdventure
          }, 3.0);
          
          return res.json(finalAdventure);
        } else {
          throw new Error("No valid JSON found in response");
        }
      }

    } catch (structuredError) {
      console.log("⚠️ Structured outputs failed, falling back to legacy method...");
      
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
  "estimatedCost": "$XX-$XX per person",
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
        
        // Validate and enrich with Google Places data
        console.log("🔍 Starting Google Places validation (legacy)...");
        console.log("📍 Location from frontend:", app_filter.location);
        const enrichedAdventure = await GooglePlacesService.validateAndEnrichSteps(
          parsed.steps, 
          app_filter.location || "current location"
        );
        
        // Filter to only include well-rated places (3+ stars)
        const finalAdventure = GooglePlacesService.filterByRating({
          ...parsed,
          steps: enrichedAdventure
        }, 3.0);
        
        return res.json(finalAdventure);
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

module.exports = router;
