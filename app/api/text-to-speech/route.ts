import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateSpeech } from "@/lib/voice";
import { rateLimit } from "@/lib/rate-limit";
const schema=z.object({text:z.string().trim().min(1).max(12000),avatarId:z.string().optional()});
export const runtime="nodejs";
export async function POST(req:Request){const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return NextResponse.json({error:"Unauthenticated"},{status:401});const rl=rateLimit(`${user.id}:tts`,10,60000);if(!rl.allowed)return NextResponse.json({error:"Too many voice requests"},{status:429});let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Invalid text"},{status:400});try{const result=await generateSpeech(parsed.data.text,parsed.data.avatarId);return new NextResponse(result.audio,{headers:{"Content-Type":result.contentType,"Cache-Control":"no-store"}})}catch(err:any){console.error(err);return NextResponse.json({error: err?.message || "Voice generation is unavailable"},{status:502})}}
