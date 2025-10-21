"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function DiaryPage() {
  const supabase = createSupabaseClient();
  const [entries, setEntries] = useState<any[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("diary_entries").select("*").order("created_at", { ascending: false });
      setEntries(data || []);
    };
    load();
  }, [supabase]);

  const add = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("diary_entries").insert({ body, author_id: user.id } as any);
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
