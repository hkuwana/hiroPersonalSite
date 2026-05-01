---
title: "I Stopped Using a CRM the Day I Figured Out This Loop"
date: "2026-05-01"
description: "How I turn event photos into fully enriched contacts with company intel before I leave the venue — using Claude, my own VCF Splitter, and zero subscription fees."
status: "draft"
category: "automation"
---

I've met [NUMBER] people at events in the last [TIMEFRAME] without paying for a CRM. Every contact in my iPhone has the date I met them, what we talked about, what their company does, and their funding stage — sitting right in the Notes field, searchable, available offline. I built this loop in one afternoon, and the only ongoing cost is the tokens.

This is the third post in my series on running a one-person company without SaaS subscriptions. The [first post covered overnight lead collection](/playbooks/cold-email-claude-gmail). This one covers the other side: turning the people you actually meet into something more useful than a pile of scanned business cards.

## Setup

Three things:

1. **Claude** (claude.ai or the API) — needs vision capability for the photo-to-VCF step.
2. **My [VCF Splitter](/vcf-splitter)** — free, runs in your browser, no account. Takes a multi-contact `.vcf` file and splits it into individual contacts you can cherry-pick and download. Built it for exactly this loop.
3. **Optional: Apollo MCP** — for the enrichment step if you want company data beyond what a web search finds. Not required; a plain web search prompt works fine.

That's it. No Clay, no Contacts+, no CRM subscription.

## How it works

The loop has three stages:

**1 → Capture.** At the event (or on the Uber home), I give Claude photos of business cards or name badges, a prompt with the event name and date, and any notes I remember from each conversation. Claude outputs a single `.vcf` file with all contacts — one `BEGIN:VCARD` block per person, with the event metadata and conversation notes already in the `NOTE` field.

**2 → Split.** I paste the raw VCF into [vcf-splitter](/vcf-splitter), review the parsed contact list, deselect anyone I don't actually need, and download individual cards or a cleaned combined file.

**3 → Enrich.** I run a second Claude prompt on the VCF — either standalone or with Apollo MCP available — to look up each company and append a one-sentence description, headcount/stage, and website to the `NOTE` field. This is the part that makes the contact useful three months later, when you've forgotten what the company does.

The whole loop takes [TIMEFRAME — e.g., "20 minutes for 12 contacts"]. I usually do stages 1 and 2 at the airport, and stage 3 on the flight.

## The prompts

### Prompt 1 — Photos to VCF (run at the event or same day)

Give Claude [N] photos and paste this. Replace the brackets yourself — the specifics are what make the output actually useful.

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

What this gives you: a single `.vcf` you can paste into the VCF Splitter, with every contact pre-tagged with event, date, and your memory of the conversation.

### Prompt 2 — Enrich with company intel (run after splitting)

Once you've downloaded the VCF you want to keep, run this. If you have Apollo MCP available in your Claude session, the company lookups are faster and more reliable. Without it, Claude will use web search — slower but it works.

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
- If you can't find reliable information for a company after ONE search, skip the enrichment and leave the NOTE unchanged.
- Budget: 2 minutes per contact. One search per company.
- Output the full updated VCF when done, ready to import.

VCF:
[PASTE YOUR VCF HERE]
```

### Bonus: Google Sheet → VCF (when the organizer sends you the attendee list)

Sometimes you get a spreadsheet instead of business cards. Same idea, different input:

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

1. **During or right after the event**: Photograph business cards / name badges. Jot one-line notes per person in your phone's Notes app — you'll paste these into the prompt.
2. **Uber / train home**: Run Prompt 1 with the photos and your notes. Takes 2–3 minutes.
3. **Open [VCF Splitter](/vcf-splitter)** on your phone browser, paste the output, review, deselect anyone you don't need, download.
4. **On the flight or next morning**: Run Prompt 2 on the downloaded VCF. Import the enriched result into Contacts.

Step 1 and 2 are you. Steps 3 and 4 are mostly automated. The manual review in step 3 is intentional — the VCF Splitter shows you exactly what Claude parsed from each card, and you'll sometimes catch a hallucinated email or a garbled company name before it goes into your phone.

## What it actually produces

Below is a real (lightly redacted) output from a [EVENT NAME] contact after enrichment. The entire NOTE field is what makes this useful later:

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
 [What they do, e.g., "AI-powered contract review for SMB legal teams."]. 
 [Stage, e.g., "Series A, ~45 people."]. [website].com
X-ABDATE;label="Met":DATE:[YYYYMMDD]
END:VCARD
```

[REPLACE THE ABOVE WITH ONE REAL REDACTED EXAMPLE FROM YOUR OWN CONTACTS]

## The numbers

- **[NUMBER] contacts enriched** from [NUMBER] events since [DATE]
- **[TIME] per batch** from photos to imported contacts
- **$0/month** — no CRM, no enrichment SaaS, no contact-management app
- Vision parsing accuracy: [YOUR OBSERVATION — e.g., "~95% on clean cards, drops on photos taken at bad angles"]
- Enrichment accuracy: [YOUR OBSERVATION — e.g., "company description right ~90% of the time; stage/size is less reliable for companies under 20 people"]

## Where this breaks

**Bad lighting kills the capture step.** A photo taken at a dim venue at a tilted angle will produce garbage VCF. I now take two photos per card and keep my screen brightness up as a fill light. Still faster than typing.

**The enrichment step hallucinates for obscure companies.** If the company has minimal web presence — a Japanese SMB, a consulting firm without a real website — Claude will either skip it or make something up. The "ONE search, then skip" rule in Prompt 2 limits damage, but you'll still want to spot-check enrichments for companies you don't recognize.

**Apple Contacts has a NOTE field length limit in practice.** Very long notes get truncated when you sync over iCloud to some older devices. Keep the NOTE field under ~1000 characters and you won't hit it.

**The loop doesn't replace a real CRM at volume.** This works for the [NUMBER] events per [TIMEFRAME] that a solo operator attends. If you're at 10 events a month with 50+ contacts each, you need structured data, not a NOTE field.

**Claude vision can confuse similar-looking characters.** `l` vs `1`, `0` vs `O` in emails. Always scan the email fields before importing. One wrong character and your follow-up bounces.

## The takeaway

Your iPhone Contacts app already has every field a CRM has. The only thing missing was a fast way to fill them. The VCF format has been around since 1995 — Claude just finally makes it easy to use.

---

*I drafted this playbook with Claude based on my notes. The prompts, numbers, and example output are mine. Structure and connective prose are co-written. The [VCF Splitter](/vcf-splitter) and [ICS Validator](/ics-validator) linked in this post are tools I built for my own use — this is how I actually use them.*
