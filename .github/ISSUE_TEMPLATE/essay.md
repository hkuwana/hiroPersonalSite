---
name: Essay
about: Draft and publish a new essay
title: '[Essay] '
labels: essay
---

## Title

<!-- working title -->

## Pillar

<!-- automation | education | building | essays -->

## Quick answer (2 sentences)

<!-- AEO-style summary that will sit at the top of the essay -->

## Hook

<!-- what made you start thinking about this? -->

## Publishing checklist

- [ ] Draft scaffolded with `pnpm essay:new "title"`
- [ ] Question-style H2 headings
- [ ] Quick-answer summary paragraph at the top
- [ ] At least 1 real number / concrete example
- [ ] Footnotes + links where helpful
- [ ] `category` + `tags` set in frontmatter
- [ ] `heroImage` set (or let `/api/og/[slug]` handle it)
- [ ] `pnpm check` clean
- [ ] `pnpm build` succeeds locally
- [ ] Flip frontmatter `status` to `published`
- [ ] Commit + push (Vercel auto-deploys)
- [ ] `pnpm essay:send <slug>` to broadcast
- [ ] Post summary on LinkedIn linking back to the essay
- [ ] Answer 1-2 related Quora questions that reference the essay
- [ ] (Optional) Share in a relevant subreddit if genuinely helpful
