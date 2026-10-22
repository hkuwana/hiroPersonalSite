# Content engine — Design Spec

Date: 2026-08-16
Status: proposed, awaits Hiro's review
Depends on: `2026-08-16-builder-record-design.md`

## Goal

The site must turn real Kaiwa work into public evidence, and must capture the
readers who want more of it. The site must not sell. Any paid offer travels by
email, never by page.

## The money rule (decided)

Hiro chose the no-price option. One identity, two surfaces:

- `hirokuwana.com` is the record and the notebook. It shows no price, no
  offer, and no cohort page.
- The email list carries any offer. A paid cohort starts as a private
  invitation to readers who reply.

The investor read stays clean. The validation engine still runs.

## The conflict this spec resolves

An older strategy chat proposed a course, a membership, and a $1,000 lifetime
pass. `PRODUCT.md` forbids store energy and availability signals. Four parts of
that chat survive the rule, and the prices do not:

1. The capture loop. One artifact from real work becomes one public post.
2. The evidence rule. Each piece reports a real decision, result, or mistake.
3. The email list. The site still has no signup form and no subscriber route.
4. The validation order. Write first, measure demand, then build a product.

## Changes

### 1. `PRODUCT.md` (small)

Add one line under Strategic principles:

> No price, no offer, and no cohort page ship on this site. The email list
> carries any paid offer.

### 2. `PERSONAL_BRAND_STRATEGY.md` (rewrite)

The current file contradicts `PRODUCT.md` in four places: the audience order,
the hero tagline decision, the "Reluctant Technologist" brand, and a newsletter
build that never shipped. The rewrite keeps the Voice and Tone section, which
still holds. New structure:

1. Purpose and the money rule.
2. Audience, in the `PRODUCT.md` order: investors, peers, readers.
3. Positioning sentence — a voice slot, not drafted by Claude.
4. Voice and tone — kept word for word.
5. The capture loop.
6. Three pillars.
7. Cadence and budget.
8. The list.
9. Metrics.
10. Appendix A: superseded decisions.
11. Appendix B: the essay backlog.

**The capture loop:**

1. Hiro captures one artifact during real Kaiwa work: a prompt, a decision, an
   automation, or a mistake.
2. The artifact becomes one public post.
3. The strongest posts become a workflow guide on `/ai-guides`.
4. Readers reply to the list. Their questions set the next post.
5. When one demand pattern repeats, Hiro tests a paid cohort by email only.

**Three pillars.** The old plan had four pillars and cost 10-12 hours per
month. The budget is three hours per week. "AI for Educators" becomes a topic
inside the three pillars, not a pillar of its own.

| Tag | Label | Content | Cadence |
| --- | --- | --- | --- |
| `build` | BUILD NOTE | a decision, result, or mistake from Kaiwa | 2 per month |
| `workflow` | WORKFLOW | a reusable prompt, template, or checklist | 1 per month |
| `essay` | ESSAY | a long argument | 1 per month |

**Metrics:** replies to the list, repeat readers, qualified conversations, and
artifact reuse. Follower count is not a metric.

### 3. Essay categories (small)

- Frontmatter gains `category: build | workflow | essay`. The field is
  optional, so no existing file breaks.
- `src/data/constants.ts` gains `ESSAY_CATEGORIES`, a map from the tag to its
  label. The labels are functional text, so Claude writes them.
- `src/routes/essays/+page.ts` reads the field and passes it through.
- The essay card and the essay detail page render a mono microlabel, in the
  register of `DESIGN.md`. No badge renders when the field is absent.
- The four existing essays get a category: `build-your-own-autoresearch` is
  `workflow`, and the other three are `essay`.
- The labels are English only, because the essays are English only.
- No filter UI. Four essays do not need one.

### 4. Email capture (core)

**Component.** `src/lib/components/NewsletterSignup.svelte`. A thin ledger row
in the site register: a hairline `--rule`, a mono microlabel, the promise line,
one email input, and one submit in `--shu`. No card, no modal, no popup, and no
subscriber counter.

