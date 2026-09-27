import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function AdminPage() {
    const user = await requireUser();
    
    if (user.email !== "ayushnale@gmail.com") {
        redirect("/dashboard");
    }

    const supabase = await createClient();

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, display_name, admin_instructions")
        .order("display_name");

    return (
        <main className="shell" style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
            <header style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>Admin Platform</h1>
                    <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "14px" }}>Manage AI instructions for other users.</p>
                </div>
                <Link href="/dashboard" className="focus-ring glass-panel" style={{ padding: "8px 16px", borderRadius: "12px", color: "var(--text)", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                    Back to Dashboard
                </Link>
            </header>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="scrollbar">
                {error ? (
                    <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "12px" }}>
                        Database Error: Did you run the SQL script? ({error.message})
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                        {profiles?.map(p => (
                            <div key={p.id} className="glass-panel" style={{ padding: "20px", borderRadius: "16px" }}>
                                <div style={{ fontWeight: 600, fontSize: "18px", marginBottom: "4px" }}>
                                    {p.display_name || "Unknown User"} {p.id === user.id && <span style={{ fontSize: "12px", background: "var(--accent)", color: "#000", padding: "2px 8px", borderRadius: "99px", marginLeft: "8px" }}>You</span>}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "16px", fontFamily: "monospace" }}>{p.id}</div>
                                
                                <form action={async (formData) => {
                                    "use server";
                                    const sb = await createClient();
                                    await sb.from("profiles").update({ admin_instructions: formData.get("instructions") }).eq("id", p.id);
                                    revalidatePath("/admin");
                                }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-dim)", fontWeight: 600, marginBottom: "8px", display: "block" }}>Custom AI Instructions:</label>
                                    <textarea 
                                        name="instructions"
                                        defaultValue={p.admin_instructions || ""}
                                        placeholder="e.g. This is Ayush's brother. Call him Chotu."
                                        style={{ width: "100%", height: "80px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px", color: "var(--text)", fontSize: "13px", resize: "none", marginBottom: "12px" }}
                                    />
                                    <button type="submit" className="focus-ring hover:bg-white/10" style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text)", borderRadius: "8px", cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}>
                                        Save Instructions
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
