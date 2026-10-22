# Hiro's personal site

SvelteKit personal site, managed with pnpm.

## Development

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Start the site with `pnpm dev`.

## Validation

- `pnpm test` is the routine, memory-bounded validation command. It runs type checking and cached source linting sequentially.
- `pnpm test:release` adds the production Vercel build. Use it before publishing, not after every edit.
- `pnpm check:watch` keeps type checking open while editing.
- `pnpm format:check` checks formatting separately; it is not part of the fast test gate while existing content is brought onto one formatting baseline.

The project intentionally uses one package manager (`pnpm`) and one lockfile (`pnpm-lock.yaml`).

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Contact delivery

The contact form posts to `/api/contact`. Set `RESEND_API_KEY` and `RESEND_FROM`
(a sender on a Resend-verified domain) in Vercel for each deployed environment.
Messages go to the address in `CONTACT.emailParts`, with the visitor's address as
`reply_to`. Resend acceptance is required before showing success; this is not an
inbox-delivery receipt. Failed attempts retain the form values for retry.
Identical messages use a stable idempotency key to prevent duplicate retries for
24 hours. The endpoint validates and bounds input, rejects other browser origins,
and uses a honeypot plus a best-effort per-instance limit of five requests/minute/IP.
Use the Vercel firewall if distributed spam becomes a problem.

## Analytics

PostHog was already installed in `src/app.html`; the existing personal-site project
key is retained. It now tracks client-side navigation and explicit events:

- `contact_submit_started`, `contact_submit_succeeded`, `contact_submit_failed`
- `newsletter_submit_started`, `newsletter_submit_succeeded`, `newsletter_submit_failed`
- `outbound_link_clicked` (destination origin/path only), `contact_email_copied`

Only `hirokuwana.com` and `www.hirokuwana.com` initialize tracking, so local and
preview visits do not pollute production data. Autocapture and session replay are
disabled to avoid collecting private form/tool content. No names, email addresses,
or messages are passed to these events or used to identify visitors. Pageviews
retain PostHog's standard referral/campaign metadata. People who write identify
themselves in the email sent to Hiro; anonymous browsing does not reveal names.
To verify after deployment, open the personal-site project's live events, navigate
between pages and check an outbound click. Verify a real contact delivery separately.
The currently connected Kaiwa PROD project is a different project.

## Kaiwa figures and theme

`KAIWA_METRICS` in `src/data/constants.ts` is the single snapshot for visible and
structured-data milestones (owner-reported, updated September 15, 2026). A future
live integration must define the organic-traffic reporting window and signup
source before replacing this snapshot. An all-time high is not a current monthly
visitor count.

The existing moss-paper, vermilion, and dark-ink palette is preserved. The theme
switch uses a 480ms right-to-left View Transition plus a sun/moon dial; unsupported
browsers and reduced-motion preferences receive an immediate theme change.
