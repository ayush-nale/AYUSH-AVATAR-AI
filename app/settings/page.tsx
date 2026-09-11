import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SettingsPanel from "@/components/SettingsPanel";
export default async function SettingsPage(){const user=await requireUser();const supabase=await createClient();const {data:memories}=await supabase.from("memories").select("id,memory,category,importance,created_at,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false});const {data:profile}=await supabase.from("profiles").select("display_name,avatar_url").eq("id",user.id).maybeSingle();return <SettingsPanel email={user.email??""} profile={profile} memories={memories??[]}/>}
