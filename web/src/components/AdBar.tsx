"use client";
import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "@/lib/subscriptions";
import { BannerAd } from "@/components/BannerAd";

export default function AdBar() {
  const [showAds, setShowAds] = useState(false);
  useEffect(() => {
    (async () => {
      const status = await getSubscriptionStatus();
      setShowAds(status !== "active");
    })();
  }, []);
  if (!showAds) return null;
  return (
    <div className="mx-auto max-w-5xl p-2">
      <BannerAd />
    </div>
  );
}
