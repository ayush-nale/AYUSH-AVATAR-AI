import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "test",
        responseMimeType: "application/json"
      }
    });
    console.log("Sending gemini-2.5-flash...");
    await chat.sendMessage({ message: "hi" });
    console.log("Success");
  } catch(e) {
    console.log("Error:", e);
  }
}
run();
