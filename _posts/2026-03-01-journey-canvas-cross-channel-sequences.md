---
layout: post
title: "Did You Lose the Conversion, or Just Lose Sight of It?"
subtitle: "Using Journey Canvas in CJA to trace what happens after digital friction, and why 'abandoned' doesn't always mean lost."
tags: [CJA]
read_time: 5
emoji: "🗺️"
---

I had a hunch that our funnel was lying to us. Not maliciously. Just quietly, by not knowing where to look.

When a customer hits a checkout error and doesn't complete their purchase on the website, the funnel report marks it as lost. That felt too tidy to me. So I asked: what if they just called in instead?

## Channel shift vs. drop-off

Most funnel analysis is channel-blind, and I think that's a genuinely underappreciated problem. It tracks a user through a sequence of digital touchpoints and calls anything that doesn't end in a conversion a failure. But customers don't think in channels. When friction appears in one place, some of them just continue elsewhere. Very reasonable behaviour, actually.

The question I started asking is not just "did they convert?" but "did the friction cause them to not convert at all, or just to complete through a different channel?"

Those two outcomes look identical in a standard digital funnel. They're not. One is a lost sale. The other is a sale that nearly went uncredited.

## Journey Canvas in CJA

I've been playing with Journey Canvas in Customer Journey Analytics for exactly this kind of cross-channel sequence analysis. Rather than showing fallout from a fixed digital path, it lets me define sequences across touchpoints and see where users actually go, not just where they leave.

The two hypotheses I set up for a checkout-error scenario:

- Checkout → Error → Call Centre → Order
- Checkout → No Error → Call Centre → Order

<br>
<img class="datadiaryimage" src="{{ "/journey.jpeg" | relative_url }}" alt="EvenDriven">

<br>

Both paths end in a call centre order. The interesting question is whether the error is correlated with the channel shift: is the friction creating call centre volume that wouldn't otherwise exist?

If the first sequence is significantly more common than the second, I have something worth showing the team. The conversion rate looks fine on paper. The call centre is quietly absorbing what the website broke.

## A few things I learned to watch out for

Journey Canvas makes it very easy to find sequences that look meaningful but aren't. I've made that mistake.

**Time constraints matter.** An order that happens six weeks after a checkout error probably isn't caused by it. I set a window that reflects realistic decision timelines for the product: hours for low-consideration purchases, a few days for anything more considered.

**Always compare against a baseline.** How often does Checkout → Call Centre → Order happen without an error step? If it's nearly as common, the error isn't really doing much. The sequence only means something in relation to the baseline.

**Mind the sample size.** Cross-channel paths are often rare. A compelling-looking sequence with 40 users in it is a hypothesis, not a finding. I've learned to say "interesting, let's investigate" rather than "here's what's happening."

## What this changed for me

Once I could see cross-channel sequences, "abandoned" stopped being a terminal verdict. It became a branch point: users who left the digital path went somewhere, and some of them came back through another channel. Journey Canvas lets me follow them.

The funnel didn't end. I just wasn't watching the right thing.

---