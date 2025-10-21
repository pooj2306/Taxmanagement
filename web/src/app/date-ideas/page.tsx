"use client";
import { useEffect, useState } from "react";

export default function DateIdeasPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [ad, setAd] = useState<any | null>(null);

  useEffect(() => {
    // Load a banner ad
    fetch(`/api/ads?position=banner`).then((r) => r.json()).then(setAd).catch(() => {});
  }, []);

  const search = async () => {
    // Placeholder: local curated ideas; can swap to Google Places API later
    const ideas = [
      { title: "Picnic in the park", city: "nearby" },
      { title: "Board game cafe", city: "nearby" },
      { title: "Sunset walk", city: "nearby" },
    ];
    setResults(ideas.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())));
    // Show interstitial ad after each search for free users
    await fetch(`/api/ads?position=interstitial`);
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
      <ul className="space-y-1">
        {results.map((r, idx) => (
          <li key={idx} className="text-sm">{r.title}</li>
        ))}
      </ul>
    </div>
  );
}
