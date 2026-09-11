import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Initialize the server-side SDK using the API key
    const ai = new GoogleGenAI({ 
      apiKey: env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' } 
    });

    // Create ephemeral auth token
    const token = await ai.authTokens.create({} as any);

    return NextResponse.json({ token: token.name });
  } catch (globalErr: any) {
    console.error("Live Voice Token Generation Error:", globalErr);
    return NextResponse.json({ error: globalErr?.message || "Failed to generate session token." }, { status: 500 });
  }
}
