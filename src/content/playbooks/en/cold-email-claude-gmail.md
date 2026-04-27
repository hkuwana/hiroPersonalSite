---
title: "I Stopped Outsourcing Lead Research. My Reply Rate Went Up."
date: "2026-04-25"
description: "How two sleeping Claude agents find my leads while I sleep — and why I still send every email myself. The full prompt, the full architecture, 8–10 hours a week."
status: "published"
category: "automation"
---

I used to pay someone on Upwork $250 a week to find leads for me. I stopped. My reply rate went up.

That sentence sounds like a LinkedIn brag, but it's not the lesson. The lesson is the opposite of what people expect: I didn't get better results by automating *more*. I got better results by being the human in the loop *later* in the process. Two Claude agents do the boring work between 11 PM and 2 AM while I sleep. I do the thing they can't — read, edit, hit send, follow up like a person — when I wake up. The tools I use are almost beside the point. What matters is which parts I let a machine touch and which parts I refuse to.

This is the first in a series of practical posts on how I'm running my one-person company without paying for tools that pretend to replace judgment. Future posts will cover [contact card cleanup with my VCF tool](/vcf-splitter), [turning a screenshot of an event into a Google Calendar invite with the ICS validator](/ics-validator), and other small loops I use every week.

## The Setup (Requirements)

You need four things:

