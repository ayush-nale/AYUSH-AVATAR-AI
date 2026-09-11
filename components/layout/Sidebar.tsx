import React from "react";
import type { Conversation } from "@/types/chat";
import type { AvatarId } from "@/types/avatar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { MessageSquare, Folder, Brain, User, Settings, Plus, LogOut, Bot, UserRound, Sparkles, MessageCircle } from "lucide-react";

export default function Sidebar({
  displayName,
  conversations,
  conversationId,
  onSelectConversation,
  onNewConversation,
  avatarId,
  setAvatarId
}: {
  displayName: string;
  conversations: Conversation[];
  conversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  avatarId: AvatarId;
  setAvatarId: (id: AvatarId) => void;
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
        <Plus size={18} strokeWidth={2.5} /> New Chat
      </button>

      {/* Navigation & Conversations */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflowY: "auto" }} className="scrollbar">
        
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", fontWeight: 500 }}>
          <MessageSquare size={18} opacity={0.8} /> Chat
        </Link>
        <Link href="/memory" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <Brain size={18} opacity={0.6} /> Memory
        </Link>
        <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <User size={18} opacity={0.6} /> Profile
        </Link>
        <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none", color: "var(--text-dim)", padding: "12px 16px", fontSize: "14px", borderRadius: "10px", fontWeight: 500 }}>
          <Settings size={18} opacity={0.6} /> Settings
        </Link>

        {/* Conversations Panel */}
        {conversations.length > 0 && (
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", paddingLeft: "16px", fontWeight: 600 }}>
              History
            </div>
            
            <details style={{ width: "100%" }}>
              <summary className="focus-ring" style={{ 
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "14px", 
                color: "var(--text-dim)", padding: "10px 16px", fontSize: "14px", borderRadius: "10px", 
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                listStyle: "none"
              }}>
                <Folder size={16} opacity={0.8} color="#a855f7" /> 
                <span style={{ fontWeight: 500 }}>Recent Conversations</span>
              </summary>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "16px" }}>
                {conversations.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => onSelectConversation(c.id)}
                    className="focus-ring"
                    style={{ 
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", 
                      color: conversationId === c.id ? "var(--text)" : "var(--text-dim)", 
                      padding: "8px 12px", fontSize: "13px", borderRadius: "8px", 
                      background: conversationId === c.id ? "rgba(255,255,255,0.03)" : "transparent",
                      border: "none", cursor: "pointer",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}
                  >
                    <MessageCircle size={13} opacity={conversationId === c.id ? 0.8 : 0.5} /> 
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.title || "Untitled"}</span>
                  </button>
                ))}
              </div>
            </details>
          </div>
        )}
      </nav>

      {/* Avatar Switcher */}
      <div style={{ marginTop: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", paddingLeft: "8px", fontWeight: 600 }}>Active Avatar</div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "4px" }}>
          {(["ayush", "xalia", "robot"] as AvatarId[]).map((id) => {
             let Icon = UserRound;
             if (id === "robot") Icon = Bot;
             if (id === "xalia") Icon = Sparkles;
             return (
              <button
                key={id}
                onClick={() => setAvatarId(id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: avatarId === id ? "rgba(168, 85, 247, 0.4)" : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 4px",
                  color: avatarId === id ? "#fff" : "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "12px",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                  fontWeight: 500
                }}
              >
                <Icon size={14} />
                {id}
              </button>
            )
          })}
        </div>
      </div>

      {/* User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 8px 0 8px", cursor: "pointer" }} onClick={async () => { await createClient().auth.signOut(); window.location.href = "/auth/login"; }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", color: "#fff", boxShadow: "0 0 15px rgba(168,85,247,0.3)" }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{displayName}</div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>Free Plan</div>
        </div>
        <LogOut size={16} color="var(--muted)" />
      </div>
    </aside>
  );
}
