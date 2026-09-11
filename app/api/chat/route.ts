import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateReplyStream } from "@/lib/ai";
import { getRelevantMemories } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

const schema=z.object({conversationId:z.string().uuid(),message:z.string().trim().min(1).max(env.MAX_CHAT_CHARS)});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    
    const rl = rateLimit(`${user.id}:chat`, env.RATE_LIMIT_MAX_REQUESTS, env.RATE_LIMIT_WINDOW_MS);
    if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
    const { conversationId, message } = parsed.data;
    
    const { data: conversation, error: e } = await supabase.from("conversations").select("id,user_id").eq("id", conversationId).eq("user_id", user.id).maybeSingle();
    if (e || !conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    
    const { data: recent } = await supabase.from("messages").select("role,content").eq("conversation_id", conversationId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(16);
    const memories = await getRelevantMemories(user.id, message);
    
    let resultStream;
    try {
      resultStream = generateReplyStream({ message, recentMessages: (recent ?? []).reverse().map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })), memories });
    } catch (genErr: any) {
      console.error("AI Generation failed:", genErr);
      const status = genErr?.status || 500;
      return NextResponse.json({ error: genErr?.message || "AI is temporarily unavailable. Please try again." }, { status });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = "";
        let expression = "neutral";
        let isFirstChunk = true;
        let buffer = "";
        let parsedExpression = false;
        
        try {
          for await (const chunk of resultStream) {
            let chunkText = chunk;
            
            if (!parsedExpression) {
              buffer += chunkText;
              
              // If the buffer is ONLY whitespace, keep waiting
              if (/^\s*$/.test(buffer)) {
                continue;
              }
              // If the buffer doesn't start with '[' or whitespace, there is no expression tag
              else if (!/^\s*\[/.test(buffer)) {
                console.log("FAILED TO MATCH EXPRESSION. First buffer was:", JSON.stringify(buffer));
                parsedExpression = true;
                chunkText = buffer;
                buffer = "";
              } 
              // If it starts with '[' and contains ']', we can parse it
              else if (buffer.includes("]")) {
                parsedExpression = true;
                const match = buffer.match(/^\s*\[(.*?)\]\s*/);
                if (match) {
                  expression = match[1].toLowerCase().trim();
                  console.log("MATCHED EXPRESSION:", expression);
                  chunkText = buffer.replace(/^\s*\[(.*?)\]\s*/, "");
                  controller.enqueue(encoder.encode(`event: expression\ndata: ${JSON.stringify({ expression })}\n\n`));
                } else {
                  chunkText = buffer;
                }
                buffer = "";
              } 
              // Otherwise, we are still waiting for ']'
              else {
                // If it's been a long time (e.g. > 50 chars) and no ']', give up
                if (buffer.length > 50) {
                  parsedExpression = true;
                  chunkText = buffer;
                  buffer = "";
                } else {
                  continue; // Don't emit anything yet, wait for more chunks
                }
              }
            }
            
            fullReply += chunkText;
            
            if (chunkText) {
               controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
            }
          }
          
          // Emit any leftover buffer just in case
          if (!parsedExpression && buffer) {
            fullReply += buffer;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: buffer })}\n\n`));
          }
          
          const { error: insertErr } = await supabase.from("messages").insert([
             { conversation_id: conversationId, user_id: user.id, role: "user", content: message }, 
             { conversation_id: conversationId, user_id: user.id, role: "assistant", content: fullReply }
          ]);
          if (!insertErr) {
             await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId).eq("user_id", user.id);
          }
          
          controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`));
          controller.close();
        } catch (err: any) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  } catch (globalErr) {
    console.error("Global Chat API Error:", globalErr);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
