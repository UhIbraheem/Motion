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

    console.log("🤖 Sending to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", // GPT-4 Turbo with better instruction following
      messages: [
        {
          role: "system",
          content: "You are a strict JSON generator. CRITICAL RULES: 1) Your response must start with { and end with } 2) NO text before or after the JSON object 3) NO explanations, descriptions, or markdown 4) NO semicolons anywhere 5) If you add ANY text other than the JSON object, the system will crash. Return ONLY the JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent output format
    });

    const raw = completion.choices[0].message.content;
    console.log("📤 Raw OpenAI response length:", raw.length);

    // BULLETPROOF JSON EXTRACTION - ignores ALL surrounding text
    let clean = raw.trim();
    
    console.log("🔍 First 200 chars:", clean.substring(0, 200));
    console.log("🔍 Last 200 chars:", clean.substring(clean.length - 200));
    
    // Special handling for "To create a personalized..." responses
    if (clean.includes("To create a personalized") && clean.includes("{")) {
      const jsonStart = clean.indexOf("{");
      clean = clean.substring(jsonStart);
      console.log("✅ Removed explanatory text prefix");
    }
    
    // Method 1: Extract from ```json code block
    let jsonBlockMatch = clean.match(/```json\s*(\{[\s\S]*?\})\s*```/i);
    if (jsonBlockMatch) {
      clean = jsonBlockMatch[1];
      console.log("✅ Found JSON in markdown block");
    } else {
      // Method 2: Find the main/outermost JSON object
      const firstBrace = clean.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let jsonEnd = -1;
        
        // Start from the first brace and count to find the complete object
        for (let i = firstBrace; i < clean.length; i++) {
          if (clean[i] === '{') braceCount++;
          if (clean[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
        
        if (jsonEnd !== -1) {
          clean = clean.substring(firstBrace, jsonEnd + 1);
          console.log("✅ Extracted outermost JSON object");
        } else {
          console.log("❌ No complete JSON object found");
          throw new Error("No complete JSON object found in OpenAI response");
        }
      } else {
        console.log("❌ No JSON structure found at all");
        throw new Error("No JSON object found in OpenAI response");
      }
    }
    
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