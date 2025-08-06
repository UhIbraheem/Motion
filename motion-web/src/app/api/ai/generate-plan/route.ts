import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { app_filter, radius } = await request.json();

    console.log("📝 Received request:", { app_filter, radius });

    const prompt = `
Create a detailed adventure plan with these requirements:

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
- Consider the user's budget when formulating your response, if premium, give a more expensive experience if budget, try to save money where you can with your suggestions. etc.
- Make sure all filters are coherant with each other, for example, if the user wants a vegan restaurant, don't suggest a steakhouse,
if multiple filters are put in place make sure not to put two restaurants after each other, instead put a placeholder/filler or activity in between.
- Be as diverse as you can with the filters and locations and always explore new combinations, an exact plan replica with the same filters should be rare.
- MAKE SURE ALL PLACES RECOMMENDED ARE REAL BUSINESSES/LOCATIONS, AND ARE NOT PERMANENTLY CLOSED OR OUT OF SERVICE DO NOT MAKE UP PLACES.

User Filters:
${app_filter}

CRITICAL TIMING REQUIREMENTS:
- MUST start at the specified start time
- MUST end by the specified end time
- Each step must have realistic timing that fits within the total duration
- Schedule activities logically (meals at meal times, etc.)
- Account for travel time between locations

Create a JSON response with:
{
  "title": "Adventure name (based on adventure)",
  "description": "Brief description,", 
  "estimatedDuration": "X hours",
  "estimatedCost": "$X range",
  "steps": [
    {
      "time": "HH:MM format (24-hour)",
      "title": "Activity name",
      "location": "Specific address/location",
      "notes": "Details and tips",
      "booking": {
        "method": "How to book/access",
        "link": "website if applicable",
        "fallback": "alternative if booking fails"
      }
    }
  ]
}

ENSURE ALL STEP TIMES ARE BETWEEN THE START AND END TIME SPECIFIED!`;

    console.log("🤖 Sending to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;
    console.log("📤 Raw OpenAI response:", raw);

    if (!raw) {
      console.error("❌ No content in OpenAI response");
      return NextResponse.json(
        { error: "No content in AI response." },
        { status: 500 }
      );
    }

    const clean = raw.replace(/```json\n?/, "").replace(/```$/, "");

    try {
      const parsed = JSON.parse(clean);
      console.log("✅ Successfully parsed JSON:", parsed.title);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("❌ Failed to parse plan JSON:", parseError);
      console.log("🔍 Raw content that failed to parse:", clean);
      return NextResponse.json(
        { error: "Invalid AI response format." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error generating adventure:", error);
    return NextResponse.json(
      { error: "Failed to generate adventure plan." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "AI routes working! 🤖",
    timestamp: new Date().toISOString()
  });
}
