# EverBloom MVP

A minimal, low-cost relationship app MVP: chat, games, P2P video, shared calendar, diaries, date ideas, with ads for free users and Stripe subscriptions for EverBloom+.

## Stack
- Next.js 14 (App Router, TypeScript, Tailwind)
- Supabase (Auth, Postgres, Realtime, Storage)
- WebRTC (peer-to-peer) with Supabase signaling (todo)
- Stripe (subscriptions)

## Local setup
1. Copy env vars:
   ```bash
   cp .env.example .env.local
   ```
   Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. For subscriptions, add Stripe keys.

2. Create Supabase project and run schema:
   - Open Supabase SQL editor and run `supabase/schema.sql`.

3. Install deps and run:
   ```bash
   npm install
   npm run dev
   ```

## Features
- Email/password auth (`/login`, `/signup`)
- Couple pairing (`/couple`) via code
- Real-time chat (`/chat`)
- P2P video prototype (`/video`) – add signaling next
- TicTacToe game (`/games`)
- Shared calendar (`/calendar`)
- Diaries (`/diary`)
- Date ideas (`/date-ideas`) + house ads (`/api/ads`)
- Stripe checkout endpoint (`/api/stripe/create-checkout`) – set `STRIPE_PRICE_ID`

## Notes on Ads vs Subscription
- Free users: banner ad on search pages and interstitial per search.
- Subscribers: remove ads and unlock all games (gating to be wired with subscription status).

## Next steps (production hardening)
- Implement Supabase Storage for limited photo uploads
- Add RLS contexts (couple scoping) in client queries
- Implement WebRTC signaling via `public.rtc_signals`
- Add Stripe webhook to update `public.subscriptions`
- Add entitlement gating middleware/server helpers
- Add PWA setup if mobile web wrapper is desired
