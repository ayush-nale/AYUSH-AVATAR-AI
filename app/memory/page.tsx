import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MemoryPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto", color: "var(--text)" }}>
      <Link href="/dashboard" style={{ color: "var(--accent)", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="font-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>AI Memory Core</h1>
      
      <div className="glass-panel" style={{ padding: "32px" }}>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          This is what AI AYUSH has learned about you over time. 
        </p>

        {memories && memories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {memories.map((m: any) => (
              <div key={m.id} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                <div style={{ fontSize: "14px", color: "var(--text)", marginBottom: "8px" }}>{m.content}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{new Date(m.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "32px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "16px", opacity: 0.5 }}>🧠</span>
            <p style={{ margin: 0, color: "var(--muted)" }}>No memories stored yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
