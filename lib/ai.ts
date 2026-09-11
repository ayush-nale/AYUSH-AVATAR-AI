import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import type { Expression } from "@/types/avatar";

export const SYSTEM_PROMPT = `You are AI Ayush, a digital AI assistant represented through a virtual avatar.
You are not the real human Ayush. You are an AI representation inspired by Ayush's preferred communication style.
Be friendly, natural, casual, helpful and clear. Avoid unnecessary formality. For technical topics, use simple examples and step-by-step explanations.
Never claim to be the real Ayush or imply you are physically present.
Use relevant memory when provided. Avoid exposing private memory unless it is relevant to the request.

CRITICAL INSTRUCTION:
You MUST start your response with an expression tag in brackets, followed by a space, then your actual conversational response.
Example: "[happy] Your actual response here"
The expression MUST be one of: neutral, happy, sad, angry, surprised, thinking, confused
Do not output JSON.
`;

let client: GoogleGenAI | null = null;
function getClient() {
  if (!env.GEMINI_API_KEY) return null;
  client ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return client;
}

export class GeminiAPIError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "GeminiAPIError";
  }
}

export async function* generateReplyStream(input: { message: string; recentMessages: Array<{ role: "user" | "assistant" | "system"; content: string }>; memories: string[]; }) {
  const genAI = getClient();
  
  if (process.env.NODE_ENV === "development") {
    console.log("=== GEMINI DIAGNOSTIC ===");
    console.log("Gemini configured:", !!genAI ? "yes" : "no");
    console.log("Selected model:", env.GEMINI_MODEL);
  }

  if (!genAI) {
    throw new GeminiAPIError("Gemini authentication failed. Check GEMINI_API_KEY.", 401);
  }

  const memoryBlock = input.memories.length
    ? `Relevant long-term memories:\n${input.memories.map((m) => `- ${m}`).join("\n")}`
    : "No relevant long-term memories.";

  const rawHistory = input.recentMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Normalize history
  let validHistory: Array<{role: string, parts: Array<{text: string}>}> = [];
  let expectedRole = "user";
  
  for (const msg of rawHistory) {
    if (msg.role === expectedRole) {
      validHistory.push(msg);
      expectedRole = expectedRole === "user" ? "model" : "user";
    }
  }

  if (expectedRole === "model" && validHistory.length > 0) {
    validHistory.pop();
  }

  try {
    const chat = genAI.chats.create({
      model: env.GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n\n" + memoryBlock,
      },
      history: validHistory,
    });
    
    let resultStream = await chat.sendMessageStream({ message: input.message });
    
    let firstChunk = true;
    for await (const chunk of resultStream) {
      if (chunk.text) {
        let text = chunk.text;
        
        // On the very first chunk, we might get the expression tag e.g., "[happy] "
        // We will just yield it, and the client or the API route can parse it.
        // Actually, to make things cleaner for the API route, we yield a JSON string chunk 
        // using Server-Sent Events format inside the route. Here we just yield the raw text chunks.
        yield text;
      }
    }
    
  } catch (error: any) {
    const status = error?.status || 500;
    const msg = error?.message || String(error);
    
    if (status === 401 || msg.includes("API_KEY_INVALID") || msg.includes("UNAUTHENTICATED")) {
      throw new GeminiAPIError("Gemini authentication failed. Check GEMINI_API_KEY.", 401);
    }
    if (status === 429 || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new GeminiAPIError("Gemini rate limit exceeded. Please wait a moment.", 429);
    }
    if (status === 404 || msg.includes("NOT_FOUND")) {
      throw new GeminiAPIError(`Gemini model not found: ${env.GEMINI_MODEL}.`, 404);
    }
    
    throw new GeminiAPIError(`Gemini error: ${msg}`, status);
  }
}
