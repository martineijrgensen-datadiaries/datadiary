---
layout: post
title: "Did You Lose the Conversion, or Just Lose Sight of It?"
subtitle: "Using Journey Canvas in CJA to trace what happens after digital friction — and why 'abandoned' doesn't always mean lost."
tags: [CJA]
read_time: 5
emoji: "🗺️"
---

When a customer hits a checkout error and doesn't complete their purchase on your website, the funnel report marks it as lost. But what if they called in and completed the order through your contact centre instead?

The conversion happened. Your digital analytics just can't see it.

## Channel shift vs. drop-off

Most funnel analysis is channel-blind. It tracks a user through a sequence of digital touchpoints and calls anything that doesn't end in a conversion a failure. But customers don't experience your channels as separate systems. When friction appears in one place, some of them simply continue elsewhere.

The question isn't just "did they convert?" — it's "did the friction on the digital channel cause them to not convert at all, or just to complete through a different channel?"

Those two outcomes look identical in a standard digital funnel. They're not. One is a lost sale. The other is a sale you nearly didn't notice.

## Journey Canvas in CJA

Journey Canvas in Customer Journey Analytics is built for exactly this kind of cross-channel sequence analysis. Rather than showing fallout from a fixed digital path, it lets you define sequences across touchpoints and see where users continue — not just where they leave.

The two hypotheses worth comparing for a checkout-error scenario:

- Checkout → Error → Call Centre → Order
- Checkout → No Error → Call Centre → Order

Both paths end in a call centre order. The question is whether the error is correlated with the channel shift — whether the friction is driving call centre volume that wouldn't otherwise exist.

If the first sequence is significantly more common than the second, you have evidence that your checkout errors aren't just causing digital abandonment; they're pushing costs into another channel. The conversion rate looks fine. The call centre team is quietly absorbing the failure.

## Using it carefully

Journey Canvas makes it easy to find sequences that look meaningful but aren't. A few things that matter:

**Time constraints.** An order that happens six weeks after a checkout error probably isn't caused by it. Set a window that reflects realistic decision timelines for your context — hours for low-consideration purchases, days for higher-consideration ones.

**Baseline comparison.** How often does Checkout → Call Centre → Order happen without an error step? If it's nearly as common, the error isn't doing much. The sequence is only interesting in relation to the baseline.

**Sample size.** Cross-channel paths are often rare. A compelling-looking sequence with 40 users in it is a hypothesis, not a finding.

## What it changes about how you read abandonment

Once you can see cross-channel sequences, "abandoned" stops being a terminal state. It becomes a branch point — users who left the digital path went somewhere, and some of them came back through another channel. Journey Canvas lets you follow them.

The funnel didn't end. It just moved somewhere you weren't watching.

---

*Tagged: #customerjourneyanalytics #adobe #adobeanalytics #analytics*
