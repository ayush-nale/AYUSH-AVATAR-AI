"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "@/lib/ai";
import type { AvatarId } from "@/types/avatar";

export function useLiveVoice(avatarId: AvatarId | string, onVolumeChange: (vol: number) => void, onSpeakingChange?: (speaking: boolean) => void, onExpressionChange?: (expr: string) => void) {
  const [sessionState, setSessionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string>("");
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Audio playback queue
  const playbackQueue = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const textBufferRef = useRef<string>("");
  const expressionParsedRef = useRef<boolean>(false);

  const connect = async () => {
    console.log("Connect function called. Current state:", sessionState);
    if (sessionState !== "idle") return;
    setSessionState("connecting");
    setError("");

    try {
      // 3. Get Auth Token
      console.log("Fetching token...");
      const res = await fetch("/api/voice/token");
      const data = await res.json();
      if (!data.token) {
        console.error("No token received");
        window.alert(`Token fetch failed: ${data.error || "Unknown error"}`);
        disconnect();
        return;
      }
      const token = data.token;

      // 2. Initialize Gemini Live API
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } });
      aiRef.current = ai;

      // 3. Request Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = actx;
      
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(actx.destination);
      analyserRef.current = analyser;

      const source = actx.createMediaStreamSource(stream);
      const scriptNode = actx.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = scriptNode;

      // 4. Connect to Live API
      console.log("Connecting to Live API...");
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: async (data: any) => {
             console.log("Received Live API message:", data);
             if (data.serverContent) {
                const sc = data.serverContent;
                if (sc && sc.outputTranscription && sc.outputTranscription.text) {
                   const text = sc.outputTranscription.text;
                   if (text.includes("😊") || text.includes("😄") || text.includes("😁")) onExpressionChange?.("happy");
                   else if (text.includes("😢") || text.includes("😔") || text.includes("😭")) onExpressionChange?.("sad");
                   else if (text.includes("😡") || text.includes("😠") || text.includes("🤬")) onExpressionChange?.("angry");
                   else if (text.includes("😲") || text.includes("😮") || text.includes("🤯")) onExpressionChange?.("surprised");
                   else if (text.includes("😕") || text.includes("🤔")) onExpressionChange?.("confused");
                }

                if (sc && sc.interrupted) {
                   playbackQueue.current = [];
                   if (activeSourceRef.current) {
                     activeSourceRef.current.stop();
                     activeSourceRef.current = null;
                   }
                   isPlayingRef.current = false;
                   if (onSpeakingChange) onSpeakingChange(false);
                }
                
                if (sc.turnComplete) {
                   textBufferRef.current = "";
                   expressionParsedRef.current = false;
                }
                
                if (sc.modelTurn && sc.modelTurn.parts) {
                   for (const part of sc.modelTurn.parts) {
                      if (part.text) {
                         if (!expressionParsedRef.current) {
                            textBufferRef.current += part.text;
                            const match = textBufferRef.current.match(/\[(.*?)\]/);
                            if (match && onExpressionChange) {
                               onExpressionChange(match[1].toLowerCase());
                               expressionParsedRef.current = true;
                            } else if (textBufferRef.current.length > 100) {
                               // Give up parsing after 100 characters to avoid infinite buffering
                               expressionParsedRef.current = true;
                            }
                         }
                      }
                      if (part.inlineData && part.inlineData.data) {
                         const base64 = part.inlineData.data;
                         await enqueueAudio(base64);
                      }
                      if (part.functionCall && part.functionCall.name === "set_expression") {
                        const args = part.functionCall.args || {};
                        if (args.expression && onExpressionChange) {
                          onExpressionChange(args.expression.toLowerCase());
                        }
                        
                        // Send empty response so the model continues
                        if (sessionRef.current && sessionRef.current.sendToolResponse) {
                           try {
                             sessionRef.current.sendToolResponse({
                               functionResponses: [{
                                 id: part.functionCall.id || "0",
                                 name: part.functionCall.name || "set_expression",
                                 response: { result: "ok" }
                               }]
                             });
                           } catch (e: any) { 
                             console.error("Tool response error:", e);
                             window.alert("Tool response error (1): " + e.message);
                           }
                        }
                      }
                   }
                }

                // Gemini 2.0 Live API sometimes returns toolCall at the top level
                const topToolCall = data.toolCall || sc.toolCall;
                if (topToolCall) {
                   // Check top-level toolCall from LiveServerMessage
                   if (topToolCall.functionCalls) {
                     topToolCall.functionCalls.forEach((call: any) => {
                       if (call.name === "set_expression" && call.args && call.args.expression) {
                         if (onExpressionChange) {
                           onExpressionChange(String(call.args.expression).toLowerCase());
                         }
                       }
                     });
                     
                     // Respond to the top-level toolCall
                     if (sessionRef.current && sessionRef.current.sendToolResponse) {
                        try {
                           const functionResponses = topToolCall.functionCalls.map((call: any) => ({
                              id: call.id,
                              name: call.name,
                              response: { result: "ok" }
                           }));
                           sessionRef.current.sendToolResponse({ functionResponses });
                        } catch(e: any) { 
                           console.error("Tool response error:", e);
                           window.alert("Tool response error (2): " + e.message);
                        }
                     }
                   } else {
                     const args = topToolCall.args || {};
                     if (args.expression && onExpressionChange) {
                       onExpressionChange(String(args.expression).toLowerCase());
                     }
                     
                     // Respond to the top-level toolCall
                     if (sessionRef.current && sessionRef.current.sendToolResponse) {
                        try {
                           sessionRef.current.sendToolResponse({
                             functionResponses: [{
                               id: topToolCall.id,
                               name: "set_expression", // Best guess
                               response: { success: true }
                             }]
                           });
                        } catch (e: any) { 
                           console.error("Tool response error:", e);
                           window.alert("Tool response error (3): " + e.message);
                        }
                     }
                   }
                }
             }
          },
          onclose: (e: any) => {
             console.log("Live API connection closed", e);
             disconnect();
          },
          onerror: (e: any) => {
             console.error("Live API Error received:", e);
             window.alert("Live API Error: " + (e.message || JSON.stringify(e)));
          }
        },
        config: {
          systemInstruction: {
            parts: [{
              text: SYSTEM_PROMPT + "\n\nCRITICAL VOICE INSTRUCTIONS: You MUST call the `set_expression` tool to change your facial expression before you speak! Make sure to pass a valid emotion from the enum."
            }]
          } as any,
          responseModalities: ["AUDIO"] as any,
          tools: [{
            functionDeclarations: [{
              name: "set_expression",
              description: "Call this function whenever your emotion changes during the conversation to update your avatar's facial expression.",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  expression: {
                    type: "STRING" as any,
                    enum: ["neutral", "happy", "sad", "angry", "surprised", "confused", "thinking"],
                    description: "The expression to show."
                  }
                },
                required: ["expression"]
              }
            }]
          }],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: avatarId === "ayush" ? "Charon" : avatarId === "girl" ? "Aoede" : "Puck"
              }
            }
          }
        }
      });
      sessionRef.current = session;
      console.log("Live API connected!");

      // 6. Capture mic audio and send it
      scriptNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        if (sessionRef.current) {
          // Convert Float32Array (-1.0 to 1.0) to Int16Array PCM
          const pcm = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          // Convert Int16Array to base64
          const uint8 = new Uint8Array(pcm.buffer);
          let binary = '';
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const b64 = btoa(binary);
          
          try {
            sessionRef.current.sendRealtimeInput({
            audio: {
              mimeType: "audio/pcm;rate=16000",
              data: b64
            }
          });
          } catch(err) {
            console.error("sendRealtimeInput error:", err);
          }
        }
      };

      source.connect(scriptNode);
      scriptNode.connect(actx.destination); // Required to make onaudioprocess fire

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = dataArray[i] - 128;
            sum += val * val;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const normalized = Math.min(1, rms / 60);
          onVolumeChange(Math.pow(normalized, 2));
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();

      setSessionState("connected");
    } catch (err: any) {
      console.error("Voice initialization error:", err);
      setError(err.message || "Could not connect to Voice API");
      disconnect();
    }
  };

  const enqueueAudio = async (base64: string) => {
    if (!audioContextRef.current) return;
    
    // Base64 to ArrayBuffer (PCM 24kHz 16-bit expected from Gemini)
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    
    // Create AudioBuffer
    const audioBuffer = audioContextRef.current.createBuffer(1, int16Array.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < int16Array.length; i++) {
      channelData[i] = int16Array[i] / 32768.0;
    }
    
    playbackQueue.current.push(audioBuffer);
    playQueue();
  };

  const playQueue = () => {
    if (isPlayingRef.current || playbackQueue.current.length === 0 || !audioContextRef.current || !analyserRef.current) {
      if (!isPlayingRef.current && playbackQueue.current.length === 0) {
        if (onSpeakingChange) onSpeakingChange(false);
      }
      return;
    }
    
    isPlayingRef.current = true;
    if (onSpeakingChange) onSpeakingChange(true);
    const buffer = playbackQueue.current.shift();
    if (!buffer) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(analyserRef.current);
    
    activeSourceRef.current = source;
    source.onended = () => {
      isPlayingRef.current = false;
      activeSourceRef.current = null;
      playQueue();
    };
    source.start(0);
  };

  const disconnect = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sessionRef.current) {
       try { sessionRef.current.conn.close(); } catch {}
       sessionRef.current = null;
    }
    if (scriptNodeRef.current) {
       scriptNodeRef.current.disconnect();
       scriptNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
       mediaStreamRef.current.getTracks().forEach(t => t.stop());
       mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
       if (audioContextRef.current.state !== 'closed') audioContextRef.current.close();
       audioContextRef.current = null;
    }
    playbackQueue.current = [];
    isPlayingRef.current = false;
    activeSourceRef.current = null;
    if (onSpeakingChange) onSpeakingChange(false);
    setSessionState("idle");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  return { connect, disconnect, sessionState, error };
}
