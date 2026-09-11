import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/speech";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";
export const runtime="nodejs";
export async function POST(req:Request){const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user)return NextResponse.json({error:"Unauthenticated"},{status:401});const rl=rateLimit(`${user.id}:stt`,10,env.RATE_LIMIT_WINDOW_MS);if(!rl.allowed)return NextResponse.json({error:"Too many transcription requests"},{status:429});const form=await req.formData();const file=form.get("audio");if(!(file instanceof File))return NextResponse.json({error:"Audio file required"},{status:400});if(file.size>env.MAX_AUDIO_BYTES)return NextResponse.json({error:"Audio file is too large"},{status:400});try{const result=await transcribeAudio(file);return NextResponse.json({text:result.text,demo:result.demo})}catch(err){console.error(err);return NextResponse.json({error:"Could not transcribe audio"},{status:502})}}
