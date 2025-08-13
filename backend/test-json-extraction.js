// Test script for JSON extraction logic
const testResponses = [
  // Test 1: Response with explanatory prefix
  `To create a personalized adventure in Miami, I'll consider your preferences for outdoor activities, afternoon timing, and $100 budget. Here's a curated experience:

{
  "title": "Miami Beach Art & Adventure",
  "description": "A perfect afternoon exploring Miami's vibrant art scene and beautiful beaches",
  "steps": [
    {
      "order": 1,
      "title": "Visit Wynwood Walls",
      "description": "Explore world-famous street art"
    }
  ]
}`,

  // Test 2: JSON in markdown block
  `Here's your adventure:

\`\`\`json
{
  "title": "Urban Explorer",
  "description": "City adventure",
  "steps": []
}
\`\`\``,

  // Test 3: Plain JSON with trailing text
  `{
  "title": "Simple Adventure",
  "description": "Just JSON",
  "steps": []
}

This adventure should be perfect for you!`,

  // Test 4: Complex nested JSON
  `To create the perfect experience, here's what I recommend:

{
  "title": "Complex Adventure",
  "description": "Multi-step experience",
  "steps": [
    {
      "order": 1,
      "details": {
        "location": {"name": "Test", "coordinates": [1,2]},
        "timing": "afternoon"
      }
    }
  ]
}`
];

function extractJSON(raw) {
  // BULLETPROOF JSON EXTRACTION - ignores ALL surrounding text
  let clean = raw.trim();
  
  console.log("🔍 Testing response starting with:", clean.substring(0, 50) + "...");
  
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

  // Clean up the JSON
  clean = clean
    .replace(/;\s*$/, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();

  console.log("📄 Final extracted JSON:", clean.substring(0, 100) + "...");
  return JSON.parse(clean);
}

// Run tests
testResponses.forEach((response, index) => {
  console.log(`\n=== TEST ${index + 1} ===`);
  try {
    const result = extractJSON(response);
    console.log("✅ SUCCESS - Parsed title:", result.title);
  } catch (error) {
    console.log("❌ FAILED:", error.message);
  }
});
