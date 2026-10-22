---
title: ""
date: ""
description: ""
---

<!--
SKELETON — structure only. The words are yours.
Same rules as _TEMPLATE.md: write each section in your own words, delete the
comment block as you go, replace [your section title] with a real header.
Do NOT ask AI to rewrite your sentences. Ask it to tighten structure or check a number.

WHAT I VERIFIED IN YOUR GMAIL (2026-09-07). Read this first — it is the evidence
base for the post. Anything marked APPROX needs you to finish the count before
you publish it.


== THE MACHINE-DRAFTED CAMPAIGN (cold, to teachers/creators) ==

Subject formula, constant across every send:
  "<one specific, checkable observation about their work> (and a quick idea)"
  e.g. "8 ways to say 'open' and 'close' (and a quick idea)"
       "Katakana that doesn't sound like English (and a quick idea)"
       "245 episodes of Speak Chinese Naturally (and a quick idea)"

Body has six fixed slots. Only slots 1 and 3 are researched per person:
  1. One paragraph naming something specific they did, closed with a
     "Most teachers…" contrast line.
  2. Identity: "I'm Hiro, a Japanese-American founder here in Tokyo.
     I'm building Kaiwa, an AI conversation partner."
  3. "I noticed a gap:" — the gap between their content and speaking practice.
  4. The same Loom demo link for everyone.
  5. "I'm keeping this to a handful of teachers to start because I personally
     build out each curriculum, and I want to get yours right."
  6. Ask: "Are you open to a 15-minute chat next Tuesday or Wednesday?"

Mechanics, from the timestamps:
  - Sent from your own Gmail, not a bulk ESP.
  - Batched: ~8-50 per session, 2-7 seconds apart.
    (e.g. 2026-08-11, fourteen emails between 15:42:02 and 15:43:28)
  - Staged as Gmail DRAFTS first, sent by hand. 229 drafts pending on 2026-09-07,
    including 7 finished teacher emails written that morning at 11:15.
  - Follow-up cadence, repeated across the campaign: first touch,
    follow-up at +4 to +7 days, sometimes a third at +10 to +20 days.
    (07-30 → 07-31 → 08-07; 08-07 → 08-25; 08-14 → 08-19 → 08-21)
  - Runs 2026-04-12 (earliest reply) through 2026-09-07.

Numbers:
  - Replies: EXACT. 85 threads received an inbound message.
    ~70 distinct human repliers. ~9 were pure autoresponders / vacation replies.
    Several hard bounces (mailer-daemon, postmaster).
  - Sends: APPROX. I counted 250+ distinct outreach threads and did not reach
    the April end of the list. Gmail's own resultCountEstimate swings between
    201 and 603 and is not trustworthy.
  - So the honest statement today is: ~70 human replies against 250+ sends,
    i.e. AT MOST ~28%, and it falls as the real denominator comes in.
    FINISH THIS COUNT BEFORE YOU PUBLISH A RATE. Query below.


== THE WARM CAMPAIGN (to people who already use Kaiwa) ==

Subject: "<Name>, what do you like to watch or read?"
Batch on 2026-09-04: ~100 emails between 19:50 and 20:02.
Replies to that subject, all time: 10 threads. Two of them are family
(personal addresses omitted).
So roughly 8 non-family replies.

The warm list — people who already gave you money or hours — answered at a
fraction of the rate of total strangers. That is the finding.

One reply, in full, from someone you'd asked about a bug from May:
"Gave up and moved on."


== SLOP THAT ACTUALLY SHIPPED (use this, it is the strongest evidence in the post) ==

In the 2026-09-04 warm batch, at least five emails went out with the name
field empty. The fallback leaked into the subject line:
  Subject: "there, what do you like to watch or read?"
  Body:    "Hey there, You've already completed 4 Japanese sessions in Kaiwa..."
  (five recipient addresses omitted)
Nobody read those twenty before they went. That is the whole argument for the
first-20 rule in one screenshot.

Also worth a look: the teacher-draft bodies I pulled show the Loom link wrapped
as https://www.google.com/url?q=https://www.loom.com/share/...&source=gmail&ust=...
I could not confirm whether recipients see the wrapped version or the clean one.
A bcc to yourself on one send answers that in ten seconds. UNVERIFIED — check it.


== THE THING YOU BUILT AND NEVER USED ==

Your Gmail labels:
  Kaiwa/Triage/Orange ........ 119 messages
  Kaiwa/Triage/Hard Stop ..... 109 messages
  Kaiwa/Triage/Green ..........  0 messages
  Kaiwa/Needs Reply ...........  0 messages
  Kaiwa/Approved Auto-Send ....  0 messages

You built an auto-send lane and have never once put an email in it.


