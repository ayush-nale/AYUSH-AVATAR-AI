import fetch from 'node-fetch';

async function testChat() {
  console.log("Testing Chat API...");
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        conversationId: "00000000-0000-0000-0000-000000000000", 
        message: "Hello" 
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 200));
  } catch (e) {
    console.error("Chat error:", e);
  }
}

async function testVoice() {
  console.log("\nTesting Voice Token...");
  try {
    const res = await fetch('http://localhost:3000/api/voice/token');
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Voice Token error:", e);
  }
}

testChat().then(testVoice);