1. **Gmail.** Whatever you already have.
2. **[Claude](https://claude.ai) with scheduled tasks** — the Claude.ai feature that lets a prompt run on a recurring schedule (mine runs nightly at 11 PM).
3. **The Claude-in-Chrome browser tools** so the agent can actually navigate Preply, search the web, and pull contact info. The prompt below uses `mcp__Claude_in_Chrome__*` tools — `tabs_context_mcp`, `get_page_text`, `find`. No system-level approval needed.
4. **A list of where your customers actually are.** For [Kaiwa](https://www.trykaiwa.com/), that's Japanese-language tutors on [Preply](https://preply.com/en/online/japanese-tutors) and [italki](https://www.italki.com/en/teachers/japanese). Public profiles. The agent reads them like a person would.

That's it. No Apollo, no Instantly, no Smartlead, no lemlist. I'm not against those tools; I just don't need them, and the $250 a week I used to spend on a VA finding leads for me is now $0.

## Architecture: Two Sleeping Agents

Most "AI cold email" stacks bundle everything into one giant agent that scrapes, writes, and sends. That's where they go wrong. I split the work into two scheduled tasks that don't talk to each other directly — they communicate through a CSV file:

- **11 PM — Collection agent.** Scouts new Japanese tutor profiles on Preply (and iTalki if Preply runs short), enriches each one with one WebSearch and a personal-site visit, writes a row to `Kaiwa_Leads.csv`. Strict 2–3 minute budget per lead. Target: 60–80 new leads per night.
- **2 AM — Outreach agent.** Picks up the CSV, drafts a personalized first-touch message for each lead with `Pitch Angle` filled in. Writes drafts to a queue. **It does not send.**

Why two agents instead of one? Three reasons:

1. **Separation of concerns.** Collection is a research task. Drafting is a writing task. They fail differently and need different prompts. Bundling them turns one agent into a slow, brittle generalist.
2. **Resumability.** The collection run logs the last Preply page it scraped. If a run errors out (and it does — see below), the next night picks up where it left off. The outreach run is independent.
3. **Cost predictability.** A 2–3 minute hard budget per lead, capped at 80 leads, means I know exactly what a night costs in tokens.

This split is the actual playbook. If you take one thing from this post, take the split.

## The Morning Ritual

When I wake up, the work is already done. My job is review-and-send, 60–90 minutes:

1. Check the **collection run log** — how many new leads, how many errors, did it skip a night.
2. Open the **outreach drafts** — read each one, check that the personalization is actually about *that person* and not a hallucination from a thin profile.
3. **Approve, edit, or reject.** Send the ones I approve. Send nothing I haven't read.
4. Check **yesterday's sent folder** — who replied? Move them out of the cold queue and into the human-touch queue (Loom, time suggestion, follow-up resource).

Step 3 is the whole point. Every email goes out under my eyes. Not because I don't trust the model, but because the moment I let it autopilot, the replies dry up. More on that below.

## The 11 PM Prompt (Collection)

This is the prompt the collection agent runs nightly. Steal it, adapt the platform/keywords/file paths to your own use case.

```
You are the Kaiwa overnight lead COLLECTION agent. You run every night at 11 PM. Your only job tonight is to collect and enrich 60-80 new leads. The outreach generation agent runs separately at 2 AM and handles all the message writing.

Master file: /Users/hiro/Documents/Claude/Kaiwa-Outreach/Kaiwa_Leads.csv
Run log: /Users/hiro/Documents/Claude/Kaiwa-Outreach/Overnight_Enrichment/run_log.md

---

# STRICT TIME BUDGET: 2-3 MINUTES PER LEAD

Every lead gets exactly this sequence — no more:
1. Capture from listing (name, lesson count, profile URL, specialty) — already done in batch
2. ONE WebSearch for external presence — 60 seconds max
3. If personal site found: navigate + scan for email — 60 seconds max
4. Update CSV row — 30 seconds

If a step yields nothing, move on immediately. Never spend more than 3 minutes total on any single lead.

---

# SETUP

Use Claude-in-Chrome MCP tools (mcp__Claude_in_Chrome__*). These don't need system-level approval.
Start with: tabs_context_mcp (createIfEmpty: true) to get a tab ID.

---

# PHASE 1: BATCH COLLECTION (target 60-80 new leads)

## Load existing Preply IDs for dedup
Read Kaiwa_Leads.csv. Extract all Preply profile IDs already in the database (lines containing "preply.com/en/tutor/"). This takes ~10 seconds.

## Browse Preply listing pages
Navigate to: https://preply.com/en/online/japanese-tutors?page=[N]

Determine which pages to scrape this run by checking run_log.md for last page scraped.
If no record: start from page 2. Otherwise start from (last page + 1).
Target: 7-8 pages = 70-80 tutors before dedup.

For EACH listing page:
- get_page_text — extracts all 10 tutor names, lesson counts, specialties in one call
- find tool with all 10 tutor names at once — extracts all 10 profile URLs in 1-2 calls
- Skip any tutor whose profile URL is already in existing IDs
- Add remaining tutors to a working list

This should take under 3 minutes per page (30 seconds per tutor at listing stage).

## Also scrape iTalki if Preply yields < 60 new leads
- https://www.italki.com/en/teachers/japanese
- Use get_page_text to extract teacher names and profile links
- Same dedup check against existing italki URLs in CSV

## Priority assignment (quick rule):
- A: 1,000+ lessons OR Super Tutor with distinctive niche (unique location, unusual background, multilingual)
- B: 200-999 lessons OR new tutors with interesting bio
- C: under 200 lessons with generic bio

---

# PHASE 2: ENRICHMENT (2-3 minutes per lead, strictly)

Process A-priority leads first, then B. Skip C entirely for enrichment.

For EACH lead (2-3 min budget):

## Step 1: Profile scan (30 seconds)
Navigate to their Preply profile URL. Run get_page_text.
Scan bio text for any of these keywords: YouTube, Instagram, @, website, .com, school, academy, blog.
If none found: skip to WebSearch immediately.

## Step 2: WebSearch (60 seconds max — ONE search only)
Search: "[first name] [most distinctive bio detail] Japanese tutor"
Examples:
- "Natsumi Tokyo accent pronunciation Japanese tutor"
- "Yuya Kyoto katori shinto Japanese tutor"
- "Rie Australia Japanese tutor"

Scan results for: personal website domain, Instagram handle, YouTube channel, email address.
If found: record it and move to Step 3.
If nothing in first search: mark as "Preply-only" and move on. Do NOT run a second search.

## Step 3: Quick contact grab (60 seconds max — only if site found)
If a personal website was found: navigate to it, run get_page_text OR find tool for "email OR contact".
If email found: record in Email field.
If only contact form: record website in Website field, note "webform only."
If Instagram found: record handle in Social/DM field.
If LinkedIn found: record URL in LinkedIn field.

## Step 4: Write CSV row (30 seconds)
Add a new row with all captured info. Fields:
- #: next available ID
- Priority: A/B/C
- Name: "[First] [Last initial]. (Preply)" or "(italki)"
- Language: Japanese
- Type: "High-Volume Tutor (X,XXX lessons)" if 1000+, else "Preply Tutor (X lessons)"
- Platform/Audience: "Preply - [max 55 char distinctive detail]"
- Website: profile URL (and personal site URL if found)
- Email: if found
- Social/DM: if found
- LinkedIn: if found
- Other Contact: "Preply [ID]"
- Pitch Angle: LEAVE BLANK — outreach agent fills this at 2 AM
- Notes: "Source: Preply page [N], [month] [year]. [ID], [N] lessons. [enrichment result]"
- Profile_URL: full Preply profile URL
- Status: "Platform_Listed" if no email/social found. "New" if email found (outreach agent will draft). Keep as-is if email found.
- Contact_Date: blank

## Downgrade rule
If external presence found (email/Instagram/LinkedIn): keep assigned priority.
If Preply-only after enrichment: downgrade A→B, keep B as B.

---

# PHASE 3: BATCH CSV WRITE
Write ALL new rows to the CSV in one go using Python after collecting all leads.
Do not write one row at a time — batch it.

---

# PHASE 4: APPEND TO RUN LOG

Append to run_log.md:

## Collection Run [DATE] (11 PM)
- Pages scraped: Preply pages [X] to [Y] (+ iTalki if applicable)
- Tutors found on listing pages: [N]
- Skipped (already in DB): [N]
- New leads added: [N] (A: [N], B: [N], C: [N])
- Enrichment results:
  - Emails confirmed: [N]
  - Instagram found: [N]
  - LinkedIn found: [N]
  - Websites found (no email): [N]
  - Preply-only (no external presence): [N]
- CSV total after run: [N] rows
- Last Preply page scraped: [N] (resume here next run)
- Outreach agent scheduled: 2 AM

---

# EFFICIENCY RULES (read before starting)

1. NEVER visit a profile you already have in the DB. Check the ID before navigating.
2. NEVER run more than one WebSearch per lead.
3. NEVER spend more than 3 minutes on any single lead. Set a mental timer.
4. Use get_page_text for bulk extraction — don't read element by element.
5. Use find tool with ALL tutor names at once on listing pages (one call = 10 URLs).
6. Write all new rows to CSV in one batch at the end, not one at a time.
7. If Chrome navigation is slow or fails: skip that lead, note it in run log, move on.
8. Target completion by 1:30 AM to leave buffer before the 2 AM outreach run.
```

A few notes on what makes this prompt work:

- **Hard time budgets are non-negotiable.** "2-3 minutes per lead" + "ONE WebSearch" + "Never spend more than 3 minutes" prevents the model from rabbit-holing on a single interesting lead. The whole run finishes before the 2 AM outreach agent picks up.
- **Resumability is built in.** The agent reads `run_log.md` to find the last Preply page scraped and starts from the next one. If last night errored, tonight just continues.
- **The agent never writes pitch copy.** `Pitch Angle: LEAVE BLANK` is the firewall. Collection writes facts. Drafting writes voice. Different jobs, different agents.
- **Dedup before navigation.** Loading existing Preply IDs first means the agent never wastes 30 seconds opening a profile we already have.
- **Priority + downgrade rule.** A-priority tutors with no external presence get downgraded to B, so the outreach agent allocates effort honestly.

The 2 AM outreach generator is a separate prompt — [I'll cover it in detail in part 2 of this series / paste yours here, your call].

## The Sequence

Three touches per lead. That's it. After the third, they're out.

1. **Initial email.** Personalized opener that references something specific from their profile. The ask is small.
2. **Follow-up #1: the dashboard.** I tell them I built them a dashboard — [SPECIFY: what's actually in it. A short Loom? A custom page? A doc with their stats?]. This is the touch that converts. It's also the one I refuse to let a machine do end-to-end, because the whole point is that it's *for them*.
3. **Follow-up #2: the bump.** Short. "I won't bother you further — just reply if you're curious." That's the whole email. It's the one most people skip and the one that pulls a surprising number of replies.

## What a Successful Reply Actually Looks Like

```
[PASTE A REDACTED EXAMPLE EMAIL THREAD HERE]
- Their first reply
- What you sent next
- The outcome (call booked, customer, partnership, etc.)
```

The pattern in every successful thread: I said something specific that no template could have produced.

## The Anti-Pattern: Removing the Human

Here is the part most people get wrong, and the reason most "AI cold email" stacks have terrible reply rates: **the second you automate end-to-end, the magic dies.**

Cold outreach isn't only email anyway. The same loop runs across Instagram DMs, LinkedIn, TikTok, and whatever channel your customer actually lives on. Email is just one surface. The medium isn't the moat.

The moat is the part that *doesn't* scale:

- A personalized Loom video that took you 90 seconds to record.
- Replying within an hour when someone bites.
- Suggesting a specific time, in their timezone, when they say yes.
- Sharing something useful *after* the reply that has nothing to do with selling.

Claude is great at the parts that scale: drafting, personalizing within bounds, keeping the list clean, flagging the ambiguous ones for me. It's terrible at — and shouldn't try to do — the parts where someone needs to feel like a real human cared. If you let the model send without your eyes on it, you're optimizing the wrong half of the loop. You'll get more volume and fewer replies.

This is also why I think most "I automated my entire sales pipeline" posts are nonsense. They're optimizing for hours saved at the cost of the only thing that actually closes.

## The Numbers

- **200 messages per week** across channels.
- **50–60 net-new qualified leads** added to the list each week.
- **20%+ reply rate** on cold (I should be careful with this number — see note in draft about reconciling it with the 37% open rate already on the site).
- **8–10 hours of my time per week**, almost all of it in the morning.
- **$0/month in sales SaaS.** Down from ~$1,000/month in tools and contractor fees a year ago.

## Where This Breaks

I want to be honest about the limits, because most playbooks won't tell you:

- **The agent fails. Often enough to plan for it.** My collection task has run 9 of the last 10 nights — one Skipped, one Errored. The reason this is fine and not a crisis is that the prompt resumes from `run_log.md`. Build for failure or you'll wake up to a panic, not a list.
- **It doesn't work if your offer is bad.** No prompt fixes a vague pitch. The morning approval step is where you'll feel this — if every draft sounds generic, the problem is upstream of the model.
- **It doesn't work if you can't tolerate being the bottleneck for 60–90 minutes a day.** This is the trade. You spend the time, or you lose the replies.
- **It doesn't work past a certain volume without a real team.** I don't know where that ceiling is yet, but I'm sure it's lower than the VC-funded "AI SDR" pitch decks claim.
- **It assumes you have something worth saying.** If you don't, fix that first.

## The Takeaway

I keep coming back to this: the question isn't "how do I automate cold email?" It's "which parts of cold outreach are actually mine to do, and which parts is a machine better at?" Most stacks get that line wrong. They automate the personalization and ask the human to do the volume. I do the opposite. Volume is cheap. Specificity is the whole game.

---

## Coming Next in This Series

- **The 2 AM outreach prompt.** How the second agent reads the CSV and writes a pitch angle for each lead — without sounding like a bot.
- **Contact cards that don't break.** Using AI to clean up a messy `.vcf` and re-import it cleanly with the [VCF Splitter](/vcf-splitter).
- **From screenshot to calendar invite.** Snap a picture of an event, get an AI-generated `.ics`, run it through the [ICS Validator](/ics-validator), drop it on Google Calendar.
- More to come as I keep removing tools from my stack.
