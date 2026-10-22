# Builder Record — Design Spec

Date: 2026-08-16
Status: approved by Hiro (Approach B, with the authorship rule)

## Goal

The site must show Hiro as a builder with a record, while it signals full
commitment to Kaiwa. Investors must read focus. Researchers and peers must
read shipped, production work. The site must not signal availability.

## The authorship rule (hard constraint)

Text splits into two types:

- **Functional text**: labels, dates, stats, section names, notices, JSON-LD
  metadata. Claude supplies this text.
- **Voice text**: any sentence a reader would attribute to Hiro. Claude never
  drafts voice text. Hiro writes it in English and Japanese. The worksheet
  (`COPY_WORKSHEET.md` at the repo root) lists every voice slot with its job,
  its facts, and its length limit.

No voice slot ships empty or with scaffold text. The record section stays
hidden until every voice slot in it has content.

## Changes

### 1. Hero (small)

The tagline becomes a voice slot in the worksheet. The current tagline stays
live until Hiro replaces it. The stats, the "Now · Kaiwa, full-time" pill, and
the structure stay.

### 2. New home section: "The record" (core)

A new section between Projects and Writing. Sections renumber: record 03,
writing 04, contact 05. Content:

- A timeline of founder cycles since 2018: Pebblr (2021–2023), Flybyrd
  (2024–2025), Kaiwa (2025–now), plus a speed entry (Exonians in Japan) and a
  tooling entry (Reddit Scout). Each entry has a factual ship line
  (functional) and a lesson line (voice slot).
- A "how I work" row: stack, solo operation, automation.
- Design: zen, in the existing washi/ledger aesthetic of the site. Bilingual.
- Visibility: the section renders only when every lesson slot has both EN and
  JA content. Computed from the data, no manual flag.

### 3. Project cards (small)

`Piece` gets optional `lesson` / `lessonJa`. The card renders the line only
when present. All lesson lines are voice slots.

### 4. About page / AEO (small)

Three hidden FAQ entries (JSON-LD only, `visible: false`): technical-founder,
what-has-he-built, availability ("full-time on Kaiwa"). These are third-person
metadata, treated as functional, but listed in the worksheet for veto.

### 5. Contact (small)

The "not taking on outside projects" line stays word-for-word. The cal.com
link (`CONTACT.cal`) becomes visible next to the email, with a short
functional label. The framing stays "tea, not contracts."

### 6. Case study label

`/case-study` gets a visible functional notice: a design study, numbers
fictional. `/corporate` stays untouched.

## Verification

`pnpm check`, `pnpm lint`, `pnpm build` must pass. Manual view of the home
page in both locales.

## Out of scope

The evaluation-sprint offer, pricing, a benchmark page (strategy attachment,
Approach C). Deleting `/case-study` or `/corporate`.
