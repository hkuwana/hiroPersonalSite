---
title: "Enrich Your Contacts While You Sleep (Free Claude Workflow)"
date: "2026-05-01"
description: "A free three-step workflow to turn event photos into enriched contacts with company intel — using Claude vision, a VCF splitter, and no CRM. Includes the exact prompts."
status: "draft"
category: "automation"
tags: ["contact enrichment", "Claude", "VCF", "automation", "no-CRM"]
---

I've met [NUMBER] people at events in the last [TIMEFRAME] without paying for a CRM. Every contact in my iPhone has the date I met them, what we talked about, what their company does, and their funding stage — in the Notes field, searchable, available offline.

Photograph the business cards, run two prompts, import. The whole thing takes [TIME] for a batch of [NUMBER] contacts.

This is the third post in my series on running a one-person company without SaaS subscriptions. The [first post covered overnight lead collection](/playbooks/cold-email-claude-gmail). This one covers the other side: the people you actually meet.

## Setup

Three things:

1. **Claude** (claude.ai or the API) — vision capability required for the photo step.
2. **[VCF Splitter](/vcf-splitter)** — free, runs in your browser, no account. Splits a multi-contact `.vcf` into individual cards you can cherry-pick. Built it for this loop.
3. **Apollo MCP** (optional) — faster, more reliable company lookups in the enrichment step. A plain web search prompt works without it.

No Clay, no Contacts+, no CRM subscription.

## How it works

**1 → Capture.** At the event or on the ride home, give Claude photos of the business cards, the event name, the date, and any notes from your conversations. Claude outputs a single `.vcf` file — one `BEGIN:VCARD` block per person — with the event metadata and conversation notes already in the `NOTE` field.

**2 → Split.** Paste the raw VCF into [VCF Splitter](/vcf-splitter), review what Claude parsed, deselect anyone you don't need, download.

**3 → Enrich.** Run a second Claude prompt on the VCF. It looks up each company and appends a one-sentence description, headcount/stage, and website to the `NOTE` field. Run it manually on the flight, or schedule it overnight — drop the file before bed, import in the morning.

## The prompts

### Prompt 1 — Photos to VCF

Attach your photos and paste this. Fill the brackets with the real event name and date — that's what makes the output useful later.

```
I'm attaching [N] photos from [EVENT NAME] on [DATE, e.g., "May 8, 2026"].
Each photo is a business card or name badge.

For EACH photo, produce one VCF contact block. Use this exact format:

BEGIN:VCARD
VERSION:3.0
FN:[Full Name]
N:[Last];[First];;;
ORG:[Company]
TITLE:[Job Title]
TEL;TYPE=WORK:[Phone if visible]
EMAIL;TYPE=WORK:[Email if visible]
NOTE:Met at [EVENT NAME] on [DATE]. [YOUR NOTES FIELD — see below]
X-ABDATE;label="Met":DATE:[YYYYMMDD]
END:VCARD

Rules:
- If a field isn't visible in the photo, omit that line entirely. No blank fields.
- Use the exact event name "[EVENT NAME]" in every NOTE field.
- For X-ABDATE, use the date in YYYYMMDD format (e.g., 20260508).
- Combine all contacts into a single output, one block after another, no blank lines between them.
- Output ONLY the VCF content. No explanation, no summary, no markdown fences.

For the NOTE field on each contact, use whatever I give you below.
If I give you nothing for a contact, write: "Met at [EVENT NAME] on [DATE]."

Per-contact notes:
[PERSON 1 NAME]: [e.g., "Talked about using AI for contract review. Following up about their Series A timeline. Intro'd by Kenji."]
[PERSON 2 NAME]: [e.g., "She runs BD. Wants a demo for their Tokyo office. Very warm."]
[PERSON 3 NAME]: [leave blank if you didn't talk much]
```

### Prompt 2 — Enrich with company intel

Run this after splitting. If you have Apollo MCP in your Claude session the lookups are faster and more reliable; without it Claude uses web search.

```
You are a contact enrichment agent. I'm giving you a VCF file.
For each contact that has an ORG field, look up that company and append
a brief summary to their NOTE field.

For each company:
1. Find: what they do (one sentence, plain English — not marketing copy)
2. Stage or headcount if publicly available (e.g., "Series B, ~80 people" or "bootstrapped, ~15 people")
3. Website domain

Append to the existing NOTE field using this format:
[existing note] | [Company]: [what they do]. [Stage/size]. [website]

Example:
"Met at SaaStr Tokyo on May 8 | Acme: AI contract review for mid-market legal teams. Series A, ~40 people. acme.com"

Rules:
- Do not modify any field except NOTE.
- If you can't find reliable information for a company after ONE search, skip it and leave the NOTE unchanged.
- Budget: 2 minutes per contact. One search per company.
- Output the full updated VCF when done, ready to import.

VCF:
[PASTE YOUR VCF HERE]
```

### Optional: Run it overnight

