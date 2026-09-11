import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const ai1 = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' } 
    });
    console.log("Generating token...");
    const tokenObj = await ai1.authTokens.create({} as any);
    const tokenStr = tokenObj.name;
    console.log("Got token string:", tokenStr);

    console.log("Connecting using token...");
    const ai2 = new GoogleGenAI({ 
      apiKey: tokenStr,
      httpOptions: { apiVersion: 'v1alpha' } 
    });

    const session = await ai2.live.connect({
        model: "gemini-2.0-flash-exp",
        callbacks: { onmessage: () => {} },
        config: {
          responseModalities: ["AUDIO"] as any,
          speechConfig: {
             voiceConfig: {
                prebuiltVoiceConfig: {
                   voiceName: "Aoede"
                }
             }
          }
        }
    });
    console.log("Connected successfully!");
    session.conn.close();
  } catch (e) {
    console.error("Error connecting:", e);
  }
}
run();