**Visibility rule.** `src/data/constants.ts` gains `NEWSLETTER.promise`, a voice
slot that starts empty. The component renders nothing while the slot is empty.
The rule matches the record section in the builder-record spec.

**Placement.** Two surfaces only:

- the end of each essay (`src/routes/essays/[slug]/+page.svelte`), source
  `essay`
- the end of `/ai-guides`, source `ai-guides`

The hero, the home page, and the footer get no signup. `PRODUCT.md` forbids
engagement mechanics.

**API route.** `src/routes/api/subscribe/+server.ts` with
`export const prerender = false`. The global `prerender = true` in
`src/routes/+layout.ts` makes the opt-out necessary.

Behavior for a POST of `{ email, source, website }`:

1. The `website` field is a honeypot. A filled honeypot returns 200 and writes
   nothing.
2. The route trims the email, lowercases it, and limits it to 254 characters.
3. An invalid email returns 400.
4. A duplicate email returns 200 with the normal body. The response must not
   disclose list membership.
5. Resend sends the welcome email. A Resend failure logs and still returns 200,
   because the subscription matters more than the welcome mail.
6. An unexpected database error returns 500.

**Server clients.** `src/lib/server/supabase.ts` and `src/lib/server/resend.ts`
read `$env/dynamic/private`. Each exports `null` when its variables are absent,
and the route returns 503. Local development and previews stay alive.

**Unsubscribe.** `src/routes/unsubscribe/+page.server.ts` plus a small
`+page.svelte`, both with `export const prerender = false`. The load function
reads `?token=`, sets `subscribed` to false, and the page confirms the result
in the site register.

**Schema.**

```sql
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed boolean not null default true,
  source text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index idx_subscribers_active on subscribers (subscribed) where subscribed;
create unique index idx_subscribers_token on subscribers (unsubscribe_token);
alter table subscribers enable row level security;
```

Row level security stays on, with no policy for the anon role. The server route
uses the service role key instead.

**Security note.** The service role key bypasses row level security. The key
lives in `$env/dynamic/private` and in `src/lib/server/` only. It must never
reach a client bundle.

**Consent.** Single opt-in, per the earlier decision in
`PERSONAL_BRAND_STRATEGY.md`. Every email carries the unsubscribe link.

**Accepted risk.** The route has a honeypot and no rate limit. Vercel gives no
built-in limiter, and a limiter needs another store. A limiter comes later if
abuse appears.

### 5. `.env.example` (small)

The current file names `SUPABASE_ANON_KEY` and a `choice` column that this
schema does not have. Replace the key with `SUPABASE_SERVICE_ROLE_KEY`, and
correct the table comment.

## Voice slots

Claude adds these rows to `COPY_WORKSHEET.md`, and Hiro writes the text:

| Slot | Job | Limit |
| --- | --- | --- |
| `newsletter.promise` | tells the reader what arrives, and how often | 90 characters |
| `newsletter.welcome` | the welcome email body | 4 sentences |
| `strategy.positioning` | the one-sentence positioning line | 1 sentence |

The worksheet does not exist yet. The builder-record work creates it. This work
creates the file if the builder-record work has not yet run.

## Tests

The repository has no unit test runner. `tests/test.ts` is an empty Playwright
stub. The email helpers hold the only real logic, so this work adds `vitest`
and `src/lib/server/email.test.ts`, which covers normalization, the length
limit, and the invalid cases.

## Verification

`pnpm check`, `pnpm lint`, `pnpm build`, and `pnpm vitest run` must pass. A
manual check covers one essay page in both themes, a real subscribe request, a
duplicate subscribe request, and one unsubscribe link.

## Sequence

1. The builder-record spec ships first. The record is the proof that the
   content claims rest on.
2. Essay categories. No voice text, and no dependency.
3. Email capture. Needs a Supabase project, three variables, and the promise
   line.
4. The strategy rewrite. Possible at any point.

## Out of scope

- Prices, a cohort page, a product ladder, and a `/subscribe` page.
- A visual restyle of `/essays`, which still uses DaisyUI classes instead of
  the `DESIGN.md` tokens.
- A category filter, an essay series, and a `/now` page.
- Social cross-posts and any scheduler.
