import React, { RefObject } from "react";
import MicButton from "@/components/Voice/MicButton";

export default function InputBar({
  input,
  setInput,
  loading,
  onSend,
  onTranscript,
  onListeningChange,
  inputRef
}: {
  input: string;
  setInput: (s: string) => void;
  loading: boolean;
  onSend: () => void;
  onTranscript: (t: string) => void;
  onListeningChange: (on: boolean) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="input-bar-container" style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
      <div 
        className="glass-panel input-bar-inner"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          padding: "8px 12px", 
          borderRadius: "999px",
          background: "linear-gradient(90deg, rgba(15, 12, 29, 0.8), rgba(20, 15, 40, 0.9))",
          border: "1px solid rgba(157, 78, 221, 0.3)",
          boxShadow: "0 8px 32px rgba(157, 78, 221, 0.15)"
        }}
      >
        <button className="focus-ring input-bar-btn" style={{ width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "var(--muted)", transition: "all 0.2s" }}>
          <span style={{ fontSize: "20px", opacity: 0.8 }}>📎</span>
        </button>
        
        <input 
          ref={inputRef}
          className="focus-ring"
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} 
          placeholder="Ask anything..." 
          style={{ 
            flex: 1, 
            background: "transparent", 
            border: 0, 
            outline: 0, 
            color: "var(--text)", 
            padding: "0 8px", 
            fontSize: "15px",
            lineHeight: 1.5,
            height: "44px"
          }}
        />
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <MicButton 
            disabled={loading} 
            onTranscript={onTranscript} 
            onListeningChange={onListeningChange}
          />
          <button 
            className="focus-ring input-bar-btn" 
            onClick={onSend} 
            disabled={loading || !input.trim()} 
            style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "50%", 
              background: "var(--accent)", 
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: (loading || !input.trim()) ? 0.3 : 1,
              transition: "all 0.2s",
              fontSize: "18px",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.4)"
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
