import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID || "price_123", // TODO: set real price id
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
