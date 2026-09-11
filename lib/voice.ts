import { env } from "@/lib/env";

export type AudioResult = { audio: ArrayBuffer; contentType: string };

export async function generateSpeech(text: string, avatarId?: string): Promise<AudioResult> {
  let openaiVoice = env.OPENAI_TTS_VOICE;
  if (avatarId === "ayush") openaiVoice = "onyx";
  else if (avatarId === "xalia") openaiVoice = "nova";
  else if (avatarId === "robot") openaiVoice = "echo";

  if (env.ELEVENLABS_API_KEY) {
    let elVoice = env.ELEVENLABS_VOICE_ID || "pNInz6obpgDQGcFmaJcg"; // Adam
    if (avatarId === "ayush") elVoice = "pNInz6obpgDQGcFmaJcg"; // Adam
    else if (avatarId === "xalia") elVoice = "EXAVITQu4vr4xnSDxMaL"; // Bella
    else if (avatarId === "robot") elVoice = "ErXwobaYiN019PkySvjV"; // Antoni

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elVoice)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: env.ELEVENLABS_MODEL_ID }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Voice provider failed with ${response.status}`);
    return { audio: await response.arrayBuffer(), contentType: response.headers.get("content-type") ?? "audio/mpeg" };
  }

  if (env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: env.OPENAI_TTS_MODEL, voice: openaiVoice, input: text, response_format: "mp3" }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`OpenAI TTS failed with ${response.status}`);
    return { audio: await response.arrayBuffer(), contentType: response.headers.get("content-type") ?? "audio/mpeg" };
  }

  // StreamElements TTS (Free Amazon Polly) for distinct voices
  let seVoice = "Matthew";
  if (avatarId === "ayush") seVoice = "Matthew";
  else if (avatarId === "xalia") seVoice = "Joanna"; // Soft female voice
  else if (avatarId === "robot") seVoice = "Brian"; // Distinct British male voice
  
  try {
    const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${seVoice}&text=${encodeURIComponent(text.slice(0, 500))}`;
    const seRes = await fetch(seUrl, { cache: "no-store" });
    if (seRes.ok) {
      return { audio: await seRes.arrayBuffer(), contentType: "audio/mpeg" };
    }
  } catch (e) {
    console.error("StreamElements fallback failed", e);
  }

  // Free Fallback: Google Translate TTS
  let lang = "en-us"; 
  if (avatarId === "ayush") lang = "en-us"; // Try en-us as it often defaults to male
  else if (avatarId === "xalia") lang = "en-gb"; // Usually defaults to female
  else if (avatarId === "robot") lang = "en-ie"; 

  const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${encodeURIComponent(text.slice(0, 200))}`;
  const response = await fetch(fallbackUrl, { 
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) throw new Error(`Fallback TTS failed with ${response.status}`);
  return { audio: await response.arrayBuffer(), contentType: "audio/mpeg" };
}
