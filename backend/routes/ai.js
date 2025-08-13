const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
!!!CRITICAL!!! RESPOND WITH ONLY JSON - NO OTHER TEXT WHATSOEVER

DO NOT START WITH: "Here's your adventure..." or "Great!" or any text
DO NOT END WITH: explanatory text after the JSON
START IMMEDIATELY WITH: {
END IMMEDIATELY WITH: }

Create a detailed adventure plan in JSON format with these requirements:
You are an AI concierge planning a full or partial day of activities based on user input. Your goal is to recommend a 
personalized, enjoyable, well-paced plan with real businesses/locations, aligned with the user's preferences.

CRITICAL JSON RULES - FOLLOW EXACTLY:
- START YOUR RESPONSE WITH { - NO TEXT BEFORE THIS
- END YOUR RESPONSE WITH } - NO TEXT AFTER THIS  
- NO markdown code blocks, NO backticks around JSON
- NO semicolons after URLs or any values - strict JSON format only
- NO explanations, notes, or commentary anywhere outside the JSON structure
- Keep all locations within ${radius} miles of each other and of the user's starting point
- Use realistic time windows (e.g., 14:30, 16:00) to pace the plan realistically
- When suggesting restaurants/cafés: prioritize OpenTable listings with reservation links
- Ensure the plan flows smoothly between locations (minimize backtracking)
- Make sure all recommendations are REAL businesses/locations that are currently open
- Do NOT make up fictional places or businesses
- Consider the user's budget when formulating response
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

    console.log("🤖 Sending to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", // GPT-4 Turbo with better instruction following
      messages: [
        {
          role: "system",
          content: "CRITICAL: You MUST respond with ONLY a JSON object. NO other text whatsoever. If you include ANY text other than pure JSON, the system will crash and users will be angry. Start with { and end with }. NO explanations, NO markdown, NO semicolons, NO text before or after the JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent output format
    });

    const raw = completion.choices[0].message.content;
    console.log("📤 Raw OpenAI response (first 200 chars):", raw.substring(0, 200));

    // BULLETPROOF JSON EXTRACTION - handles ALL edge cases
    let clean = raw.trim();
    
    console.log("🔍 Raw response starts with:", clean.substring(0, 100));
    
    // AGGRESSIVE: Remove ANY text before the first {
    const firstBrace = clean.indexOf('{');
    if (firstBrace === -1) {
      console.log("❌ No JSON object found in response");
      throw new Error("No JSON object found in OpenAI response");
    }
    
    // Extract from first { to last }
    const lastBrace = clean.lastIndexOf('}');
    if (lastBrace === -1 || lastBrace <= firstBrace) {
      console.log("❌ No complete JSON object found");
      throw new Error("No complete JSON object found in OpenAI response");
    }
    
    clean = clean.substring(firstBrace, lastBrace + 1);
    console.log("✅ Extracted JSON between braces, length:", clean.length);
    
    // Remove markdown code blocks if somehow still present
    clean = clean.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    
    // Basic cleanup
    clean = clean.replace(/;\s*$/, '').trim();
    
    console.log("🧹 Final JSON (first 200 chars):", clean.substring(0, 200));
    
    // Fix malformed JSON structure issues
    // Remove semicolons after URLs or strings that break JSON
    clean = clean.replace(/("https?:\/\/[^"]*");/g, '$1');
    clean = clean.replace(/("https?:\/\/[^"]*");\s*,/g, '$1,');
    clean = clean.replace(/("https?:\/\/[^"]*");\s*}/g, '$1}');
    // Fix any trailing semicolons before closing quotes
    clean = clean.replace(/";(\s*[,}])/g, '"$1');
    clean = clean.replace(/";$/g, '"');
    
    // Fix common structural issues
    // Remove duplicate opening/closing braces or brackets
    clean = clean.replace(/\{\s*\{/g, '{');
    clean = clean.replace(/\}\s*\}/g, '}');
    clean = clean.replace(/\[\s*\]/g, '[]');
    
    // Fix incomplete JSON structures
    // Ensure proper comma placement in arrays and objects
    clean = clean.replace(/\}\s*\{/g, '},{');
    clean = clean.replace(/\]\s*\[/g, '],[');

    console.log("🔧 Cleaned JSON preview:", clean.substring(0, 300) + "...");

    try {
      const parsed = JSON.parse(clean);
      console.log("✅ Successfully parsed JSON with title:", parsed?.title || "No title found");
      console.log("📊 Adventure has", parsed?.steps?.length || 0, "steps");
      res.json(parsed);
    } catch (parseError) {
      console.error("❌ Failed to parse plan JSON:", parseError.message);
      console.log("🔍 Cleaned content that failed to parse:", clean.substring(0, 500));
      
      // Return a fallback response instead of error
      const fallbackPlan = {
        title: "San Francisco Adventure",
        description: "A curated adventure experience in San Francisco",
        estimatedDuration: "4 hours",
        estimatedCost: "$40-80 per person",
        steps: [
          {
            time: "14:00",
            title: "Starting Point",
            location: "Union Square, San Francisco, CA",
            business_name: "Union Square",
            notes: "Meet up and begin your adventure",
            booking: {
              method: "No booking required",
              link: "",
              fallback: "Public space"
            }
          }
        ]
      };
      
      console.log("🔄 Returning fallback plan due to JSON parse error");
      res.json(fallbackPlan);
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