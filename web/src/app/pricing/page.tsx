"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function PricingPage() {
  const supabase = createSupabaseClient();
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: user?.id || null }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.url) window.location.href = json.url;
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">EverBloom+</h1>
      <ul className="list-disc pl-5 text-sm text-gray-700">
        <li>No ads</li>
        <li>All games unlocked</li>
        <li>Surprise gift vault & timed letters</li>
      </ul>
      <button onClick={checkout} disabled={loading} className="bg-black text-white rounded px-4 py-2">
        {loading ? "Redirecting..." : "Subscribe"}
      </button>
    </div>
  );
}
