# AI AYUSH V1 Test Plan

## Authentication
- AUTH-001 valid signup -> account created
- AUTH-002 invalid email -> validation error
- AUTH-003 weak password -> rejected by form/provider
- AUTH-004 confirmation mismatch -> rejected
- AUTH-005 existing email -> provider error shown safely
- AUTH-006 valid login -> dashboard
- AUTH-007 wrong password -> rejected
- AUTH-008 unauthenticated `/dashboard` -> `/auth/login`
- AUTH-009 logout -> protected data unavailable
- AUTH-010 expired/invalid session -> authentication flow
- AUTH-011 user A cannot access user B conversation

## Database / RLS
- DB-001 own conversation read succeeds
- DB-002 other user's conversation read returns no row
- DB-003 own message insert succeeds
- DB-004 insert into other user's conversation is denied
- DB-005 unauthenticated private-table access is denied
- DB-006 own memory CRUD succeeds
- DB-007 other user's memory is inaccessible

## Chat
- CHAT-001 normal message returns response
- CHAT-002 empty message -> 400
- CHAT-003 unauthenticated -> 401
- CHAT-004 invalid/foreign conversation -> 404
- CHAT-005 oversized input -> 400
- CHAT-006 LLM outage -> safe 5xx response, no secret leakage
- CHAT-007 repeat-clicks are rate limited

## Voice
- MIC-001 permission granted -> recording
- MIC-002 permission denied -> friendly error
- MIC-003 missing microphone -> friendly error
- MIC-004 short audio -> graceful handling
- MIC-005 oversized audio -> rejected
- MIC-006 noisy audio -> provider handles it as supported
- TTS-001 valid text -> audio
- TTS-002 empty text -> 400
- TTS-003 long text -> validation/chunking policy
- TTS-004 provider outage -> safe error
- TTS-005 invalid voice ID -> safe error

## Avatar
- AVATAR-001 procedural fallback loads
- AVATAR-002 VRM loads when `public/avatar/ayush.vrm` exists
- AVATAR-003 model failure -> fallback remains available
- AVATAR-004 mobile Chrome loads without freezing UI
- AVATAR-005 desktop loads smoothly
- AVATAR-006 expressions map only to the allowed enum
- AVATAR-007 blinking works
- AVATAR-008 idle breathing/head movement works
- AVATAR-009 audio speaking state opens mouth

## Production smoke test
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. Deploy to Vercel
6. Set Supabase Auth redirect URLs
7. Set production secrets in Vercel
8. Create account and verify email
9. Send typed chat
10. Send microphone chat
11. Confirm audio playback
12. Confirm conversation persists after refresh
13. Confirm memory persists
14. Confirm no secret appears in browser source/network payloads
