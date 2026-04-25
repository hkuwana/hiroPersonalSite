---
title: "I Stopped Outsourcing Lead Research. My Reply Rate Went Up."
date: "2026-04-25"
description: "How I run 200 cold messages a week in 8–10 hours with Claude and Gmail — and why removing the human from the loop is the fastest way to ruin it."
status: "draft"
category: "automation"
---

<!--
DRAFT NOTES (delete before publishing)
- Numbers to lock: site says "37% open rate, 300+ sent" (src/data/constants.ts:161).
  This post claims "20%+ reply rate" — those are different metrics on different
  denominators. Make sure the post is internally consistent and matches the site.
- Decide what "Claude Cowork" actually refers to so the link is correct.
- Fill the [BRACKETS]. Especially the prompt and the example reply.
- Once English is final, mirror as cold-email-claude-gmail.ja.md
-->

I used to pay someone on Upwork $250 a week to find leads for me. I stopped. My reply rate went up.

That sentence sounds like a LinkedIn brag, but it's not the lesson. The lesson is the opposite of what people expect: I didn't get better results by automating *more*. I got better results by being the human in the loop earlier in the process. The tools I use — Claude and Gmail, no SaaS sales stack — are almost beside the point. What matters is which parts I let a machine touch and which parts I refuse to.

This is the first in a series of practical posts on how I'm running my one-person company without paying for tools that pretend to replace judgment. Future posts will cover [contact card cleanup with my VCF tool](/vcf-splitter), [turning a screenshot of an event into a Google Calendar invite with the ICS validator](/ics-validator), and other small loops I use every week.

## The Setup (Requirements)

You need three things:

1. **Gmail.** Whatever you already have.
2. **[Claude](https://claude.ai)** with [SPECIFY: Cowork / Gmail connector / desktop app + MCP — fill in the exact product you use so the link is right].
3. **A list of where your customers actually are.** For me, that's [italki](https://www.italki.com), [Preply](https://preply.com), and a couple of other tutoring marketplaces. Profiles are public. No scraping required for the simple version — I'm reading and copying, not crawling.

That's it. No Apollo, no Instantly, no Smartlead, no lemlist. I'm not against those tools; I just don't need them, and the $250 a week I used to spend on a VA finding leads for me is now $0.

## The Morning Ritual

I run this in the morning, once a day, before anything else. Roughly 60–90 minutes:

1. Check the **sent folder** from yesterday. Who replied? Who didn't?
2. Check the **drafts** Claude prepared overnight — who is each one for, and is the personalization actually correct?
3. Check **Claude's own log** — who got added to the list, what fields it pulled, what it flagged as ambiguous.
4. Approve, edit, or reject. Send the ones I approve. Send nothing I haven't read.

Step 4 is the whole point. Every email goes out under my eyes. Not because I don't trust the model, but because the moment I let it autopilot, the replies dry up. More on that below.

## The Prompt

This is the prompt I hand Claude every morning. Steal it, adapt it.

```
[PASTE YOUR PROMPT HERE]
```

A few notes on what makes it work for me:

- [Note 1 — what context you give Claude about who you are and what Kaiwa does]
- [Note 2 — how you tell it to personalize without being weird]
- [Note 3 — what you explicitly forbid (no "I hope this email finds you well", no fake compliments, etc.)]

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

- **It doesn't work if your offer is bad.** No prompt fixes a vague pitch.
- **It doesn't work if you can't tolerate being the bottleneck for 60–90 minutes a day.** This is the trade. You spend the time, or you lose the replies.
- **It doesn't work past a certain volume without a real team.** I don't know where that ceiling is yet, but I'm sure it's lower than the VC-funded "AI SDR" pitch decks claim.
- **It assumes you have something worth saying.** If you don't, fix that first.

## The Takeaway

I keep coming back to this: the question isn't "how do I automate cold email?" It's "which parts of cold outreach are actually mine to do, and which parts is a machine better at?" Most stacks get that line wrong. They automate the personalization and ask the human to do the volume. I do the opposite. Volume is cheap. Specificity is the whole game.

---

## Coming Next in This Series

- **Contact cards that don't break.** Using AI to clean up a messy `.vcf` and re-import it cleanly with the [VCF Splitter](/vcf-splitter).
- **From screenshot to calendar invite.** Snap a picture of an event, get an AI-generated `.ics`, run it through the [ICS Validator](/ics-validator), drop it on Google Calendar.
- More to come as I keep removing tools from my stack.
