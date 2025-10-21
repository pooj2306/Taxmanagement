"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useCoupleId } from "@/lib/useCouple";

type Surprise = {
  id: string;
  title: string | null;
  body: string;
  release_at: string;
  is_delivered: boolean;
};

export default function SurprisesPage() {
  const supabase = createSupabaseClient();
  const { coupleId } = useCoupleId();
  const [scheduled, setScheduled] = useState<Surprise[]>([]);
  const [available, setAvailable] = useState<Surprise[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [releaseAt, setReleaseAt] = useState("");

  const load = async () => {
    if (!coupleId) return;
    const { data } = await supabase
      .from("surprises")
      .select("*")
      .eq("couple_id", coupleId)
      .order("release_at", { ascending: true });
    const all = (data as Surprise[]) || [];
    const nowIso = new Date().toISOString();
    setScheduled(all.filter((s) => s.release_at > nowIso));
    setAvailable(all.filter((s) => !s.is_delivered && s.release_at <= nowIso));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  const create = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !coupleId || !releaseAt) return;
    await supabase.from("surprises").insert({
      couple_id: coupleId,
      author_id: user.id,
      title,
      body,
      release_at: new Date(releaseAt).toISOString(),
    });
    setTitle("");
    setBody("");
    setReleaseAt("");
    await load();
  };

  const markDelivered = async (id: string) => {
    await supabase.from("surprises").update({ is_delivered: true }).eq("id", id);
    await load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Surprise Vault & Timed Letters</h1>
      <div className="space-y-2 border rounded p-3">
        <div className="font-medium">Schedule a letter</div>
        <input className="border rounded p-2 w-full" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="border rounded p-2 w-full" placeholder="Write your letter..." value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Release at</label>
          <input className="border rounded p-2" type="datetime-local" value={releaseAt} onChange={(e) => setReleaseAt(e.target.value)} />
          <button onClick={create} className="bg-black text-white rounded px-4 py-2">Schedule</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="font-medium mb-2">Scheduled</div>
          <ul className="space-y-2">
            {scheduled.map((s) => (
              <li key={s.id} className="border rounded p-3">
                <div className="text-xs text-gray-500">{new Date(s.release_at).toLocaleString()}</div>
                <div className="font-medium">{s.title || "(No title)"}</div>
                <div className="text-sm text-gray-700 line-clamp-2">{s.body}</div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Available to read</div>
          <ul className="space-y-2">
            {available.map((s) => (
              <li key={s.id} className="border rounded p-3">
                <div className="text-xs text-gray-500">Released {new Date(s.release_at).toLocaleString()}</div>
                <div className="font-medium">{s.title || "(No title)"}</div>
                <div className="text-sm whitespace-pre-wrap">{s.body}</div>
                <button onClick={() => markDelivered(s.id)} className="mt-2 text-xs border rounded px-2 py-1">Mark delivered</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
