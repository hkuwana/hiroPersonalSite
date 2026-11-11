# Copy Worksheet — voice slots for the builder record

Every sentence a reader would attribute to you is a "voice slot." None of
them were AI-drafted, and none ship until you fill them. This file lists each
slot: its job, the facts it can carry, the length limit, and where to paste it.

How the gate works: the "record" section on the home page renders only
when every lesson slot in `RECORD_CYCLES` has both English and Japanese text.
All three slots are now filled, so the section is live at `#record`, between
Projects and Writing.

---

## §1 Hero tagline (optional)

- **File:** `src/routes/+page.svelte`, keys `hero.tagline` (en and ja blocks).
- **Job:** one sentence, evidence-first. A stranger should finish it knowing
  you build and run Kaiwa alone, full-time.
- **Current line stays live until you replace it**, so there is no rush.
- **Limit:** about 160 characters (EN). Keep the JA version natural, not a
  translation.

Your EN line:

>

Your JA line:

>

## §2 Record lessons (filled; the section is live)

- **Heading:** "Unsexy failures" / *what I learned.* (JA: 地味な失敗 /
  そこから学んだこと。), keys `record.title` / `record.titleEm`. A closing line
  under the cycles lives in `record.closing`.
- **File:** `src/routes/+page.svelte`, `RECORD_CYCLES`, fields `lesson` and
  `lessonJa`.
- **Job:** what went wrong in each cycle and what it taught you. The section is
  deliberately honest about failures; it does not dress them up as completed
  cycles. Hiro authors every sentence in it (lessons, closing line, and the
  `focus` colophon row); Claude only cleans dictation and drafts JA for his
  review.
- **Length:** 3–4 sentences per cycle. The entry renders upright (not italic)
  at a 52ch measure with a small 学 stamp. Shorter one-line versions of the
  same entries feed the project cards (§3).
- **Source of truth:** the strings in `+page.svelte`. Edit them there.

Filled 2026-11 from Hiro's dictated answers (JA drafted for his review):

- **Pebblr (2021–2023):** built before ChatGPT and run manually; once a young
  person could ask ChatGPT for nonprofits near them, the need went away.
- **Flybyrd (2024–2025):** product managers, per Hiro's answer. A market
  failure and a personal one: did not pivot fast enough, procrastinated by
  building, held on too long to one customer's feedback.
- **Kaiwa (2025–now):** time spent on onboarding that did not matter; people
  wanted a low-friction place to talk.
- **Focus** (colophon row `focus` / 集中): context switching, framed as an
  ideal ("ideally the agents..."), not a claim about daily practice.

Left out on purpose: the MCP implementation detail and the phrase "low
maintenance mode" (Kaiwa). The old Pebblr card line about "human trust" was
replaced because it contradicted Hiro's answer.

## §3 Project-card lessons (filled for Pebblr, Flybyrd, Kaiwa)

- **File:** `src/routes/+page.svelte`, `PIECES`, fields `lesson` and
  `lessonJa`. The card shows the line only when both exist.
- Pebblr, Flybyrd and Kaiwa carry the one-line versions of their Record
  entries, in Hiro's words. Any other card can take one the same way.
- **Limit:** about 100 characters EN, about 50 characters JA.

## §4 Veto pass: functional text I wrote as third-person metadata

These are not in your voice; they are metadata for search and AI answer
engines. Strike or edit anything you do not want said.

1. Three hidden FAQ entries in `src/data/constants.ts` (visible: false):
   technical-founder, what-has-he-built, and availability ("full-time on
   Kaiwa, does not take outside projects").
2. Ship lines in `RECORD_CYCLES` (factual one-liners per cycle).
3. The colophon rows: stack, solo, speed (Exonians, 1.5 hours, train),
   automation (Reddit Scout).
4. The `/case-study` page now carries a notice: "A design study. Thread is
   not a real product, and the numbers on this page are fictional."
5. The contact aside now shows your cal.com link as "cal.com · 15-minute tea"
   (JA: 15分のお茶). The "not taking on outside projects" line is unchanged.

## §5 Facts I need from you

1. ~~Flybyrd: product managers or VCs?~~ Answered: product managers.
2. "Since 2018" appears in the hero. If a 2018 first build deserves a place
   in the record, tell me what it was and I will add the entry with a lesson
   slot for you.
