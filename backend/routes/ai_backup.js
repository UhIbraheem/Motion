const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const { extractFirstJsonBlock } = require("../utils/jsonExtractor");
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
              required: ["method"]
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

// Generate adventure plan
router.post("/generate-plan", async (req, res) => {
  try {
    const { app_filter, radius } = req.body;

    console.log("📝 Received request:", { app_filter, radius });

    const prompt = `
RESPOND WITH JSON ONLY - NO OTHER TEXT

Create a detailed adventure plan in JSON format with these requirements:
You are an AI concierge planning a full or partial day of activities based on user input. Your goal is to recommend a 
personalized, enjoyable, well-paced plan with real businesses/locations, aligned with the user's preferences.

CRITICAL JSON RULES - FOLLOW EXACTLY:
- START YOUR RESPONSE WITH { - NO TEXT BEFORE THIS
- END YOUR RESPONSE WITH } - NO TEXT AFTER THIS
- NO markdown code blocks, NO backticks around JSON
- NO semicolons after URLs or any values - strict JSON format only
- NO explanations, notes, or commentary anywhere, if there is anything you must return return it as {as_remark: ***}
- Keep all locations within ${radius} miles of each other and of the user's starting point
- Use realistic time windows (e.g., 14:30, 16:00) to pace the plan realistically
- Budget must match user's selection: Budget ($0-30 per person), Moderate ($30-70 per person), Premium ($70+ per person)
- When suggesting restaurants/cafés: prioritize OpenTable listings with reservation links
- Ensure the plan flows smoothly between locations (minimize backtracking)
- Make sure all recommendations are REAL businesses/locations that are currently open
- Do NOT make up fictional places or businesses
- Consider the user's budget when formulating response - stick to the specified budget range
- Make sure all filters are coherent with each other
- Be diverse with locations and always explore new combinations
- URLs must NOT have semicolons after them - use proper JSON format

User Filters:
${app_filter}

RETURN THIS EXACT JSON FORMAT - START WITH { AND END WITH }:
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

CRITICAL: START WITH { - END WITH } - NO OTHER TEXT`;

    console.log("🤖 Sending to OpenAI with Structured Outputs...");

    try {
      // PRIMARY: Use Structured Outputs for guaranteed JSON
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // gpt-4o-mini supports structured outputs
        messages: [
          {
            role: "system",
            content: "You are an AI concierge planning adventures. Use the provided schema to return a detailed adventure plan with real businesses and locations. Follow all user preferences and constraints."
          },
          {
            role: "user", 
            content: `${prompt}

User Filters: ${app_filter}`
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
        return res.json(parsed);
      } catch (parseError) {
        console.log("⚠️ Structured output parse failed, trying fallback extractor...");
        
        // FALLBACK: Use robust JSON extraction
        const extractedJson = extractFirstJsonBlock(rawContent);
        if (extractedJson) {
          const fallbackParsed = JSON.parse(extractedJson);
          console.log("✅ Fallback extraction successful:", fallbackParsed.title);
          return res.json(fallbackParsed);
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
            content: "CRITICAL: You MUST respond with ONLY a JSON object. NO other text whatsoever. If you include ANY text other than pure JSON, the system will crash and users will be angry. Start with { and end with }. NO explanations, NO markdown, NO semicolons, NO text before or after the JSON."
          },
          {
            role: "user", 
            content: `${prompt}

User Filters: ${app_filter}`
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
        return res.json(parsed);
      } else {
        console.log("❌ All extraction methods failed");
        throw new Error("Could not extract valid JSON from any method");
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
    "business_name": "Exact business/venue name for photos",
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
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;
    const clean = raw.replace(/```json\n?/, "").replace(/```$/, "");

    try {
      const parsed = JSON.parse(clean);
      console.log("✅ Step regenerated:", parsed.newStep.title);
      res.json(parsed);
    } catch (parseError) {
      console.error("❌ Failed to parse step JSON:", parseError);
      res.status(500).json({ 
        error: "Invalid step response format.",
        details: parseError.message
      });
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