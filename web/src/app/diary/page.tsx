"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useCoupleId } from "@/lib/useCouple";

export const dynamic = "force-dynamic";

export default function DiaryPage() {
  const supabase = createSupabaseClient();
  const { coupleId } = useCoupleId();
  type Entry = { id: string; body: string; created_at: string };
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("id, body, created_at")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      setEntries((data as Entry[]) || []);
    };
    if (coupleId) load();
  }, [supabase, coupleId]);

  const add = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!coupleId) return;
    await supabase.from("diary_entries").insert({ body, author_id: user.id, couple_id: coupleId });
    setBody("");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Diaries</h1>
      <div className="flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Write something..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button onClick={add} className="bg-black text-white rounded px-4">Publish</button>
      </div>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="border rounded p-3">
            <div className="text-xs text-gray-500">{new Date(e.created_at).toLocaleString()}</div>
            <div>{e.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
