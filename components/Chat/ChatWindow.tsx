import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import { Download, FileText } from "lucide-react";

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

  const handleDownloadPdf = async (pdfContent: string) => {
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      
      // Basic markdown to HTML conversion for the PDF
      let htmlContent = pdfContent
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #222;">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; color: #333;">$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\n/gim, '<br/>');

      element.innerHTML = `<div style="padding: 40px; font-family: Helvetica, Arial, sans-serif; color: #000; background: #fff; line-height: 1.6;">${htmlContent}</div>`;
      
      const opt = {
        margin:       0.5,
        filename:     'AI_Ayush_Document.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };
  
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
                {(() => {
                  const content = m.content;
                  const startIdx = content.indexOf("[PDF_START]");
                  const endIdx = content.indexOf("[PDF_END]");
                  
                  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    const before = content.substring(0, startIdx);
                    const pdfText = content.substring(startIdx + 11, endIdx).trim();
                    const after = content.substring(endIdx + 9);
                    
                    return (
                      <div style={{ opacity: 0.9 }}>
                        {before && <div>{before}</div>}
                        
                        <div style={{ margin: "16px 0", padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--accent)" }}>
                            <FileText size={24} />
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "#fff" }}>Generated Document</div>
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--muted)", maxHeight: "100px", overflow: "hidden", textOverflow: "ellipsis", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)" }}>
                            {pdfText}
                          </div>
                          <button 
                            onClick={() => handleDownloadPdf(pdfText)}
                            className="focus-ring"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px", background: "var(--accent)", color: "#000", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", marginTop: "4px", transition: "opacity 0.2s" }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            <Download size={16} strokeWidth={2.5} /> Download PDF
                          </button>
                        </div>
                        
                        {after && <div>{after}</div>}
                      </div>
                    );
                  }
                  
                  return <div style={{ opacity: 0.9 }}>{content}</div>;
                })()}
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
