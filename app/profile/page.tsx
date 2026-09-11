import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto", color: "var(--text)" }}>
      <Link href="/dashboard" style={{ color: "var(--accent)", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="font-heading" style={{ fontSize: "32px", marginBottom: "32px" }}>User Profile</h1>
      
      <div className="glass-panel" style={{ padding: "32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>Email</label>
          <div style={{ fontSize: "16px" }}>{user.email}</div>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>Display Name</label>
          <div style={{ fontSize: "16px" }}>{profile?.display_name || "Not set"}</div>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", color: "var(--muted)", marginBottom: "8px" }}>Plan</label>
          <div style={{ fontSize: "16px", color: "var(--accent2)" }}>Free Tier</div>
        </div>
      </div>
    </div>
  );
}
