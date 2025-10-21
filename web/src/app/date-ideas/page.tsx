"use client";
import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "@/lib/subscriptions";

export default function DateIdeasPage() {
  const [query, setQuery] = useState("");
  type Idea = { title: string; city: string };
  type Ad = { id: string; title: string; body: string; imageUrl?: string; linkUrl?: string };
  const [results, setResults] = useState<Idea[]>([]);
  const [ad, setAd] = useState<Ad | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    // Load a banner ad
    fetch(`/api/ads?position=banner`).then((r) => r.json()).then((json: Ad) => setAd(json)).catch(() => {});
  }, []);

  const search = async () => {
    // Placeholder: local curated ideas; can swap to Google Places API later
    const ideas: Idea[] = [
      { title: "Picnic in the park", city: "nearby" },
      { title: "Board game cafe", city: "nearby" },
      { title: "Sunset walk", city: "nearby" },
    ];
    setResults(ideas.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())));
    // Show interstitial ad after each search for free users
    const status = await getSubscriptionStatus();
    if (status !== "active") {
      setShowInterstitial(true);
      await fetch(`/api/ads?position=interstitial`);
      setTimeout(() => setShowInterstitial(false), 1200);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Date Ideas</h1>
      {ad && (
        <div className="border rounded p-3 bg-amber-50">
          <div className="font-medium">{ad.title}</div>
          <div className="text-sm">{ad.body}</div>
        </div>
      )}
      <div className="flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={search} className="bg-black text-white rounded px-4">Search</button>
      </div>
      {showInterstitial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded p-6 max-w-sm text-center space-y-2">
            <div className="font-medium">Sponsored</div>
            <div className="text-sm text-gray-600">Showing results...</div>
          </div>
        </div>
      )}
      <ul className="space-y-1">
        {results.map((r, idx) => (
          <li key={idx} className="text-sm">{r.title}</li>
        ))}
      </ul>
    </div>
  );
}
