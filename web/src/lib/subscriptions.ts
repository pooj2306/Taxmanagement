"use client";
import { createSupabaseClient } from "@/lib/supabaseClient";

export async function getSubscriptionStatus(): Promise<"active" | "inactive"> {
  const supabase = createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "inactive";
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.status === "active" ? "active" : "inactive";
}
