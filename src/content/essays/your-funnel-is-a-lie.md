---
title: "Your Funnel Is a Lie"
date: "2026-02-09"
description: "Why Markov chains are a better mental model for SaaS growth than the traditional sales funnel."
---

I've been staring at funnel diagrams for months and something about them has always felt off.

You know the shape. Wide at the top, narrow at the bottom. General audience, site visitors, signups, free users, paid users. Done. Everyone nods along in the meeting. It looks clean on a slide. But it's a lie — or at least, it's a convenient fiction that hides what's actually happening.

Real users don't fall down a hole. They bounce. A paid user downgrades to free. A free user disappears for three months and then upgrades. Someone refunds and re-enters your world six months later through a different landing page. The funnel doesn't have a shape for any of that. It just pretends those people don't exist.

## Enter the Markov Chain

So I started thinking about this differently. What if we modeled the whole customer lifecycle as a Markov chain instead?

Quick detour if you haven't touched probability theory in a while: a Markov chain is a system where you have a bunch of states, and each state has some probability of transitioning to another state. The key property is that where you go next only depends on where you are *now*, not how you got there. A user sitting on your free tier has some probability of upgrading, some probability of churning, some probability of staying put — and those probabilities don't care whether they found you through Google or through a friend's tweet.

This maps to a SaaS business almost perfectly. Your states are something like: General Audience, Site Visitor, Free User, Paid User, Churned. And instead of a one-way slide, you get loops. Free to Paid. Paid to Free. Paid to Churned. Churned back to Free. It's an ecosystem, not a pipeline.

## The Dark Part

Here's the thing that hit me when I actually thought through the math: in any Markov chain, if you have an **absorbing state** — a state you can enter but never leave — the long-run equilibrium is that everyone ends up there.

Churn is an absorbing state.

If you stop adding new people to the system, the math says your user count goes to zero. Every single person eventually leaves. That's not pessimism, it's just what the equations say. The "equilibrium" of a closed system with an exit is empty.

Which means growth isn't optional. The source — new people entering the top — isn't just marketing. It's the thing keeping the entire system alive. You're not filling a bucket; you're fighting entropy.

## The Part That Actually Matters: Cost

But here's where it gets interesting for me as a founder. Most people model these transitions as simple percentages. "We convert 5% of free users to paid." Okay, great. But what does it *cost* to move that number?

This is the variable I keep coming back to. Every transition in the chain has an associated cost — in money, in engineering time, in attention. And those costs are wildly different.

Doubling your top-of-funnel impressions might cost you $10k in ads. Improving your free-to-paid conversion from 5% to 10% might cost you three weeks of rebuilding your onboarding flow. Which one moves the needle more on revenue? Which one is cheaper per dollar of outcome?

I want to think of each transition as a function: `f(cost) → Δ conversion rate`. Some of those functions have steep curves (small investment, big improvement). Some are nearly flat (you're already optimized, throwing more money at it barely moves the number). The game is figuring out which transitions still have juice.

Right now, for my product, I have decent impressions. They lead to some clicks. Clicks lead to far fewer signups. Signups lead to an even smaller group of paid users. The funnel view says "optimize the top." The Markov view says "look at every transition, find the cheapest one to improve, and focus there." For me, that's clearly the signup-to-paid loop. That's where the onboarding experience, the free trial, and the promise of value all live.

## The Honest Caveat

I should be upfront: this is mostly a mental model for me right now, not a rigorous analytical tool. The math behind Markov chains is well-established — you can compute steady-state distributions, expected time to absorption, all of it. But you need data for that. Real transition probabilities from real cohorts.

When you're early and your traffic is small, you don't have statistically significant numbers for any of these transitions. You're working with samples of 20 or 50 people, which means your "conversion rates" are noisy guesses at best.

So I use this as a way to *think*, not a way to calculate. It keeps me honest about the fact that users move in loops, not lines. It reminds me that churn is gravity. And it forces me to ask "what does it cost to improve this specific transition?" instead of just "how do I get more people in the top?"

## Building an Engine, Not a Funnel

The reframe I keep coming back to is this: I'm not building a funnel. A funnel is a passive shape that relies on volume at the top. I'm building an engine — a set of loops where each transition reinforces the others.

Good onboarding improves free-to-paid. Happy paid users generate referrals, which feeds the top. A smooth downgrade path (instead of just churn) keeps people in the ecosystem where they might upgrade again later.

You can get lifetime value, acquisition cost, and payback period out of these loops if you model them right. But more than the math, it changes how you *think* about the business. Every feature, every email, every pricing change is touching a specific transition in the chain. The question is always: which transition, and at what cost?

I don't have all the answers mapped out yet. But I know the funnel diagram isn't the right map.
