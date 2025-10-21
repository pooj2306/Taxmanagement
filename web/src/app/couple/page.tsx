"use client";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { nanoid } from "nanoid/non-secure";

export default function CouplePage() {
  const supabase = createSupabaseClient();
  const [code, setCode] = useState("");
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    // load or create pairing code for current couple
  }, []);

  const createCouple = async () => {
    const pairing_code = nanoid(8);
    const { data: couple } = await supabase.from("couples").insert({ pairing_code }).select().single();
    if (!couple) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("couple_members").insert({ couple_id: couple.id, user_id: user.id });
    setCoupleId(couple.id);
    setCode(pairing_code);
  };

  const joinCouple = async () => {
    const { data: target } = await supabase.from("couples").select("id").eq("pairing_code", code).single();
    if (!target) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("couple_members").insert({ couple_id: target.id, user_id: user.id });
    setCoupleId(target.id);
  };

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Pair with your partner</h1>
      <button onClick={createCouple} className="bg-black text-white rounded px-4 py-2">Create pairing code</button>
      <div className="flex gap-2 items-center">
        <input className="border rounded p-2 flex-1" placeholder="Enter partner's code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button onClick={joinCouple} className="border rounded px-3 py-2">Join</button>
      </div>
      {coupleId && <p className="text-sm text-green-700">Paired! Couple ID: {coupleId}</p>}
    </div>
  );
}
