// Test the Next.js API route
async function testFrontendAPI() {
  const testBody = {
    app_filter: "Location: San Francisco, CA\nDuration: 4 hours\nGroup Size: solo\nBudget: Budget ($0-30 per person)\nVibes: relaxed, cultural",
    radius: 10
  };

  try {
    console.log('🧪 Testing Next.js API route...');
    console.log('📤 Request body:', JSON.stringify(testBody, null, 2));

    const response = await fetch('http://localhost:3000/api/ai/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

testFrontendAPI();
