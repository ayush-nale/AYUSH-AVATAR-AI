import React from "react";
import type { Conversation } from "@/types/chat";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Sidebar({
  displayName,
  conversations,
  conversationId,
  onSelectConversation,
  onNewConversation
}: {
  displayName: string;
  conversations: Conversation[];
  conversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", padding: "28px 24px", zIndex: 50, borderRight: "1px solid rgba(255,255,255,0.02)", background: "var(--sidebar-bg)" }}>
      
      {/* Brand Header */}
      <div style={{ marginBottom: "28px", paddingLeft: "4px" }}>
        <h1 className="font-heading" style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "1px", display: "flex", alignItems: "center", gap: "12px", color: "var(--text)" }}>
          <div style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, var(--accent2), var(--accent))", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
          AI AYUSH
        </h1>
        <p style={{ fontSize: "10px", color: "var(--muted)", margin: "4px 0 0 36px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Your AI. Always with you.
        </p>
      </div>

      <button 
        onClick={onNewConversation}
        className="focus-ring" 
        style={{ 
          marginBottom: "28px",
          display: "flex", alignItems: "center", gap: "12px", 
          color: "#fff", padding: "14px 18px", fontSize: "14px", borderRadius: "12px", 
          background: "linear-gradient(90deg, #8134df, #a855f7)", 
          border: "none", boxShadow: "0 8px 24px rgba(168, 85, 247, 0.2)",
          fontWeight: 600, cursor: "pointer", transition: "transform 0.1s"
        }}
      >
        <span style={{ fontSize: "18px", fontWeight: 300 }}>+</span> New Chat
      </button>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflowY: "auto" }} className="scrollbar">
        
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", fontWeight: 500 }}>
          <span style={{ opacity: 0.8, fontSize: "16px" }}>💬</span> Chat
        </Link>
        <Link href="/conversations" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>📁</span> Conversations
        </Link>
        <Link href="/memory" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>🧠</span> Memory
        </Link>
        <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>👤</span> Profile
        </Link>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>⚙️</span> Settings
        </Link>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", margin: "20px 0" }} />

        <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", paddingLeft: "16px", fontWeight: 600 }}>Tools</div>
        <Link href="/voice" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "10px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>🎙️</span> Voice
        </Link>
        <Link href="/appearance" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "10px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>🎨</span> Appearance
        </Link>
        <Link href="/preferences" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "10px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <span style={{ opacity: 0.6, fontSize: "16px" }}>⚖️</span> Preferences
        </Link>

        {conversations.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", paddingLeft: "16px", fontWeight: 600 }}>Recent Conversations</div>
            {conversations.slice(0, 5).map(c => (
              <button 
                key={c.id} 
                onClick={() => onSelectConversation(c.id)}
                className="focus-ring"
                style={{ 
                  width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "14px", 
                  color: conversationId === c.id ? "var(--text)" : "var(--text-dim)", 
                  padding: "10px 16px", fontSize: "13px", borderRadius: "10px", 
                  background: conversationId === c.id ? "rgba(255,255,255,0.03)" : "transparent",
                  border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}
              >
                <span style={{ opacity: 0.5, fontSize: "14px" }}>💬</span> {c.title || "Untitled"}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 8px 0 8px", borderTop: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }} onClick={async () => { await createClient().auth.signOut(); window.location.href = "/auth/login"; }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", color: "#fff", boxShadow: "0 0 15px rgba(168,85,247,0.3)" }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{displayName}</div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Free Plan</div>
        </div>
        <div style={{ color: "var(--muted)", fontSize: "16px" }}>›</div>
      </div>
    </aside>
  );
}
