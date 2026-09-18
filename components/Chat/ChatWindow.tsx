import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";

export default function ChatWindow({ messages, error, onSuggestionClick, displayName = "Ayush" }: { messages: ChatMessage[]; error: string; onSuggestionClick: (text: string) => void; displayName?: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const prevFirstMessageId = useRef<string | undefined>(messages[0]?.id);

  const [greeting, setGreeting] = useState("Hey");
  const [prompt, setPrompt] = useState("what are we working on today?");

  useEffect(() => {
    // Dynamic greeting based on local time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Random prompt
    const prompts = [
      "what are we working on today?",
      "what's your agenda today?",
      "how can I help you right now?",
      "ready to get things done?",
      "what's on your mind today?"
    ];
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);

  // Scroll to bottom reliably
  useEffect(() => {
    if (endRef.current && messages.length > 0) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0 && !error) {
    return (
      <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "16px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 className="text-gradient font-heading" style={{ fontSize: "28px", margin: "0 0 8px 0" }}>{greeting}, {displayName}</h2>
          <p style={{ color: "var(--muted)", fontSize: "15px", margin: 0 }}>{prompt}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "0", display: "flex", flexDirection: "column", gap: "24px" }}>
      {messages.map(m => {
        const isUser = m.role === "user";
        return (
          <div key={m.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: "16px", opacity: 0, animation: "fadeInUp 0.4s ease forwards" }}>
            {!isUser && (
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: "16px", height: "16px", background: "linear-gradient(135deg, var(--accent2), var(--accent))", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
              <div 
                className="chat-msg-bubble"
                style={{
                  maxWidth: "100%",
                  padding: "16px 20px",
                  borderRadius: "20px",
                  background: isUser ? "rgba(255,255,255,0.03)" : "rgba(10, 8, 20, 0.5)",
                  border: "1px solid rgba(168, 85, 247, 0.15)",
                  boxShadow: isUser ? "none" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  color: "var(--text)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  backdropFilter: "blur(12px)",
                  whiteSpace: "pre-wrap"
                }}
              >
                <div style={{ opacity: 0.9 }}>{m.content}</div>
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px", padding: "0 8px" }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {isUser && (
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--muted)", fontSize: "18px" }}>
                👤
              </div>
            )}
          </div>
        );
      })}
      
      {error && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "14px 24px", borderRadius: "16px", background: "rgba(255, 77, 77, 0.1)", border: "1px solid rgba(255, 77, 77, 0.2)", color: "var(--danger)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>⚠️</span> {error}
          </div>
        </div>
      )}
      
      <div ref={endRef} style={{ height: 1 }} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
