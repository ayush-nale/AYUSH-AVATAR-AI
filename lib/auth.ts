import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/auth/login");
  return user;
}
