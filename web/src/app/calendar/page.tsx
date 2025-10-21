"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function CalendarPage() {
  const supabase = createSupabaseClient();
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("events").select("*").order("event_date");
      setEvents(data || []);
    };
    load();
  }, [supabase]);

  const add = async () => {
    await supabase.from("events").insert({ title, event_date: date } as any);
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
