import { GoogleGenAI } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: []
  });

  try {
    const s = await chat.sendMessageStream({ message: "Hello" });
    for await (const c of s) {
      console.log(c.text);
    }
  } catch (e) {
    console.error("Error with object:", e.message);
  }

  try {
    const s = await chat.sendMessageStream("Hello");
    for await (const c of s) {
      console.log(c.text);
    }
  } catch (e) {
    console.error("Error with string:", e.message);
  }
}
test();
