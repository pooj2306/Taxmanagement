"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export function useCoupleId() {
  const supabase = createSupabaseClient();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setCoupleId(null);
          return;
        }
        const { data } = await supabase
          .from("couple_members")
          .select("couple_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (mounted) setCoupleId(data?.couple_id ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { coupleId, loading };
}
