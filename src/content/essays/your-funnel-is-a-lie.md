---
title: "Your Funnel Is a Lie"
date: "2026-02-09"
description: "Why Markov chains are a better mental model for SaaS growth than the traditional sales funnel."
---

<!--
STATUS: DRAFT — Fill in the [bracketed sections] with your own words, then delete the brackets.
When done, remove this comment block and all brackets.
-->

Everyone who has basic marketing knowledge knows that about the funnel. At the top is where the general audience gets the brand awareness, then interest, then conersion, and deeper or more loyal layers of the funnel/ They have exposure to your site, then some sign up, then some are freemium users, some pay, and then it's pretty much done. That's the whole model.

But you see, there's a problem. The funnel assumes there's only one path downwards, and it's nice mental model, but it's not true. Users can come from hating a product, and then try it out, and then like it, and then buy it, and then churn, and then come back once the product has improved, and then buy it again. It's not a linear path. It's more of a loop.

But what if we view all these lifecycles as part of Markov chains?

## What I mean by that

A Markov Chain (For those unscarred by statistics courses) is really simple. It's how each states relate to each other and the probability of moving between them. So for example, Say we have 4 states, visitor, free user, paid user, and general audience. There's a chance that each state can move to any other state, and we model it by percentages (ie 0.85 means 85% and 0.01 means 1% for example). If we were to show it on a graph (for techinical people, a transitional matrix), it would look something like this:


| State           | Visitor    | Free User  | Paid User  | General Audience    |
| --------------- | ---------- | ---------- | ---------- | ------------------- |
| General Audience| 0.02       | 0.00       | 0.00       | 0.98                |
| Visitor         | 0.85       | 0.10       | 0.01       | 0.04                |
| Free User       | 0.05       | 0.70       | 0.05       | 0.20                |
| Paid User       | 0.00       | 0.15       | 0.85       | 0.00                |


The thing that makes it useful here is that every part of the customer lifecycle is a state — general audience, site visitor, free user, paid user, churned — and people move between them in every direction. Not just down. A paid user goes back to free. A free user upgrades. A paid user refunds and goes back to being part of a free user, then a visitor, and a general audience. 

It's interesting since every part of this is in some form a recursive function that can funnel out to different points. It's not a straight line. It's loops.

What's important is that the funnel treats people who have turned from paid users who reverted back into free users as a loss, rather than a potential opportunity to convert them back into paid users. If we think about visitors to free users, we have to think about how likely they are to convert to paid or churned users, since if we do have these states it becomes easier to map out the transition functions.

I've had free users who have churned and then come back to try the product again, and then churned again. It's not a linear path as much as a cycle or a loop, and marketing should mimic the lifecycle of this behavior.

## The cost part is what I keep thinking about

But the most important part is combining it with price variables. Most people just look at percentages — "we convert 5% of free to paid." Okay. But what does it cost to change that number?

What if we could combine every single Markov chain transition as a function, where the input is the amount of resources needed to increase that transition rate, and the output directly affects the equilibrium of the whole system?

From a product perspective, it shows a lot more about the different lifecycles we should think about and how we can increase the parts. Whether it's increasing retention, it's increasing the percentage of paid users staying on as paid users, or the percentage of free users converting to paid users. It could even be increasaing the number  

That's the actual question. Not "what's the conversion rate" but "what does it cost to change it."

## Where I'm at right now

I'm thinking about this quite a lot since I have a lot of impressions, which leads to some clicks to my site, which leads to a lot fewer signups to try, and the smallest cohort of paid users. Each part matters, but the most important at any point is the signups to the paid users. And to get this part, I have an onboarding they can try, and I need different chains for the free users.

I'm trying to think of the best ways to map it out, but I want it to be a lifecycle analysis of the company, and how we view the essence of different parts. If we add costs to the parts of the Markov chain, the only conversion that really matters right now is increasing the free to paid users, and showing the value of what you are producing or the promise of value.

Right now, I'm focused on showing value for anyone who shows interest in the product, and I'm trying to think of the best way to do that and to show the paying call to action. Like how do I increase the free users so that they convert to paid users as they see the value and give a chance at giving Kaiwa a try?

## The honest part

In any case, it's a lot easier to test with people, so sometimes these numbers are meaningless unless you have an audience. When your sample size is 20 people, your "conversion rate" is basically noise. So you start by focusing on getting a steady number of free users first.

The question becomes what are ideal numbers for each part and how to break it down. In many ways we can even get the cost of acquisition or lifetime value of a customer from these parts — the math is all there. But right now, for me, this is a mental model first and a math tool second.


## What I'm actually building

I keep coming back to this: I'm not building a funnel. A funnel is a passive shape that needs volume poured into the top. I'm building an engine — loops where each transition feeds the others.

I don't have all the numbers yet. But I know the funnel diagram isn't the right map for what's actually happening.

## The equilibrium problem

For those more techincal people, yes we can model each as a continous time markov chain. At the point of infinite because the churn is so large we expect the system to empty out into churn after running over multiple events as the absorving state.

I haven't figured out a good model but say it's over a period of time rather than infinite, and somehow we can weight each model during the paid with some kind of expected value or cost of acquisition. Then we can model the system as a Markov chain with a time limit and a cost of acquisition. 

I'm not sure how to model this better and still mulling on it, but I'd love to keep the dialogue going and understand how to model this better.