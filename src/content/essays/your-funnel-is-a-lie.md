---
title: "Your Funnel Is a Lie"
date: "2026-02-09"
description: "Why Markov chains are a better mental model for SaaS growth than the traditional sales funnel."
---

<!--
STATUS: DRAFT — Fill in the [bracketed sections] with your own words, then delete the brackets.
When done, remove this comment block and all brackets.
-->

I've noticed that a lot of traditional companies view everything as a funnel, especially when it comes to marketing. Top of the funnel is the general audience, then they have exposure to your site, then some sign up, then some are freemium users, some pay, and then it's pretty much done. That's the whole model.

[Add 1-2 sentences here about why this bugs you specifically. What feels wrong about it? Is it that it ignores users who go backwards? That it makes growth look simple when it isn't? Say it in your own words.]

But what if we view all these lifecycles as part of Markov chains?

## What I mean by that

[Explain what a Markov chain is in your own words — keep it simple. Something like: "A Markov chain is basically ___. Think of it like ___." Use a concrete example if one comes to mind — could be a board game, could be weather, could be anything. The point is: there are states, and you move between them with some probability.]

The thing that makes it useful here is that every part of the customer lifecycle is a state — general audience, site visitor, free user, paid user, churned — and people move between them in every direction. Not just down. A paid user goes back to free. A free user upgrades. A paid user refunds and goes back to being part of the general audience.

It's interesting since every part of this is in some form a recursive function that can funnel out to different points. It's not a straight line. It's loops.

[Optional: mention here that funnels make people think it's a one-way trip, but real users bounce around constantly. Maybe give a specific example from your own product if you have one — like "I've seen users who churned come back three months later through a completely different page."]

## The equilibrium problem

One thing that comes to mind immediately: given enough time, the company's equilibrium should logically reach a point where all customers leave. If you treat every part of that chain as a Markov chain, and churn is what they call an "absorbing state" — a state you can enter but never leave — then the math just says everyone ends up there eventually.

[Explain absorbing state in a simple way. Something like: "An absorbing state is just a state with no way out. Once you're there, you're stuck. And churn is exactly that — nobody 'un-churns' on their own." Or use your own analogy.]

That sounds dark but it's just what the equations do. If you stop adding new people, the system empties out. Growth isn't a nice-to-have, it's the thing keeping the whole system from hitting zero.

## The cost part is what I keep thinking about

But the most important part is combining it with price variables. Most people just look at percentages — "we convert 5% of free to paid." Okay. But what does it cost to change that number?

What if we could combine every single Markov chain transition as a function, where the input is the amount of resources needed to increase that transition rate, and the output directly affects the equilibrium of the whole system?

[Give a concrete comparison here. Something like: "Doubling my ad spend might cost $X and get me Y more impressions. But spending three weeks rebuilding onboarding might double my free-to-paid rate. Which one actually moves revenue more?" Use your real numbers if you're comfortable, or rough estimates.]

That's the actual question. Not "what's the conversion rate" but "what does it cost to change it."

## Where I'm at right now

I'm thinking about this quite a lot since I have a lot of impressions, which leads to some clicks to my site, which leads to a lot fewer signups to try, and the smallest cohort of paid users. Each part matters, but the most important at any point is the signups to the paid users. And to get this part, I have an onboarding they can try, and I need different chains for the free users.

I'm trying to think of the best ways to map it out, but I want it to be a lifecycle analysis of the company, and how we view the essence of different parts. If we add costs to the parts of the Markov chain, the only conversion that really matters right now is increasing the free to paid users, and showing the value of what you are producing or the promise of value.

[Optional: describe what your onboarding looks like right now and what you think is working or not working. This makes it real.]

## The honest part

In any case, it's a lot easier to test with people, so sometimes these numbers are meaningless unless you have an audience. When your sample size is 20 people, your "conversion rate" is basically noise. So you start by focusing on getting a steady number of free users first.

The question becomes what are ideal numbers for each part and how to break it down. In many ways we can even get the cost of acquisition or lifetime value of a customer from these parts — the math is all there. But right now, for me, this is a mental model first and a math tool second.

[Say what you're actually going to do next. Are you going to try to map this out in a spreadsheet? Build a dashboard? Just keep it in your head for now? End with something honest about where you are.]

## What I'm actually building

I keep coming back to this: I'm not building a funnel. A funnel is a passive shape that needs volume poured into the top. I'm building an engine — loops where each transition feeds the others.

I don't have all the numbers yet. But I know the funnel diagram isn't the right map for what's actually happening.
