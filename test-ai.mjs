import { env } from 'process';
import { GoogleGenAI } from '@google/genai';

async function run() {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are an AI.',
    },
    history: [],
  });

  try {
    let resultStream = await chat.sendMessageStream({ message: "Hello" });
    for await (const chunk of resultStream) {
      console.log("Chunk:", chunk.text);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
