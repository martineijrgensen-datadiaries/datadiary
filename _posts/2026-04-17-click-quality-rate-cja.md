---
layout: post
title: "Your Best-Performing Metric Might Be Your Worst"
subtitle: "Why click volume is a trap — and how a click quality rate tells you what clicks actually did."
tags: [CJA]
read_time: 5
emoji: "🎯"
---

High clicks. Low bounce rate. Must be working.

That's the assumption. And it's often wrong.

## The problem with counting clicks

Clicks tell you that something was touched. They don't tell you whether the touch did anything useful. A navigation element with thousands of clicks and a low bounce rate looks strong in a standard report. But if the users who clicked it didn't go on to do anything meaningful — didn't view a product, didn't add to cart, didn't log in, didn't navigate somewhere relevant — the click was noise, not signal.

You measured activity. You didn't measure progress.

## Click quality rate

The fix is to add a layer: for each click event, ask whether it was followed by a meaningful action. Define what "meaningful" looks like for your context — a product view, an add-to-cart, a successful login, a key page navigation — and track what percentage of clicks preceded one of those outcomes. That's your click quality rate.

A navigation entry with 40% click quality means 40% of the users who clicked it went on to do something that mattered. One with 5% means 95% of those clicks went nowhere.

## Seeing it in a scatter plot

The clearest way to surface this in CJA is a scatter plot:

- **X-axis**: bounce rate
- **Y-axis**: navigation clicks
- **Bubble size**: click quality rate

This layout lets you spot the dangerous quadrant immediately: high clicks, low bounce rate, small bubble. That's the element that looks healthy by every traditional measure and is quietly failing.

Two navigation entries side by side told this story clearly. One had high clicks and low bounce — the classic "winner." But the bubble was small. Most users who clicked it didn't take a meaningful next step. The second entry had fewer clicks and a slightly higher bounce rate — looked weaker — but a significantly larger bubble. The users who clicked it were far more likely to continue into the funnel.

Optimising for the first entry would have been the wrong call.

## What this changes

Once you have click quality rate as a dimension, you stop asking "which element gets the most clicks?" and start asking "which element actually moves users forward?" Those are different questions with different answers.

Bounce tells you where users left. Clicks tell you what they touched. Click quality rate tells you whether the interaction worked. You need all three to know what's actually happening.

---

*Tagged: #customerjourneyanalytics #adobeanalytics #adobe #webanalytics*
