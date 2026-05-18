---
name: coach-link
description: Build, look up, and validate trykaiwa.com coach links — both student-join invites (coach_invites → /join/coach/{token}) and new-coach onboarding (coach_onboarding_tokens → /join/start-coaching/{token}). Use when the user asks for a "coach link", "invite link", "join link", "teacher link", or wants to send a coach/teacher a URL to share with their students.
---

# Coach link skill

Authoritative source of truth for trykaiwa.com coach-related URLs and how to mint, fetch, and validate the tokens that back them.

## Token → URL mapping

Verified against production PostHog pageviews and the Supabase `Kaiwa-PROD` project (id `bvpholbckmpeqaibvzpz`).

| Source table | Purpose | URL pattern |
|---|---|---|
| `public.coach_invites` | An existing coach shares a link with **their students** so they can sign up under that coach | `https://trykaiwa.com/join/coach/{token}` |

> **Important caveat for `coach_invites`:** Visiting the link does **not** auto-attach the student to the coach. Paid coach access requires checkout on the coach's public site. If the coach hasn't published a site yet (`users.username` null), the link shows a "Coach site not ready" state — the visitor can still continue free, but they won't be tied to that coach until they pay. Describe it as "join Nikki's program" rather than "this link gives you Nikki as your coach" in outbound copy.
| `public.coach_onboarding_tokens` | Onboard a **brand-new** coach (bio + website + socials pre-filled, editable) | `https://trykaiwa.com/join/start-coaching/{token}` |

`/join/start-coaching/{token}` is **wrong** for a `coach_invites` token. Pick the URL pattern by which table the token came from, not by what the user said.

There is also `/coach/{username}` for a coach's public profile, but that requires `users.username` to be set. If `username` is `NULL`, fall back to the invite link.

## Default base URL

`https://trykaiwa.com` — do not localize, do not add a trailing slash before the token. Override only if the user explicitly asks for staging/preview.

## UTM params

Append only when the user asks (e.g. "for the warm email"). Standard set:

- `utm_source` — where the link will be sent (`email`, `whatsapp`, `instagram`, `loom`)
- `utm_medium` — `referral` for outbound coach comms, `social` for posts
- `utm_campaign` — short slug, e.g. `coach-pilot-2026q2`, `nikki-pilot`

Encode with `encodeURIComponent`. Never wrap the bare token; it's URL-safe already.

## Workflows

### 1. Build a URL from a known token

If the user hands you a token and tells you the kind:

- invite (student-join) → `https://trykaiwa.com/join/coach/{token}`
- onboarding (new coach) → `https://trykaiwa.com/join/start-coaching/{token}`

If they hand you a token but don't say which kind, look it up first (workflow 4).

### 2. Fetch a coach's latest active invite token

Use the Supabase MCP (`mcp__…__execute_sql`) against project `bvpholbckmpeqaibvzpz`:

```sql
SELECT ci.token, ci.label, ci.status, ci.created_at
FROM coach_invites ci
JOIN users u ON u.id = ci.coach_id
WHERE (u.display_name ILIKE '%{name}%' OR u.email ILIKE '%{email}%')
  AND ci.status = 'active'
ORDER BY ci.created_at DESC
LIMIT 5;
```

Pick the row whose `label` best matches the user's intent (e.g. "pilot", "primary"). Build the URL with workflow 1.

### 3. Create a new `coach_invites` token end-to-end (mutating)

Confirm with the user before inserting. Then:

```sql
INSERT INTO coach_invites (coach_id, token, label, status)
VALUES (
  '{coach_user_id}',
  encode(gen_random_bytes(16), 'base64')
    -- strip URL-unsafe chars to match existing tokens (22 chars, base64url-ish)
    ,
  '{label}',
  'active'
)
RETURNING id, token, label, created_at;
```

If `gen_random_bytes` isn't ideal, use the token shape already in production (22-char URL-safe base64). Example existing tokens: `hr7OR_B82Klp8ylUF0tRww`, `zYIcMnCk4RBDhaFNprebmA`. Generate client-side via `crypto.randomBytes(16).toString('base64url')` if you prefer deterministic shape, then `INSERT … VALUES ('{coach_id}', '{token}', '{label}', 'active') RETURNING token`.

Return the share link built from the new token.

### 4. Validate a token

```sql
SELECT 'coach_invites' AS table, token, status, label, coach_id, created_at
FROM coach_invites WHERE token = '{token}'
UNION ALL
SELECT 'coach_onboarding_tokens' AS table, token, status::text, coach_name AS label, accepted_by_user_id AS coach_id, created_at
FROM coach_onboarding_tokens WHERE token = '{token}';
```

A zero-row result means the token doesn't exist — do not return a URL, tell the user. A non-active status (revoked / expired / accepted) means the link will 4xx; warn the user.

## Quick reference

- Supabase project id: `bvpholbckmpeqaibvzpz` (`Kaiwa-PROD`, org `Kaiwa-AI`)
- Domain: `trykaiwa.com`
- Coach status check: `users.is_coach` boolean. A coach with no `coach_invites` row yet cannot share a student-join link until one is created.
- Public profile URL (`/coach/{username}`) only works when `users.username` is non-null.

## Output style

When returning a link to the user, use this format:

```
Link: https://trykaiwa.com/join/coach/{token}
Coach: {display_name}
Token source: coach_invites (label: "{label}", created {date})
```

Skip the metadata block if the user just wanted the bare URL.
