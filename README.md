# MonsterBit

MonsterBit is an original, browser-based monster-collecting RPG starter built with Vite, Phaser 3, and Supabase.

## Included in this starter

- Required email/password account flow using Supabase Auth.
- Profile creation through a database trigger.
- Top-down Phaser world with keyboard movement.
- Practice battle modal with a basic turn-based move loop.
- Starter MonsterDex interface.
- Initial PostgreSQL schema and Row Level Security policies.
- Cloudflare Pages configuration.

## Not included yet

This is a runnable foundation, not a finished MMORPG. The practice battle is client-side and does not grant rewards. Creature capture, persistent party management, authoritative battles, live multiplayer movement, trading, chat, quests, and gyms still need implementation. Do not advertise these as live features until they are built and tested.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A GitHub account
- A Cloudflare account for deployment

## 1. Install dependencies

```bash
npm install
```

## 2. Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. Open Project Settings → API.
3. Copy the Project URL and publishable/anon key.
4. Copy `.env.example` to `.env`.
5. Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

The publishable/anon key is intended for browser use with RLS enabled. Never use a service-role key in frontend code or commit secrets to GitHub.

## 3. Create database tables

Open Supabase → SQL Editor. Paste and run `supabase/migrations/001_initial_schema.sql`.

The migration creates profiles, starter monster catalog, player-owned creature and inventory tables, locations, quests, and baseline RLS. The profile trigger creates a trainer profile when an Auth user is registered.

In Supabase Authentication settings, configure your site's allowed redirect URLs. For local development, add `http://localhost:5173/**`. For production, add your Cloudflare Pages domain.

For easiest local testing, you may temporarily disable email confirmation in Supabase Auth settings. For a public release, keep email confirmation enabled and configure SMTP/email templates.

## 4. Run locally

```bash
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173.

Create an account, then log in. Move with WASD or arrow keys. Walk up to the guide on the path to open the practice battle. The MonsterDex tab shows the starter catalog.

If the app says setup is required, check `.env` and restart the dev server after changing it.

## 5. Build for production

```bash
npm run build
npm run preview
```

Vite outputs the static site to `dist/`.

## 6. Publish to GitHub

Create an empty GitHub repository named `monsterbit`, then run:

```bash
git init
git add .
git commit -m "Initial MonsterBit starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/monsterbit.git
git push -u origin main
```

Do not commit `.env`. The `.gitignore` already excludes it.

## 7. Deploy to Cloudflare Pages

Recommended: connect the GitHub repository in Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.

Use:
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

In Cloudflare Pages → Settings → Environment variables, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Add them for both Production and Preview environments, then redeploy.

Alternative with Wrangler:

```bash
npx wrangler login
npm run deploy
```

Set the Vite environment variables before building. For a public repo, use Cloudflare's dashboard variables and never commit secrets.

## 8. Mobile controls

The starter world currently supports keyboard input. Add an on-screen virtual joystick / directional pad before treating mobile gameplay as complete.

## Architecture decisions

- Phaser owns the real-time world canvas and scene lifecycle.
- Vite bundles the browser application.
- Supabase Auth handles identity.
- PostgreSQL stores persistent game state.
- RLS limits player-owned row access.
- Cloudflare Pages hosts the static client.
- Cloudflare Workers should become the trusted game API for capture, battle resolution, rewards, currency, and trades.

## Security and multiplayer implementation notes

Never let the browser decide trusted rewards or write directly to protected game state. Add server-side functions and strict validation before introducing capture, XP, currency, trading, or battle rewards. For real-time multiplayer movement, use an authoritative room service (for example, Cloudflare Durable Objects) or a carefully validated realtime design. Supabase Realtime presence is suitable for presence/chat prototypes, but it is not by itself an authoritative game simulation.

Before launch, add rate limits, abuse reporting/moderation, account recovery, backups, monitoring, privacy policy, and age-appropriate community safeguards.

## Suggested next development milestones

1. Add generated or commissioned original character sprites and a real tiled map.
2. Add mobile movement controls and collision layers.
3. Build the creature ownership / party APIs on the trusted server.
4. Implement a server-authoritative battle engine.
5. Add encounter tables and capture flow.
6. Add multiplayer presence and safe chat.
7. Add atomic trading and audit logs.
8. Add story, regions, gyms, quests, and progression.
