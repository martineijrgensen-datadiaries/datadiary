---
layout: post
title: "From Pages to Events: Why Your Data Layer Needs to Think Like a User"
subtitle: "What happens when your data layer thinks in pages but your platform speaks events."
tags: [CJA, AEP]
read_time: 5
emoji: "⚡"
---

When someone goes through checkout, they're not thinking *"I'm on the delivery page."* They're thinking *"I want home delivery."* They're making a decision.

Traditional web tracking is built around the first mental model: where someone is on a page. Event-driven tracking is built around the second: what they actually did.

That difference looks small on a slide. It looks enormous in your data.

## What page-based tracking misses

A classic setup sends a page view hit when the URL changes. The cart page fires. The checkout page fires. The confirmation page fires. You know where the user was. You don't know what they chose or why they moved.

For a simple funnel report, fine. For anything downstream (personalization, Journey Optimizer flows, CJA journey analysis, AI recommendations) you're working with a skeleton. You know the bones of the journey but none of the muscle.

## The Adobe Client Data Layer approach

Adobe Client Data Layer (`window.adobeDataLayer`) gives you a structured, event-first way to push signals from your frontend into the pipeline. Instead of inferring intent from URL changes or DOM state after the fact, you push an explicit event at the moment something meaningful happens:

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

You're not capturing where the user is. You're capturing what they did and what they chose. The step name, the option selected, the completion state: all explicit, all structured, no URL parsing required.

## Why this matters for the Adobe stack

CJA, AEP, and Journey Optimizer are all built around events. Not page views. Events. An XDM schema represents an event with a timestamp, an identity, and a set of fields. A journey in Journey Optimizer is triggered by an event. A segment in AEP is evaluated against events.

If your data layer produces page view hits with URL strings, you're translating that signal downstream the whole way. Parsing URLs, inferring intent, adding fragile logic to turn location data into action data. That's where errors pile up and where analysis gets soft.

Push clean events from the source and that translation disappears. `checkout:step:complete` with `selectedOption: "home_delivery"` is immediately usable in CJA, immediately actionable in Journey Optimizer, immediately readable by AEP's segmentation engine. No guessing.

## The AI argument

AI models are only as good as the signals you feed them. A model trained on page view sequences can learn navigation patterns. A model trained on structured events (steps completed, options chosen, friction points encountered) can learn intent patterns.

That's not a minor upgrade. Recommendations, propensity scoring, next-best-action: all of these depend on the quality and specificity of the underlying event stream. Event-driven tracking is the infrastructure layer that makes those capabilities real, not theoretical.

## The practical shift

Moving to event-driven tracking isn't a rip-and-replace. It's a layer you add on top of what you already have, or build into it. Start with the moments that matter most: checkout steps, form completions, key product interactions. Push structured events for those. See how much cleaner the data looks in CJA before you've written a single derived field.

The users are already thinking in events. The platforms are built for events. The data layer should be too.
