---
title: "Build Your Own AutoResearch"
date: "2026-05-12"
description: "A field guide to implementing Karpathy's autoresearch pattern on your own project, including the part where the naive version fails."
---

Andrej Karpathy [open-sourced a repo called autoresearch](https://github.com/karpathy/autoresearch) where an agent runs experiments on itself overnight: hypothesize, change one knob, measure, keep or revert, repeat. By morning the loop has tried dozens of ideas and you have a results file you can read like a lab notebook.

It is one of the most exciting AI patterns I have seen in years. It is also one of the easiest to copy badly. This essay is the version of the guide I wish I had before I burned a weekend on the wrong shape.

## Why the pattern works for Karpathy

The reason autoresearch works for LLM pre-training is that the scoring function is almost perfect:

- **Cheap.** Validation loss is a forward pass.
- **Deterministic.** Same weights, same data, same number.
- **Fixed time.** Every experiment runs for the same five-minute budget.
- **Transferable.** A change that lowers loss at small scale usually lowers it at larger scale.

Under those conditions, an agent can hill-climb without supervision. Every score is comparable. The ceiling is clear. You wake up and read the diff.

## Why the naive copy fails

The trap is to take this pattern and aim it at product surfaces: onboarding copy, conversation prompts, outreach messages. The instinct is "make the score an LLM-as-judge." It looks like it works. It does not.

| Karpathy's setup            | Naive product-copy port                         |
| --------------------------- | ----------------------------------------------- |
| Cheap, deterministic metric | GPT-4o judge: slow, expensive, noisy, drifts    |
| Fixed 5-min time budget     | Simulated conversation: variable, unstable      |
| Score transfers to prod     | LLM judge ≠ real user behavior                  |
| Ceiling is clear            | No ceiling; agent hill-climbs to the judge bias |

The agent will dutifully "improve" the score and the score will mean nothing. Worse, you will trust it for a week before you notice. Karpathy says this himself in passing: the metric must be reasonably efficient to evaluate, and proxy metrics need to actually proxy.

## The rule I now use

**Your scoring function must be cheap, deterministic, and derived from real signal.** If you cannot score that way, do not autoresearch it yet. Ship a small change by hand and measure the old-fashioned way.

Before adding a loop, walk this checklist top to bottom and stop at the first "yes":

1. **Is there an analytics event that fires when the feature works?** Use it. This is the strongest signal.
2. **Is there a file-level property you can compute without an LLM?** Character count, regex, schema validates, key exists. Ten lines of code.
3. **Can a rule-based script compute a yes/no rubric?** "Greeting includes the name, turn is under twelve words, message mentions the user's goal." Accumulate booleans.
4. **Can you A/B the change and read real user outcomes?** Slow but real.
5. **Only if 1–4 fail:** consider an LLM judge. Hand-label at least twenty samples first, require ≥80% agreement with the judge, and cap its weight so real data still wins.

If you skip the checklist you will build a loop that climbs the wrong hill very efficiently.

## What to run first

You do not need ten loops. You need one that runs every day without you. Here is the order I would build them in for almost any web product.

| #   | Loop                  | Type       | Signal source        | Why it matters                                              |
| --- | --------------------- | ---------- | -------------------- | ----------------------------------------------------------- |
| 1   | **pain-watchdog**     | Monitoring | Analytics events     | Catches user-visible problems before support tickets do     |
| 2   | **bandit**            | Monitoring | Analytics events     | Thompson Sampling shifts real traffic toward the winner     |
| 3   | **lighthouse**        | Monitoring | Lighthouse CLI       | Catches performance regressions before they compound        |
| 4   | **local-benchmark**   | Experiment | Playwright timings   | Overnight loop with no API cost; safe place to learn        |
| 5   | **seo + structure**   | Monitoring | Site crawl           | Sitemap freshness, JSON-LD validation, route completeness   |
| 6   | **content-gap**       | Monitoring | Local file diff      | Translation coverage and keyword gaps                       |

All of these can be plain Node.js scripts. None of them need a live LLM in the loop.

## Two shapes, one folder

I split loops into two shapes and never mix them:

**Monitoring loops** read production signals and report findings. They never modify source code. Cron them daily. They produce a state file you commit so the baseline updates with the repo.

**Experiment loops** let an agent modify files, evaluate the result with a deterministic benchmark, and iterate. They run overnight on a dedicated branch and commit every kept change. They are the closest analogue to Karpathy's loop. They only earn the right to exist when the benchmark is real.

```
autoresearch/
├── README.md                       ← your scoring philosophy
├── run-all.js                      ← monitoring orchestrator
│
├── pain-watchdog/                  ← [analytics] user-visible pain signals
├── bandit/                         ← [analytics] A/B Thompson Sampling
├── lighthouse/                     ← [no API]    perf + a11y + SEO scores
├── seo/                            ← [no API]    sitemap + crawl freshness
├── structured-data/                ← [no API]    JSON-LD validation
├── i18n/                           ← [no API]    translation coverage
├── content-gap/                    ← [no API]    keyword + post gaps
│
└── local-benchmark/                ← [no LLM]    Playwright experiment loop
    ├── program.md                  ← the agent's instructions
    ├── benchmark.js                ← the deterministic score
    └── results.tsv                 ← lab notebook
```

The README at the root is where you write your scoring philosophy: which loops you have, what each one measures, and which ones you deliberately did not build. Link it from PR reviews. Future-you will forget the rules within a month.

## The overnight loop, in one paragraph

The agent is given three files and one rule: read `program.md` and `benchmark.js`, create a dated branch, run the baseline, then loop forever. Each iteration: hypothesize one change, edit exactly one allowed file, build and bench, keep the change if the score improved, revert otherwise. Commit every kept change with the score in the message. Never stop, never ask. By morning, `results.tsv` is the lab notebook and `git log` is the argument.

That is the entire pattern. The hard part is not the loop. The hard part is being honest about whether the score is real.

## If you want to autoresearch something subjective

Conversation quality. Onboarding warmth. Outreach tone. The instinct is to simulate it and score with a judge. Resist.

Instead:

1. Ship the change behind a feature flag.
2. Let a bandit observe real session outcomes: duration, return rate, explicit ratings, downstream conversion.
3. Let Thompson Sampling shift traffic toward the winner.

This is strictly slower than an overnight LLM-judge loop. The signal is real. After two weeks you will know more than the judge would have told you in a night, and you will not have to unwind a month of optimization against bias.

## The promotion checklist

A "winning" arm is necessary but not sufficient. Before promoting any bandit arm to default, three things must be true:

| Dimension          | What to check                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| **Runtime wiring** | The arm is actually serving traffic. Events carry the right variant tag.                             |
| **Signal**         | The recommendation has been stable across ≥5 consecutive runs with ≥20 sessions on the winner.       |
| **Docs parity**    | The experiment is logged with hypothesis, observed lift, and the date you promoted it.               |

If any dimension is missing, keep running the loop. Do not promote on vibes. The reason for the discipline is the same reason Karpathy's loop is stable: every experiment has a fixed time budget, and yours is only stable once enough real sessions accumulate.

## The honest part

I removed two LLM-judge loops from my own project before writing this. They had been running for weeks. The "winning" prompts were measurably worse for users than the controls — the judge had a bias I did not catch until I hand-labeled twenty samples and saw the disagreement.

Autoresearch is one of the most powerful patterns I have used. It is also the easiest place to fool yourself, because the loop never stops producing convincing-looking numbers. The discipline that makes it work is not technical. It is being willing to delete the loops that lie.

Start with one monitoring loop on a real signal. Run it for a month. Add a second only when the first one has caught something you would have missed. That is the path.
