---
layout: post
title: "From Pages to Events: Why Your Data Layer Needs to Think Like a User"
subtitle: "What happens when your data layer thinks in pages but your platform speaks events."
tags: [CJA, AEP]
read_time: 5
emoji: "⚡"
---

When someone goes through checkout, they're not thinking *"I'm on the delivery page."* They're thinking *"I want home delivery."* They're making a decision.

Traditional web tracking is built around a page-centric tracking model: where someone is on a page. I still see that a lot on modern websites. While event-driven tracking is built around a different model: what they actually did. 

To me this is not only about data accuracy. It is also about the debugging of the implementation. Because when I can see the seperate events being fired in the console, I can much better undertand the numbers behind it. 

## What page-based tracking misses

A classic setup sends a page view hit when the URL changes. The cart page fires. The checkout page fires. The confirmation page fires. You know where the user was. You don't know what they chose or why they moved.

For a simple funnel report, fine. For anything downstream (personalization, Journey Optimizer flows, CJA journey analysis, AI recommendations) you're working with a skeleton. You know the bones of the journey but none of the .. muscle. I guess you can call it that?? I like analogies but I might not be good at creating them. 

## The Adobe Client Data Layer approach

Adobe Client Data Layer (`window.adobeDataLayer`) gives us a structured, event-first way to push signals from our frontend into the pipeline.

<br>
<img class="datadiaryimage" src="{{ "/eventdriven.png" | relative_url }}" alt="EvenDriven">


<br>
 In other words, instead of inferring intent from URL changes or DOM state after the fact, we can push an explicit event at the moment something meaningful happens:

```js
window.adobeDataLayer.push({
  event: "checkout:step:complete",
  eventInfo: {
    stepName: "delivery",
    stepNumber: 2,
    stepType: "complete",
    selectedOption: "home_delivery"
  }
})
```

So we're not capturing where the user is but what they did and what they chose. The step name, the option selected, the completion state: all explicit, all structured, no URL parsing required.


## Why this matters for the Adobe stack?

My take is: CJA, AEP, and Journey Optimizer are all built around events. Not page views. Events. An XDM schema represents an event with a timestamp, an identity, and a set of fields. A journey in Journey Optimizer is triggered by an event. A segment in AEP is evaluated against events.

If your data layer produces page view hits with URL strings, you're translating that signal downstream the whole way. Parsing URLs, inferring intent, adding fragile logic to turn location data into action data. That's where errors pile up and where analysis gets soft. 

I've also seen hybrid versions. Adobe's ACDL being implemented and Page load events being sent together with all the curernt data and even custom events added to this push. 

I know this has existed for a long time. But it is not common everywhere or the implementation changes has not been prioritised. What I do see is that pushing clean events is much easier to analyse, to debug, to use across the Adobe products. There is less guessing and figuring out. 

## The AI argument

So I also wanted to add a note about AI. Because after Summit, I think it has become even more clear how integrated AI agents will be with the rest of the Adobe ecosystem. But as everyone keeps saying.. "AI models are only as good as the signals you feed them". A model trained on page view sequences can learn navigation patterns. A model trained on structured events (steps completed, options chosen, friction points encountered) can learn intent patterns.

That's not a minor upgrade. Recommendations, propensity scoring, next-best-action: all of these depend on the quality and specificity of the underlying event stream. Event-driven tracking is the infrastructure layer that makes those capabilities real. 

## The practical shift

Moving to event-driven tracking isn't a rip-and-replace. It's a layer you add on top of what you already have, or build into it. And I think we can make it simple: Start with the moments that matter most: checkout steps, form completions, key product interactions. Push structured events for those. See how much cleaner the data looks in CJA before you've written a single derived field.

So from what I’ve seen across different implementations, tracking setups can vary massively depending on internal skills, understanding, prioritization, and ownership. And honestly, it’s incredibly easy to underestimate how important this part of the data collection actually is.

But the users are already thinking in events. The platforms are built for events. The data layer should be too. 
