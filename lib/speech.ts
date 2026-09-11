import OpenAI from "openai";
import { env } from "@/lib/env";

export async function transcribeAudio(file: File) {
  if (env.OPENAI_API_KEY) {
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const result = await client.audio.transcriptions.create({
      file,
      model: env.OPENAI_STT_MODEL,
    });
    return { text: result.text, demo: false };
  }

  if (!env.GEMINI_API_KEY) {
    throw new Error("No transcription provider configured.");
  }

  // Fallback to Gemini 1.5 Flash for STT using the official new SDK
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  
  const buffer = await file.arrayBuffer();
  const base64Audio = Buffer.from(buffer).toString("base64");
  
  const result = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: "Transcribe this audio exactly as it is spoken. Return only the transcription text, nothing else. If it is silence or unintelligible, return an empty string." },
          { inlineData: { mimeType: file.type || "audio/webm", data: base64Audio } }
        ]
      }
    ]
  });
  
  const text = result.text?.trim() || "";
  return { text, demo: false };
}