Schedule Prompt 2 as a [Claude scheduled task](https://claude.ai) — same pattern as the [11 PM lead collection agent](/playbooks/cold-email-claude-gmail). Trigger it manually on nights after events.

Prepend this to Prompt 2:

```
You are a scheduled contact enrichment agent. Run file:
~/Documents/Contacts/staging/[FILENAME].vcf

When done, write the enriched output to:
~/Documents/Contacts/done/[FILENAME]-enriched.vcf

Append a one-line summary to:
~/Documents/Contacts/done/enrichment_log.md

Format: ## [DATE] — [N] contacts enriched, [N] skipped (no web presence)
```

Drop the file before bed. Import with coffee in the morning.

### Bonus: Google Sheet → VCF

When the organizer sends an attendee list instead of business cards:

```
I have a Google Sheet export (pasted below as CSV) of attendees from [EVENT NAME] on [DATE].
Convert each row into a VCF contact block using the same format as above.
Set NOTE to: "Met at [EVENT NAME] on [DATE]. From attendee list."
Set X-ABDATE to [YYYYMMDD].
Only include rows where the Name column is filled.
Output only the VCF content.

CSV:
[PASTE CSV HERE]
```

## The sequence

1. **During or right after the event**: Photograph business cards and name badges. Jot one-line notes per person in your phone's Notes app.
2. **Uber / train home**: Run Prompt 1 with the photos and your notes. Takes 2–3 minutes.
3. **[VCF Splitter](/vcf-splitter)** on your phone browser: paste the output, review what Claude parsed, deselect anyone you don't need, download.
4. **On the flight or overnight**: Run Prompt 2. Import the enriched result into Contacts.

The review in step 3 matters — the VCF Splitter shows you exactly what Claude read from each card before anything goes into your phone. You'll catch a hallucinated email or a garbled company name more often than you'd expect.

## What it actually produces

The NOTE field is what makes this useful months later:

```
BEGIN:VCARD
VERSION:3.0
FN:[First Last]
N:[Last];[First];;;
ORG:[Company]
TITLE:[Title]
EMAIL;TYPE=WORK:[email]@[company].com
NOTE:Met at [EVENT NAME] on [DATE]. Runs partnerships. Wants intro to [NAME]
 re: joint pilot. Very warm, follow up by [FOLLOW-UP DATE]. | [Company]:
 [What they do]. [Stage, e.g., "Series A, ~45 people."]. [website].com
X-ABDATE;label="Met":DATE:[YYYYMMDD]
END:VCARD
```

[REPLACE WITH ONE REAL REDACTED EXAMPLE]

## The numbers

- **[NUMBER] contacts enriched** from [NUMBER] events since [DATE]
- **[TIME] per batch**
- **$0/month** — no CRM, no enrichment SaaS, no contact-management app
- Vision parsing accuracy: [YOUR OBSERVATION]
- Enrichment accuracy: [YOUR OBSERVATION]

## Where this breaks

**Bad lighting kills the capture step.** A photo taken at a dim venue at a bad angle produces garbage VCF. I take two photos per card and use my screen brightness as a fill light.

**The enrichment step hallucinates for obscure companies.** If the company has minimal web presence — a Japanese SMB, a consulting firm without a real site — Claude will either skip it or invent something. The "one search, then skip" rule limits damage, but spot-check enrichments for companies you don't recognize.

**NOTE field length.** Very long notes get truncated on some older iOS devices syncing over iCloud. Keep each NOTE under ~1000 characters.

**Not a CRM at volume.** This works for [NUMBER] events per [TIMEFRAME] as a solo operator. Ten events a month with 50+ contacts each needs structured data, not a Notes field.

**Claude vision confuses similar characters.** `l` vs `1`, `0` vs `O` in emails. Always scan email fields before importing.

## The takeaway

Your iPhone Contacts app already has every field a CRM has. The VCF format has been around since 1995. Claude just finally makes it fast to fill.

---

## FAQ

**How do I automatically enrich contacts with company data for free?**
Run two Claude prompts: the first converts photos or a CSV into a structured VCF file; the second looks up each company and appends a one-sentence description, funding stage, and website to the Notes field. No paid enrichment tool required.

**Can Claude read business cards and turn them into contacts?**
Yes. Claude's vision model parses a photo of a business card and outputs a valid VCF contact block. Accuracy is high on clean, well-lit cards. The prompt above includes rules that suppress blank fields and prevent hallucinated data.

**What is a VCF file and how do I import it to iPhone Contacts?**
A VCF (vCard) file is the standard format for contact data. To import on iPhone: open the file in Files or email, tap it, and iOS will offer to add it to Contacts. For multi-contact files, use the [VCF Splitter](/vcf-splitter) first to pick which contacts you want.

**What is the difference between contact capture and contact enrichment?**
Capture turns raw input (a photo, a spreadsheet row) into a structured contact. Enrichment adds third-party context — company description, headcount, funding — to a contact you already have. This workflow does capture first, then enrichment.

**Is there a free alternative to Clay for contact enrichment?**
For personal use and batches under ~50 contacts, a Claude prompt with web search or Apollo MCP access covers the same ground as Clay. The tradeoff: you trigger it per batch rather than running a persistent pipeline. For high-volume B2B enrichment, Clay is the right tool.

**How do I add the date I met someone to an iPhone contact?**
Use the `X-ABDATE` field in the VCF with `label="Met"`. iOS Contacts recognizes it as a custom date field. The capture prompt above sets it automatically from the event date you provide.

**Can I enrich contacts from a Google Sheets attendee list?**
Yes — export the sheet as CSV and use the Google Sheet → VCF prompt above. Claude converts each row into a VCF block tagged with the event name and date, ready to split and enrich.

---

*I drafted this with Claude based on my notes. The prompts, numbers, and example output are mine. The [VCF Splitter](/vcf-splitter) and [ICS Validator](/ics-validator) are tools I built for my own use — this is how I actually use them.*
