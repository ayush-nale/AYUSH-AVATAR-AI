"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Conversation, ChatMessage } from "@/types/chat";
import type { AvatarState, Expression, AvatarId } from "@/types/avatar";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import AvatarStage from "@/components/dashboard/AvatarStage";
import ChatWindow from "@/components/Chat/ChatWindow";
import InputBar from "@/components/Chat/InputBar";
import { useLiveVoice } from "@/components/Voice/useLiveVoice";
import { PanelLeft, Mic, PhoneOff, Settings, Volume2, Sparkles, Send, Download, LogOut, MessageSquare } from "lucide-react";

export default function Dashboard({ user, displayName, initialConversations }: { user: { id: string; email: string }; displayName: string; initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifiedToast, setShowVerifiedToast] = useState(false);
  const [appState, setAppState] = useState<AvatarState>("idle");
  const [expression, setExpression] = useState<Expression>("neutral");
  const [avatarId, setAvatarId] = useState<AvatarId>("ayush");
  const [error, setError] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userSubtitle, setUserSubtitle] = useState("");
  const [aiSubtitle, setAiSubtitle] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const lipSyncRef = useRef<number>(0);
  
  // Create a ref for the input to focus it when new chat is created
  const inputRef = useRef<HTMLInputElement>(null);

  const conversation = useMemo(() => conversations.find(c => c.id === conversationId), [conversations, conversationId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("verified") === "true") {
        setShowVerifiedToast(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => setShowVerifiedToast(false), 5000);
      }
    }
  }, []);

  // Auto-close sidebar on mobile by default
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // We load the conversation only when explicitly selected, to avoid overwriting optimistic messages on creation.
  async function selectConversation(id: string) {
    setConversationId(id);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
    await loadConversation(id);
  }

  async function loadConversation(id: string) {
    try {
      const r = await fetch(`/api/conversations/${id}`);
      const text = await r.text();
      const d = text ? JSON.parse(text) : {};
      if (r.ok) {
        setMessages(d.messages ?? []);
        setError("");
      }
    } catch (e) {
      console.error("Failed to load conversation", e);
    }
  }

  async function newConversation() {
    setError("");
    setConversationId("");
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    setAppState("thinking");
    
    let id = conversationId;
    if (!id) {
      const r = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: clean.slice(0, 60) })
      });
      let d;
      try {
        const text = await r.text();
        d = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(`Server returned an invalid response (Status ${r.status}).`);
      }
      if (!r.ok) { setError(d.error ?? "Could not create conversation"); setLoading(false); setAppState("error"); return; }
      id = d.conversation.id;
      setConversationId(id);
      setConversations(c => [d.conversation, ...c]);
    }
    
    const optimistic = { id: `temp-${Date.now()}`, conversation_id: id, user_id: user.id, role: "user" as const, content: clean, created_at: new Date().toISOString() };
    setMessages(m => [...m, optimistic]);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, message: clean })
      });
      
      if (!r.ok || !r.body) {
        throw new Error("Chat failed to start stream");
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let fullReply = "";
      let sentenceBuffer = "";
      const ttsQueue: string[] = [];
      let isPlayingTTS = false;
      let isStreamDone = false;
      
      const playNextInQueue = async () => {
         if (isPlayingTTS || ttsQueue.length === 0) return;
         isPlayingTTS = true;
         const textToSpeak = ttsQueue.shift();
         if (!textToSpeak) { isPlayingTTS = false; return; }

         try {
           const ttsRes = await fetch("/api/text-to-speech", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: textToSpeak, avatarId })
           });
           if (!ttsRes.ok) {
             const errText = await ttsRes.text().catch(() => "Unknown error");
             throw new Error(`TTS failed: ${ttsRes.status} ${errText}`);
           }
           const blob = await ttsRes.blob();
           const url = URL.createObjectURL(blob);
           
           if (audioRef.current) audioRef.current.pause();
           const audio = new Audio(url);
           audio.playbackRate = avatarId === "robot" ? 0.7 : avatarId === "ayush" ? 0.85 : 1.0;
           if ('preservesPitch' in audio) {
             (audio as any).preservesPitch = false; // Forces pitch to drop with speed, creating a deeper male voice
           }
           audio.crossOrigin = "anonymous";
           audioRef.current = audio;
           
           if (!audioContextRef.current) {
             const AC = window.AudioContext || (window as any).webkitAudioContext;
             audioContextRef.current = new AC();
             analyserRef.current = audioContextRef.current.createAnalyser();
             analyserRef.current.fftSize = 256;
           }
           if (audioContextRef.current.state === "suspended") audioContextRef.current.resume();
           if (sourceRef.current) sourceRef.current.disconnect();
           sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
           sourceRef.current.connect(analyserRef.current!);
           analyserRef.current!.connect(audioContextRef.current.destination);
           
           let rafId: number;
           const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
           const loop = () => {
             if (analyserRef.current) {
               analyserRef.current.getByteTimeDomainData(dataArray);
               let maxVal = 0;
               for (let i = 0; i < dataArray.length; i++) {
                 const val = Math.abs(dataArray[i] - 128);
                 if (val > maxVal) maxVal = val;
               }
               const normalized = Math.min(1, maxVal / 40);
               lipSyncRef.current = normalized;
             }
             rafId = requestAnimationFrame(loop);
           };
           loop();
           
           setAppState("speaking");
           audio.onended = () => {
             URL.revokeObjectURL(url);
             cancelAnimationFrame(rafId);
             lipSyncRef.current = 0;
             isPlayingTTS = false;
             if (ttsQueue.length > 0) {
                playNextInQueue();
             } else if (isStreamDone) {
                setAppState("idle");
             }
           };
           await audio.play().catch(() => {
              isPlayingTTS = false;
              playNextInQueue();
           });
         } catch (e) {
           console.error(e);
           isPlayingTTS = false;
           playNextInQueue();
         }
      };

      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages(m => [...m, { id: assistantMessageId, conversation_id: id, user_id: user.id, role: "assistant", content: "", created_at: new Date().toISOString() }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || "";
        
        for (const block of lines) {
           const eventMatch = block.match(/event: (.*)\n/);
           const dataMatch = block.match(/data: (.*)/);
           const event = eventMatch ? eventMatch[1] : "message";
           const dataStr = dataMatch ? dataMatch[1] : "{}";
           
           if (event === "end") {
             // End of stream
           } else if (event === "error") {
             const data = JSON.parse(dataStr);
             setError(data.error || "Stream error");
           } else if (event === "expression") {
             const data = JSON.parse(dataStr);
             setExpression(data.expression);
           } else {
             const data = JSON.parse(dataStr);
             if (data.text) {
               fullReply += data.text;
               sentenceBuffer += data.text;
               
               if (/[.!?]\s/.test(sentenceBuffer) || /[.!?]$/.test(sentenceBuffer) || /\n/.test(sentenceBuffer)) {
                  const match = sentenceBuffer.match(/([.!?]+(?:\s|$))|(\n)/);
                  if (match && match.index !== undefined) {
                     const splitIndex = match.index + match[0].length;
                     const sentence = sentenceBuffer.slice(0, splitIndex).trim();
                     sentenceBuffer = sentenceBuffer.slice(splitIndex);
                     if (sentence) {
                        ttsQueue.push(sentence);
                        playNextInQueue();
                     }
                  }
               }

               setMessages(m => m.map(msg => msg.id === assistantMessageId ? { ...msg, content: fullReply } : msg));
             }
           }
        }
      }
      
      isStreamDone = true;
      if (sentenceBuffer.trim()) {
         ttsQueue.push(sentenceBuffer.trim());
         playNextInQueue();
      } else if (ttsQueue.length === 0 && !isPlayingTTS) {
         setAppState("idle");
      }
      setLoading(false);
      
      const updated = { ...conversation, updated_at: new Date().toISOString() } as Conversation;
      if (conversation) setConversations(c => c.map(x => x.id === id ? updated : x));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setAppState("error");
      setLoading(false);
    }
  }

  const { connect, disconnect, sessionState, error: voiceError } = useLiveVoice(
    avatarId,
    (vol) => {
      lipSyncRef.current = Math.min(1, vol * 3);
    },
    (speaking) => {
      // Prevents disconnect() from forcing "listening" state when we just set it to "idle"
      setAppState(prev => (prev === "idle" && !speaking) ? "idle" : (speaking ? "speaking" : "listening"));
    },
    (expr) => {
      setExpression(expr as Expression);
    },
    (userText) => {
      setUserSubtitle(userText);
    },
    (fullText) => {
      setAiSubtitle(fullText);
    },
    () => {
      // turn complete
      setAiSubtitle("");
    }
  );

  useEffect(() => {
    if (!voiceMode && sessionState === "connected") {
      setAppState("idle");
      disconnect();
    }
  }, [voiceMode, avatarId]);

  const layoutClass = voiceMode ? "layout-voice-mode" : (isSidebarOpen ? "layout-sidebar-open" : "layout-sidebar-closed");

  return (
    <main className={`shell ${layoutClass}`}>
      {!voiceMode && (
        <Sidebar 
          displayName={displayName}
          conversations={conversations} 
          conversationId={conversationId} 
          onSelectConversation={selectConversation} 
          onNewConversation={newConversation} 
          avatarId={avatarId}
          setAvatarId={setAvatarId}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}
      
      <section style={{ position: "relative", display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
        
        {/* Top absolute controls */}
        <div className="dashboard-controls-left" style={{ position: "absolute", top: "24px", left: "24px", zIndex: 100, display: "flex", alignItems: "center", gap: "12px" }}>
           {!voiceMode && (
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                  padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)",
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                className="hover:bg-white/10 hover:text-white focus-ring"
                aria-label="Toggle Sidebar"
             >
               <PanelLeft size={20} />
             </button>
           )}
           <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: 500 }}>Online</span>
           </div>
        </div>

        {/* Verified Toast */}
        {showVerifiedToast && (
          <div style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, rgba(168, 85, 247, 0.9), rgba(126, 34, 206, 0.9))",
            color: "white",
            padding: "12px 24px",
            borderRadius: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 9999,
            fontWeight: 500,
            animation: "fadeInDown 0.5s ease-out"
          }}>
            ✨ Email verified! Logged in successfully.
          </div>
        )}

        <div className="dashboard-controls-right" style={{ position: "absolute", top: "24px", right: "24px", zIndex: 100, display: "flex", gap: "24px", alignItems: "center" }}>
          
          {voiceMode && (
            <div className="voice-mode-status" style={{ color: sessionState === "connected" ? "#10b981" : sessionState === "error" ? "#ef4444" : "var(--text-dim)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sessionState === "connected" ? "#10b981" : sessionState === "error" ? "#ef4444" : "var(--text-dim)", animation: sessionState === "connected" ? "pulse 2s infinite" : "none" }}></div>
              {sessionState === "connected" ? "Live" : sessionState === "connecting" ? "Connecting..." : sessionState === "error" ? "Connection Error" : ""}
            </div>
          )}
          <button 
            className="focus-ring glass-panel glow-border" 
            onClick={() => {
              if (!voiceMode) {
                setUserSubtitle("");
                setAiSubtitle("");
                setAppState("listening");
                connect();
                setVoiceMode(true);
              } else {
                setAppState("idle");
                disconnect();
                setVoiceMode(false);
              }
            }}
            style={{ 
               padding: "10px 20px", borderRadius: "24px", 
               border: "1px solid rgba(168, 85, 247, 0.4)", 
               color: "var(--text)", 
               background: voiceMode ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.02)",
               display: "flex", alignItems: "center", gap: "8px",
               fontWeight: 500, fontSize: "14px"
            }}
          >
            <span style={{ color: "var(--accent2)" }}>{voiceMode ? "⏸" : "🎙️"}</span> 
            {voiceMode ? "Exit Voice" : "Voice Mode"}
          </button>
        </div>

        {/* 1. Avatar Stage Zone (Full Background) */}
        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "100%", zIndex: 10 }}>
          
          <div className={`avatar-stage-container ${voiceMode ? 'voice-active' : ''}`}>
            <AvatarStage state={appState} expression={expression} lipSyncRef={lipSyncRef} avatarId={avatarId} />
          </div>

          {voiceMode && (userSubtitle || aiSubtitle) && (
            <div className="subtitles-overlay">
               {userSubtitle && <p className="subtitle-user">"{userSubtitle}"</p>}
               {aiSubtitle && <p className="subtitle-ai">{aiSubtitle}</p>}
            </div>
          )}
        </div>

        {/* 2. Chat Panel Zone (Glass overlay at bottom) */}
        {!voiceMode && (
          <div className={`chat-panel-zone ${messages.length > 0 ? 'has-messages' : ''}`}>
            {/* Scrollable messages area */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingBottom: "16px" }} className="scrollbar">
              <ChatWindow messages={messages} error={error} onSuggestionClick={sendMessage} displayName={displayName} />
            </div>
            
            {/* Sticky Input Bar at the bottom of the chat zone */}
            <div style={{ flexShrink: 0 }}>
              <InputBar 
                inputRef={inputRef}
                input={input}
                setInput={setInput}
                loading={loading}
                onSend={() => sendMessage()}
                onTranscript={(t) => {
                  setInput(t);
                  if (voiceMode && t.trim()) {
                    sendMessage(t);
                  }
                }}
                onListeningChange={(on) => setAppState(on ? "listening" : loading ? "thinking" : "idle")}
              />
            </div>
          </div>
        )}

        <audio ref={audioRef} hidden />
      </section>
    </main>
  );
}
