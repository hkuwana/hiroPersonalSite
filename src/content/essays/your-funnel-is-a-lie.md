---
title: "Your Funnel Is a Lie"
date: "2026-02-09"
description: "Why Markov chains are a better mental model for SaaS growth than the traditional sales funnel."
---

<!--
STATUS: DRAFT — Fill in the [bracketed sections] with your own words, then delete the brackets.
When done, remove this comment block and all brackets.
-->

Everyone with basic marketing knowledge knows the funnel. At the top is where the general audience gets brand awareness, then interest, then conversion, and finally loyalty. They have exposure to your site, some sign up, some become freemium users, some pay, and then it's pretty much done. That's the whole model.

But there's a problem. The funnel assumes there's only one path: downwards. It's a nice mental model, but it's not true. Users can go from hating a product to trying it out, liking it, buying it, churning, and then coming back once the product has improved to buy it again. It's not a linear path. It's a loop.

What if, instead of a funnel, we viewed these lifecycles as **Markov chains**?

## Markov Chains as a Better Model

A Markov Chain (for those unscarred by statistics courses) is really simple. It creates a model of how states relate to each other and the probability of moving between them.

For example, say we have 4 states: Visitor, Free User, Paid User, and General Audience. There's a chance that a person in one state can move to any other state, and we model it by percentages (e.g., 0.85 means 85%). If we were to show it on a graph (or for technical people, a transitional matrix), it would look something like this:

| State           | Visitor    | Free User  | Paid User  | General Audience    |
| --------------- | ---------- | ---------- | ---------- | ------------------- |
| **General Audience**| 0.02       | 0.00       | 0.00       | 0.98                |
| **Visitor**         | 0.85       | 0.10       | 0.01       | 0.04                |
| **Free User**       | 0.05       | 0.70       | 0.05       | 0.20                |
| **Paid User**       | 0.00       | 0.15       | 0.85       | 0.00                |

The thing that makes this useful is that every part of the customer lifecycle is a **state** — general audience, site visitor, free user, paid user, churned — and people move between them in *every* direction. Not just down.

A paid user goes back to free. A free user upgrades. A paid user refunds and goes back to being a free user, or even fully churns back to the general audience.

Every part of this is a recursive function that can funnel out to different points. It's not a straight line. It's loops.

The funnel treats people who have reverted from "paid" to "free" as a loss, rather than a potential opportunity to convert them back. If we think about the transition from visitor to free user, we also have to think about how likely they are to transition to other states.

I've had free users who have churned, come back to try the product again, and then churned again. Marketing should mimic the lifecycle of this behavior.

## The Cost of Transition

The most important part is combining these states with price variables. Most people just look at percentages — "we convert 5% of free to paid." Okay. But what does it cost to change that number?

What if we could combine every single Markov chain transition as a function, where the input is the amount of resources needed to increase that transition rate, and the output directly affects the equilibrium of the whole system?

From a product perspective, it reveals the different lifecycles we should optimize. Maybe it's increasing retention, or increasing the percentage of paid users staying on as paid users, or the percentage of free users converting to paid users. It could even be increasing the number of people entering the system at the top.

That's the actual question. Not "what's the conversion rate," but "what does it cost to change it?"

## Applying This to Kaiwa

I'm thinking about this quite a lot right now. I have a number of impressions, which leads to some clicks to my site, which leads to fewer signups, and finally the smallest cohort: paid users. Each part matters, but the most important transition right now is from signups to paid users. To improve this, I have an onboarding flow they can try, but I need to design different chains for the free users.

I want to map this out as a lifecycle analysis of the company. If we add costs to the parts of the Markov chain, the only conversion that really matters right now is increasing the **free to paid** users.

Right now, I'm focused on showing value to anyone who shows interest. How do I increase the free users so that they convert to paid users, once they see the value and give Kaiwa a try?

## The Reality of Small Numbers

It's easy to theorize, but easier to test with real humans. Sometimes these numbers are meaningless unless you have an audience. When your sample size is 20 people, your "conversion rate" is basically noise. So you start by focusing on getting a steady number of free users first.

The math is all there to calculate the cost of acquisition or lifetime value from these parts. But right now, for me, this is a mental model first and a math tool second.

## Building an Engine, Not a Funnel

I keep coming back to this: **I'm not building a funnel.** A funnel is a passive shape that needs volume poured into the top. I'm building an engine — loops where each transition feeds the others.

I don't have all the numbers yet. But I know the funnel diagram isn't the right map for what's actually happening.

## Technical Note: The Equilibrium Problem

For the more technical readers: yes, we can model each state as a continuous-time Markov chain. At the point of infinity, because the churn is so large, we expect the system to empty out into churn (the absorbing state).

I haven't figured out a perfect model, but say it's over a defined period of time rather than infinite. Whatever the timeframe, we can weight each state with an expected value or cost of acquisition.

I'm still mulling on how to model this better, but I'd love to keep the dialogue going.