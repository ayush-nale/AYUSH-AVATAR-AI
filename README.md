# AI AYUSH — V1

A production-minded personal AI avatar web application built with Next.js 16, Supabase, PostgreSQL, OpenAI, ElevenLabs (optional), Three.js, React Three Fiber and VRM.

## What is included

- Email/password authentication with Supabase Auth
- Cookie-based SSR auth + protected dashboard
- PostgreSQL schema + Row Level Security policies
- Chat + persistent conversation history
- Long-term memory CRUD and relevant-memory retrieval
- Microphone recording + server-side STT
- Server-side TTS with optional ElevenLabs personal voice adapter and OpenAI fallback
- Procedural chest-up avatar fallback, with optional VRM avatar loading
- Blinking, eye movement, breathing, head idle, speaking state and amplitude lip-sync
- Safe predefined avatar expressions
- Rate limiting and input validation
- Responsive desktop/mobile UI
- Error/loading/empty states
- Vitest unit tests
- Vercel-friendly production deployment

## Prerequisites

- Node.js 20.9+
- A Supabase project
- OpenAI API key for real AI/STT/TTS
- Optional ElevenLabs API key + voice ID for a cloned personal voice
- Optional personal VRM file at `public/avatar/ayush.vrm`

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Add the required environment variables.
5. Install packages: `npm install`.
6. Start: `npm run dev`.
7. Open http://localhost:3000.

## Supabase URL settings

In Supabase Auth settings, set Site URL to your production URL and add the local callback URL:

`http://localhost:3000/auth/callback`

For production, add:

`https://YOUR_DOMAIN/auth/callback`

## Personal voice

Set both `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` to use the authorized voice you own. The app will fall back to OpenAI TTS if those are absent.

## Personal avatar

Put your compatible VRM model at `public/avatar/ayush.vrm`. The app uses the VRM when present and falls back to a procedural chest-up avatar when it is not.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Security notes

- Provider secrets are server-only.
- Browser-supplied user IDs are not trusted.
- User-owned tables are protected by RLS.
- Conversation ownership is checked on every API operation.
- Audio is processed in memory and not stored by this app.
- Do not commit `.env.local` or personal avatar assets unless you explicitly intend to.
