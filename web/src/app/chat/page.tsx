"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

type Message = { id: string; content: string; sender_id: string; created_at: string };

export default function ChatPage() {
  const supabase = createSupabaseClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as any]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const send = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("chat_messages").insert({
      content: input,
      sender_id: user.id,
      couple_id: null, // TODO: set couple
    } as any);
    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="border rounded p-3 h-96 overflow-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-gray-500">{new Date(m.created_at).toLocaleTimeString()} </span>
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
        />
        <button onClick={send} className="bg-black text-white rounded px-4">
          Send
        </button>
      </div>
    </div>
  );
}
