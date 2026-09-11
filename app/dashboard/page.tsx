import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
    const user = await requireUser();
    const supabase = await createClient();

    const [{ data: profile }, { data: conversations }] = await Promise.all([
        supabase
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .maybeSingle(),

        supabase
            .from("conversations")
            .select("id, user_id, title, created_at, updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(50),
    ]);

    return (
        <Dashboard
            user={{
                id: user.id,
                email: user.email ?? "",
            }}
            displayName={profile?.display_name ?? "Ayush"}
            initialConversations={conversations ?? []}
        />
    );
}