== QUERIES TO REFRESH ANY NUMBER ==

Sent, cold campaign:      in:sent subject:"a quick idea"
Replies, cold campaign:   subject:"a quick idea" -in:sent -in:draft -from:me
Sent, warm campaign:      in:sent subject:"what do you like to watch or read"
Replies, warm campaign:   subject:"what do you like to watch or read" -in:inbox
Bounces:                  from:mailer-daemon subject:"a quick idea"

Gmail's result counts are estimates. To get a real number, page through and
count distinct recipients, not threads.
-->

<!--
HOOK — Why you started letting a machine write the first draft of a cold email.
2-4 sentences. Be concrete about what you were doing before and what broke.
Not "outreach is hard." What specifically did you run out of?
-->

<!--
THE IDEA — Say plainly what the machine does and what it does not do.
The interesting shape here: the model does not write the pitch. The pitch is
fixed. The model does the research and writes one paragraph. Name that division.
-->

## [your section title]

<!--
THE PROCESS — Walk it end to end, concretely enough that a reader could copy it.
Cover, in your own order:
  - where the list comes from
  - what the model is asked to find (one specific, checkable thing they made)
  - the six fixed slots, and why only two of them vary
  - drafts, not sends: why the email lands in your drafts folder and not in
    their inbox
  - the batch: ~50 at a time, seconds apart, from your own address
  - the follow-up schedule: +4-7 days, then +10-20
Include one real subject line and one real opening paragraph so the reader sees
the texture. Pick from the list above.
-->

## [your section title]

<!--
DON'T SEND SLOP — This is the section you asked to emphasise. Make it a rule
a reader can copy, not a sentiment. Three parts, in your words:

1. WHAT SLOP LOOKS LIKE HERE. Not "generic AI writing" in the abstract. The
   specific failure modes of this exact pipeline: a wrong or invented
   observation about their work, a "love your content" opener with nothing
   checkable in it, a name field that comes through empty. You have a real one:
   "there, what do you like to watch or read?" went out at least five times on
   Sept 4. Show it. It costs you a little and buys the whole section.

2. THE FIRST-20 RULE. Nothing goes to a stranger until you have read the first
   twenty drafts of a batch the way the recipient would: subject line in an
   inbox, first sentence on a phone, does the specific claim check out against
   their actual page. If any of the twenty is slop, the batch does not send and
   the prompt gets fixed first. Say what "read" means — you opening the draft
   and checking the claim, not skimming subject lines.

3. BCC YOURSELF, EVERY TIME THE MACHINE SENDS. Once the first twenty are clean
   and the batch is allowed to go out on its own, at least one email per
   automated send is bcc'd to you. Not the draft, the sent version — so you see
   the headers, the link rendering, the signature, the way it lands in an inbox
   the same minute a stranger does. If it reads like spam in your inbox it is
   spam in theirs. (The Loom-link wrapping question above is exactly the kind of
   thing this catches.)

Close the section by saying why this is cheap. Twenty drafts is twenty minutes.
One bcc is free. The alternative is five people getting "Hey there".
-->

## [your section title]

<!--
THE NUMBERS — Put the table here. Say what you measured and what you did not.
Do not publish a reply rate you have not finished counting. If the denominator
is still open, say the denominator is still open — that is more credible than a
clean percentage, and it is the kind of thing your readers check.
-->

## [your section title]

<!--
THE PART THAT SURPRISED YOU — The warm list replied less than the cold list.
This is the section people will actually remember. Resist explaining it away
in one line. What do you think is true here? What would you have to test to
know? "Gave up and moved on" is available to you if you want it.
-->

## [your section title]

<!--
THE GATE — You built Kaiwa/Approved Auto-Send and it has zero messages in it.
Why does the draft folder stay a draft folder. This is where the post earns its
title, whatever the title turns out to be. Say the honest version, including if
part of it is squeamishness rather than principle.

Then close the loop with the section above: the first-20 rule plus the bcc IS
the condition for opening that lane. State it as the rule you now hold yourself
to — twenty clean drafts read by hand, then automation, with you on bcc for at
least one of every send. If you haven't met that bar yet, say so; that is more
useful to a reader than pretending the lane is open.
-->

## [your section title]

<!--
THE CAVEAT — Where this breaks down. Candidates, pick what is true:
  - the Loom link is identical for everyone; the personalisation is one paragraph deep
  - n is small and the campaign is five months old, not five years
  - a reply is not a call and a call is not a customer — say what happened downstream
  - sending from a personal Gmail does not scale and you would not want it to
-->

## [your section title]

<!--
THE TAKEAWAY — One sentence on what you are doing differently now.
Do not summarise. Land it.
-->

## [your section title]
