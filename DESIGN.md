# DESIGN.md — hirokuwana.com

Source of truth: `src/style.css` tokens. This file summarizes them.

## Color

Light ("paper"): `--paper #eef0e4`, `--paper-2 #e3e7d3`, `--moss #dde5c8`,
`--ink #15170f`, `--ink-soft #3b4232`, `--ink-mute #7e8670`, `--rule #c7d0ad`.
Dark: same roles, moss-black paper (`#11140e`) and pale ink (`#ebefd8`).

Accents: `--shu` vermilion `oklch(0.56 0.18 30)` (links, seals, shipped
status), `--moss-green oklch(0.52 0.09 135)` (active status), `--highlight`.
Strategy: restrained. Tinted neutrals carry the page; shu appears in small
stamps and rules only. Always use the CSS variables, never raw hex, so dark
mode works for free.

## Typography

- Display: `--f-display` Shippori Mincho / Newsreader serif, weight 400,
  large sizes, tight leading (h2: 3rem / 1.08).
- Body: `--f-body` Newsreader, 18px / 1.65.
- Mono details: `--f-mono` JetBrains Mono, 0.65–0.8125rem, uppercase,
  letter-spaced, for eyebrows, dates, filters, stats.
- Japanese: `--f-jp` Shippori Mincho, also used for vertical marks
  (`writing-mode: vertical-rl`) and kanji numerals or seals.

## Recurring patterns

- Sections: `.section` (max 82.5rem, `--pad-section 9rem`), `.sec-head` with a
  vertical kanji-styled number (`.num-vert`), an h2 with an italic muted `em`
  subtitle, and a soft gradient hairline under the head.
- Seals: single kanji on a shu background (`.seal`, `.stamp`), used sparingly.
- Ledger details: thin 1px rules from `--rule`, mono microlabels, dt/dd stat
  rows (`.now-stats`, `.hero-meta`).
- Motion: `.reveal` sections fade in via IntersectionObserver. Eases:
  `--ease-out-expo`, `--ease-out-quart`. Durations 150–400ms.

## Rules

- No cards for text content; use rules and whitespace.
- No pure black or white; everything is tinted toward moss.
- Both locales must render well: check JA line lengths and font stacks.
