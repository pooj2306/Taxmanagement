"use client";
import { useEffect, useState } from "react";

export function BannerAd() {
  type Ad = { id: string; title: string; body: string; imageUrl?: string; linkUrl?: string };
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined = undefined;
    const load = async () => {
      try {
        const res = await fetch("/api/ads?position=banner");
        const json: Ad = await res.json();
        setAd(json);
      } catch {}
    };
    load();
    timer = setInterval(load, 30000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  if (!ad) return null;
  return (
    <a href={ad.linkUrl} className="block border rounded p-2 text-sm bg-amber-50 hover:bg-amber-100">
      <div className="font-medium">{ad.title}</div>
      <div className="text-xs text-gray-700">{ad.body}</div>
    </a>
  );
}
