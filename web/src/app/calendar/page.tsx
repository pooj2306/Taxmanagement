"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useCoupleId } from "@/lib/useCouple";

export default function CalendarPage() {
  const supabase = createSupabaseClient();
  const { coupleId } = useCoupleId();
  type EventRow = { id: string; title: string; event_date: string };
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("events").select("id, title, event_date").eq("couple_id", coupleId).order("event_date");
      setEvents((data as EventRow[]) || []);
    };
    if (coupleId) load();
  }, [supabase, coupleId]);

  const add = async () => {
    if (!coupleId) return;
    await supabase.from("events").insert({ title, event_date: date, couple_id: coupleId });
    setTitle("");
    setDate("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Shared Calendar</h1>
      <div className="flex gap-2">
        <input className="border rounded p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border rounded p-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={add} className="bg-black text-white rounded px-4">Add</button>
      </div>
      <ul className="space-y-1">
        {events.map((e) => (
          <li key={e.id} className="text-sm">{e.event_date}: {e.title}</li>
        ))}
      </ul>
    </div>
  );
}
