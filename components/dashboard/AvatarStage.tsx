import React from "react";
import Avatar from "@/components/Avatar/Avatar";
import type { AvatarState, Expression, AvatarId } from "@/types/avatar";

export default function AvatarStage({
  state,
  expression,
  lipSyncRef,
  avatarId
}: {
  state: AvatarState;
  expression: Expression;
  lipSyncRef: React.MutableRefObject<number>;
  avatarId: AvatarId;
}) {
  const getStatusMessage = () => {
    switch(state) {
      case "listening": return "I'm listening...";
      case "thinking": return "Give me a second...";
      case "speaking": return "Here's what I think...";
      case "error": return "Something went wrong.";
      default: return "";
    }
  };

  const status = getStatusMessage();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", zIndex: 0 }}>
      
      {/* 3D Canvas Area */}
      <div style={{ position: "relative", width: "500px", height: "100%" }}>
        
        {/* Spotlights (pointer-events-none so they don't block clicks) */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(157, 78, 221, 0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "20%", width: "200px", height: "200px", background: "radial-gradient(ellipse, rgba(224, 170, 255, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "200px", height: "200px", background: "radial-gradient(ellipse, rgba(157, 78, 221, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* The actual WebGL Canvas wrapper */}
        <div style={{ width: "100%", height: "100%", pointerEvents: "none" /* Let the canvas be passive unless rotating is needed */ }}>
          <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
            <Avatar state={state} expression={expression} lipSyncRef={lipSyncRef} avatarId={avatarId} />
          </div>
        </div>
        
        {/* Status Bubble - moved to bottom 20% so it's below his face but above the UI */}
        {status && (
          <div style={{ position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)", animation: "float 4s ease-in-out infinite", zIndex: 10, pointerEvents: "none" }}>
            <div className="glass-panel" style={{ 
              padding: "12px 16px", 
              borderRadius: "24px", 
              fontSize: "14px", 
              color: "var(--text)", 
              border: "1px solid rgba(157, 78, 221, 0.3)", 
              boxShadow: "0 8px 32px rgba(157, 78, 221, 0.15)", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              background: "linear-gradient(90deg, rgba(15, 12, 29, 0.8), rgba(20, 15, 40, 0.9))",
              whiteSpace: "nowrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(157, 78, 221, 0.2)" }}>
                {state === "listening" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s infinite" }} />}
                {state === "thinking" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent2)", animation: "pulse 1s infinite" }} />}
                {state === "error" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)" }} />}
                {state === "speaking" && <span style={{ fontSize: "10px" }}>💬</span>}
                {state === "idle" && <span style={{ fontSize: "10px" }}>✨</span>}
              </div>
              <span style={{ fontWeight: 500 }}>{status}</span>
              
              <div style={{ marginLeft: "8px", fontSize: "9px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "10px", display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span>AI</span>
                <span>{avatarId}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.4; transform: scale(0.8); }
        }
      `}} />
    </div>
  );
}
