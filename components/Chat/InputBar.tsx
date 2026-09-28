import React, { RefObject, useRef } from "react";
import MicButton from "@/components/Voice/MicButton";
import { Paperclip, X } from "lucide-react";

export default function InputBar({
  input,
  setInput,
  loading,
  onSend,
  onTranscript,
  onListeningChange,
  inputRef,
  attachedFile,
  setAttachedFile
}: {
  input: string;
  setInput: (s: string) => void;
  loading: boolean;
  onSend: () => void;
  onTranscript: (t: string) => void;
  onListeningChange: (on: boolean) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  attachedFile?: { name: string; type: string; data: string } | null;
  setAttachedFile?: (file: { name: string; type: string; data: string } | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: limit file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select a file under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result && setAttachedFile) {
        // result is a data URL like "data:image/png;base64,iVBORw0KGgo..."
        const base64Data = result.split(",")[1];
        setAttachedFile({
          name: file.name,
          type: file.type,
          data: base64Data
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
        />
        <button 
          className="focus-ring input-bar-btn" 
          onClick={() => fileInputRef.current?.click()}
          title="Attach a file"
          style={{ width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "var(--muted)", transition: "all 0.2s", cursor: "pointer" }}
        >
          <Paperclip size={20} className="hover:text-white" />
        </button>
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {attachedFile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", background: "rgba(168, 85, 247, 0.15)", borderRadius: "8px", marginBottom: "4px", width: "fit-content", maxWidth: "100%" }}>
              <span style={{ fontSize: "12px", color: "var(--accent)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                📎 {attachedFile.name}
              </span>
              <button 
                onClick={() => setAttachedFile && setAttachedFile(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}
              >
                <X size={12} />
              </button>
            </div>
          )}
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
            height: attachedFile ? "32px" : "44px"
          }}
        />
        </div>
        
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
