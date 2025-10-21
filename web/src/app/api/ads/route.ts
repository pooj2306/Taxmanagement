import { NextResponse } from "next/server";

// Simple house-ads API: choose a random active ad from a static list for MVP
// Replace with DB-backed ads (Supabase table) later

const bannerAds = [
  { id: "b1", title: "Upgrade to EverBloom+", body: "Unlock all games, no ads.", imageUrl: "/logo.svg", linkUrl: "/pricing" },
  { id: "b2", title: "Gift Vault", body: "Schedule a surprise letter.", imageUrl: "/vercel.svg", linkUrl: "/surprises" },
];

const interstitialAds = [
  { id: "i1", title: "Try Date Ideas", body: "Find places near you.", imageUrl: "/vercel.svg", linkUrl: "/date-ideas" },
  { id: "i2", title: "Video Chat", body: "Connect instantly.", imageUrl: "/vercel.svg", linkUrl: "/video" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position") || "banner";
  const list = position === "interstitial" ? interstitialAds : bannerAds;
  const ad = list[Math.floor(Math.random() * list.length)];
  return NextResponse.json(ad);
}
