import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' } 
    });
    console.log("Generating token...");
    const token = await ai.authTokens.create({} as any);
    console.log("Returned token object:", typeof token, token);
    console.log("Token value:", token);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
