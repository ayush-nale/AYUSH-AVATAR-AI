"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPanel({ email, profile, memories }: { email: string; profile: { display_name: string | null; avatar_url: string | null } | null; memories: Array<{ id: string; memory: string; category: string; importance: number }> }) {
  const [name, setName] = useState(profile?.display_name ?? "Ayush");
  const [items, setItems] = useState(memories);
  const [memory, setMemory] = useState("");
  const [status, setStatus] = useState("");
  
  const { theme, toggleTheme } = useTheme();

  async function saveProfile() {
    const { error } = await createClient().from("profiles").update({ display_name: name }).eq("id", (await createClient().auth.getUser()).data.user?.id ?? "");
    setStatus(error ? error.message : "Profile saved.");
  }
  
  async function addMemory() {
    const r = await fetch("/api/memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memory, category: "general", importance: 5 }) });
    const d = await r.json();
    if (r.ok) { setItems([d.memory, ...items]); setMemory(""); setStatus("Memory saved."); } else setStatus(d.error ?? "Could not save memory.");
  }
  
  async function del(id: string) {
    const r = await fetch(`/api/memory/${id}`, { method: "DELETE" });
    if (r.ok) setItems(items.filter(x => x.id !== id));
  }

  return (
    <main style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "var(--accent)", fontWeight: 800 }}>AI AYUSH</div>
            <h1 style={{ margin: "6px 0" }}>Settings</h1>
            <div style={{ color: "var(--muted)" }}>{email}</div>
          </div>
          <Link className="focus-ring" href="/dashboard" style={{ textDecoration: "none", color: "var(--accent)" }}>← Back</Link>
        </div>

        <section className="glass" style={{ padding: 18, borderRadius: 22, marginBottom: 14, background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Appearance</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text)" }}>Dark Mode</span>
            <button 
              className="focus-ring" 
              onClick={toggleTheme} 
              style={{
                width: 50, height: 26, borderRadius: 13, background: theme === "dark" ? "var(--accent)" : "rgba(0,0,0,0.1)",
                border: "1px solid var(--panel-border)", position: "relative", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <div style={{
                position: "absolute", top: 2, left: theme === "dark" ? 26 : 2, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "all 0.2s"
              }}/>
            </button>
          </div>
        </section>

        <section className="glass" style={{ padding: 18, borderRadius: 22, marginBottom: 14, background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Profile</h2>
          <label style={{ display: "block" }}>Display name
            <input className="focus-ring" value={name} onChange={e => setName(e.target.value)} style={field} />
          </label>
          <button className="focus-ring" onClick={saveProfile} style={primary}>Save profile</button>
        </section>

        <section className="glass" style={{ padding: 18, borderRadius: 22, background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Long-term memory</h2>
          <p style={{ color: "var(--muted)" }}>Only save useful, non-sensitive details that improve future conversations.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <input className="focus-ring" value={memory} onChange={e => setMemory(e.target.value)} placeholder="e.g. Prefers simple explanations" style={field} />
            <button className="focus-ring" onClick={addMemory} disabled={!memory.trim()} style={primary}>Add</button>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {items.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.05)" }}>
                <div>
                  <div style={{color:"var(--text)"}}>{m.memory}</div>
                  <small style={{ color: "var(--muted)" }}>{m.category} · importance {m.importance}/10</small>
                </div>
                <button className="focus-ring" onClick={() => del(m.id)} style={{ border: 0, background: "transparent", color: "var(--danger)", cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        </section>
        
        {status && <div role="status" style={{ marginTop: 12, color: "var(--muted)" }}>{status}</div>}
        
        <section className="glass" style={{ padding: 18, borderRadius: 22, marginTop: 14, background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Avatar & voice</h2>
          <p style={{ color: "var(--muted)" }}>Add your authorized VRM avatar as <code>public/avatar/ayush.vrm</code>. For your personal voice, set <code>ELEVENLABS_API_KEY</code> and <code>ELEVENLABS_VOICE_ID</code>.</p>
        </section>
      </div>
    </main>
  );
}
const field = { width: "100%", margin: "6px 0 10px", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--panel-border)", background: "transparent", color: "var(--text)" } as const;
const primary = { padding: "11px 14px", borderRadius: 13, border: 0, background: "var(--accent)", color: "#ffffff", fontWeight: 800, cursor: "pointer" } as const;
