import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = await req.json().catch(() => ({ userId: null }));
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID || "price_123", // TODO: set real price id
        quantity: 1,
      },
    ],
    metadata: userId ? { user_id: userId } : undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
