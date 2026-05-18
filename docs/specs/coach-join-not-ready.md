# Spec: `/join/coach/[token]` "not ready" state

**Target repo:** `trykaiwa` (NOT this repo — this file is a handoff doc).

**Goal:** When a student visits a coach's invite link but the coach hasn't published a public site yet, show a price preview with a disabled "Join waitlist" CTA instead of the current generic "Coach site not ready" card.

## Context

- Route: `/join/coach/[token]` — backed by `public.coach_invites` in Supabase project `bvpholbckmpeqaibvzpz`.
- Current behavior (verified 2026-05-18): card titled "Coach site not ready", body "{coach_name} has not published a coach site yet", followed by a disabled "Subscription opens soon" button and a "Continue free" link.
- Reason this state exists: `users.username` is null for the coach, so there's no public `/coach/{username}` profile to forward to, and `coach_invites` doesn't auto-attach a paying relationship on its own.

## Find the file

Search the repo for the string `Coach site not ready`. That's the component to edit. Likely path: `src/routes/join/coach/[token]/+page.svelte`, with data loaded in the sibling `+page.server.ts` (or `+page.ts` if it's a client load).

## Data to load

In the load function, in addition to whatever it already fetches for the coach:

```ts
// Pull coach_monthly_price_cents from users for this invite's coach_id
const { data: coach } = await supabase
  .from('users')
  .select('display_name, username, coach_monthly_price_cents, coach_bio')
  .eq('id', invite.coach_id)
  .single();
```

Return `coach.coach_monthly_price_cents` to the page.

## Price formatting

```ts
function formatPrice(cents: number | null): string {
  if (cents == null) return 'TBD';
  return `$${Math.round(cents / 100)}`;
}
```

If you already have a currency util, use it. Don't introduce `Intl.NumberFormat` just for this — single use.

## UI changes

Replace the current "not ready" card body. Sketch:

```svelte
<div class="not-ready-card">
  <h2>Coach site not ready</h2>
  <p>{coach.display_name} has not published a coach site yet.</p>

  <div class="price-preview">
    <span class="price">{formatPrice(coach.coach_monthly_price_cents)}/mo</span>
    <span class="price-meta">when subscriptions open</span>
  </div>

  <button disabled class="cta-primary">Join waitlist</button>

  <a href="/onboarding" class="continue-free-link">Continue free</a>
</div>
```

### Style notes

- `.price` — large, prominent (e.g. `text-4xl font-semibold`). Keep the page's existing typographic scale; the screenshot shows a warm cream + dark brown palette, so match it.
- `.price-meta` — muted, small, sits directly under the price.
- `.cta-primary` — keep the existing disabled button styling (already looks right in the current screenshot).
- `.continue-free-link` — **demoted from full-width button to a small text link**. Suggested: `text-sm text-stone-500 underline` with normal hover. Sits below the disabled CTA with modest spacing.

## Copy

- Heading: keep `Coach site not ready`.
- Body: keep `{display_name} has not published a coach site yet.`
- Remove or shorten the second paragraph ("This invite no longer links you to the coach automatically. Paid coach access starts only after checkout on the coach's public site."). The new price preview + "Join waitlist" already conveys this. If you want to keep transparency, move it to a small `<p class="footnote">` below the free link.
- Disabled CTA: `Join waitlist`.
- Secondary link: `Continue free`.

## Waitlist backend (out of scope for this PR)

The button stays disabled in this change. When you build waitlist later:

- Table: `coach_waitlist (id uuid pk, coach_id uuid not null, user_id uuid null, email text null, created_at timestamptz default now())`. Either `user_id` or `email` must be present (CHECK constraint).
- Endpoint: `POST /api/coach-waitlist` taking `{ coach_id, email? }`. If the visitor is logged in, store `user_id` from the session; if anonymous, require email.
- Wire button onclick to a small modal (anonymous) or direct submit (logged-in) once the endpoint exists.

## Test plan

- Visit `https://trykaiwa.com/join/coach/hr7OR_B82Klp8ylUF0tRww` (Nikki's invite — `coach_monthly_price_cents` is null). Should show `TBD/mo`.
- Set `coach_monthly_price_cents = 1500` for any test coach in Supabase, visit their invite — should show `$15/mo`.
- Click "Join waitlist" — should do nothing (disabled).
- Click "Continue free" — should land on the regular onboarding flow.
- Verify the layout still looks right on mobile (Nikki is going to share this in WhatsApp).

## Acceptance

- [ ] Price line renders, falling back to `TBD/mo` when `coach_monthly_price_cents` is null.
- [ ] CTA text is "Join waitlist", button is disabled.
- [ ] "Continue free" is present but visually demoted to a small link.
- [ ] No regression for the "coach has a published site" branch (i.e. when `users.username` is set, behavior is unchanged).
