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
You are an AI concierge planning a full or partial day of activities based on user input. Your goal is to recommend a personalized, enjoyable, well-paced plan with real businesses/locations, aligned with the user's preferences.

Rules:
- Keep all locations within ${radius} miles of each other and of the user's starting point.
- Use time windows (e.g., 1:30–2:30pm) to pace the plan realistically.
- When suggesting a restaurant or café:
    Prioritize establishments with OpenTable listings.
    Provide the OpenTable reservation link.
    If unavailable, suggest alternatives with Google Reserve links or provide contact information for booking.
- Ensure the plan flows smoothly between locations (minimize backtracking).
- Incorporate user's dietary, ethical, or vibe preferences into all choices.
- Add optional transitions like "Enjoy a short walk to…" to make it feel curated.
- Make sure all recommendations are open during time of planning

User Filters:
${app_filter}

Respond ONLY in the following JSON format (Example):
{
  "plan_title": "Cozy Afternoon in South Beach",
  "steps": [
    {
      "time": "2:00 PM",
      "title": "Lunch at Bombay Darbar",
      "location": "2901 Florida Ave, Miami, FL",
      "booking": {
        "method": "OpenTable",
        "link": "https://opentable.com/reserve-url",
        "fallback": "Call (305) 555-1234 if no availability"
      },
      "notes": "Try their vegetarian thali"
    },
    {
      "time": "3:30 PM",
      "title": "Scenic Walk at South Pointe Park",
      "location": "1 Washington Ave, Miami Beach, FL",
      "booking": null,
      "notes": "Great for photos and prayer-friendly quiet spaces"
    }
  ]
}
`;

    console.log("🤖 Sending to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;
    console.log("📤 Raw OpenAI response:", raw);

    const clean = raw.replace(/```json\n?/, "").replace(/```$/, "");

    try {
      const parsed = JSON.parse(clean);
      console.log("✅ Successfully parsed JSON:", parsed.plan_title);
      res.json(parsed);
    } catch (parseError) {
      console.error("❌ Failed to parse plan JSON:", parseError);
      console.log("🔍 Raw content that failed to parse:", clean);
      res.status(500).json({ 
        error: "Invalid AI response format.",
        details: parseError.message
      });
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
      model: "gpt-4o",
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