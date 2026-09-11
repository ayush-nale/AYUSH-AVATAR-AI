import { createClient } from "@/lib/supabase/server";

export async function getRelevantMemories(userId: string, query: string, limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("memories").select("id,memory,category,importance").eq("user_id", userId).order("importance", { ascending: false }).limit(50);
  if (error) throw error;
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  return (data ?? []).sort((a, b) => {
    const score = (text: string) => terms.reduce((sum, t) => sum + (text.toLowerCase().includes(t) ? 1 : 0), 0);
    return (score(b.memory) * 10 + b.importance) - (score(a.memory) * 10 + a.importance);
  }).slice(0, limit).map((m) => m.memory);
}
