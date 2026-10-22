# Copy Worksheet — voice slots for the builder record

Every sentence a reader would attribute to you is a "voice slot." None of
them were AI-drafted, and none ship until you fill them. This file lists each
slot: its job, the facts it can carry, the length limit, and where to paste it.

How the gate works: the new "record" section on the home page renders only
when every lesson slot in `RECORD_CYCLES` has both English and Japanese text.
Fill the slots, and the section appears. No flag to flip.

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

## §2 Record lessons (required for the section to appear)

- **File:** `src/routes/+page.svelte`, `RECORD_CYCLES`, fields `lesson` and
  `lessonJa`.
- **Job:** one line per cycle on what the cycle taught you. Sunset projects
  must read as completed cycles, not failures.
- **Limit:** about 120 characters EN, about 60 characters JA. The line renders
  in italics with a small 学 stamp.

**Pebblr (2021–2023).** Facts available: nonprofit donor platform, sunset when
GPT-class tools changed the space. Your existing card line ("taught me where
human trust matters more than platform mechanics") already does this job. You
may reuse it verbatim here.

EN:

>

JA:

>

**Flybyrd (2024–2025).** Facts available: feedback organization for product
managers. Note: `constants.ts` describes Flybyrd as VC deal-flow analysis,
while the home page says product managers. Tell me which is right and I will
fix the wrong one.

EN:

>

JA:

>

**Kaiwa (2025–now).** The cycle is open, so the line can be present tense:
what this cycle is teaching you.

EN:

>

JA:

>

## §3 Project-card lessons (optional)

- **File:** `src/routes/+page.svelte`, `PIECES`, add `lesson` and `lessonJa`
  to any project. The card shows the line only when both exist.
- Pebblr and Exonians already carry their lesson or proof in the summary. The
  Flybyrd card is the one that currently reads most like an abandonment.
- **Limit:** about 100 characters EN, about 50 characters JA.

Flybyrd card, EN:

>

Flybyrd card, JA:

>

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

1. Flybyrd: product managers or VCs? (See §2.)
2. "Since 2018" appears in the hero. If a 2018 first build deserves a place
   in the record, tell me what it was and I will add the entry with a lesson
   slot for you.
