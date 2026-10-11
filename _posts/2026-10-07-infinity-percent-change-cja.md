---
layout: post
title: "To Infinity and Beyond: Fixing Percent Change in CJA"
subtitle: "Why your percent change column says Infinity%, and three ways to make it say something useful."
tags: [CJA, Field Notes]
read_time: 6
emoji: "♾️"
---

You know the table. Products down the side. Orders in one column, percent change against last period in the next. Conditional formatting on, so the winners glow green and the losers go red.

And at the very top, glowing the greenest of them all: **Infinity%**. 

<img class="datadiaryimage--rounded datadiaryimage--small" src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGQ3NjZ4Mmk4dmdwZzhjMmZ0ZmpiN3R0b24yZG1uMnM0MDZ2cjV5diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BzCLJGxXQbwH09jzq0/giphy.gif" alt="ThanosInfinityStone">


The last time I built one of these tables, I was a bit too quick setting up my percentage metrics, and the top of my table was basically a wall of Infinity%. And it's not even wrong. I just don't find it useful at all.

I'm sure our sales director would've been puzzled if I had announced that our sales were growing by... (っᵔ◡ᵔ)っ ⋆˙⟡ infinity ⋆˙⟡

<img class="datadiaryimage--rounded datadiaryimage--small" src="{{ "/assets/images/infinity.gif" | relative_url }}" alt="BuzzLightYearInfinity">


The actual story behind the funky value is that a product launched this month and went from zero orders to a few hundred. So you might have listed this product in your table with a metric that shows the percentage change and what you're comparing with is just 0. 

I promise no more gifs now. 

---

## Why CJA says Infinity%

This is just one example. Percent change is a simple formula:

```
(this period - last period) / last period
```

It's basic math that is the metric is not automatically adjusting. When last period is zero, you're dividing by zero.
Then CJA finds that undefined and writes Infinity%.

Anything that's new can show 0 the previous period. Maybe you just started collecting data for a certain dimension value. That could be a product that just launched, a campaign that just started, a page that didn't exist a month ago. 

If you need to create a table that shows percentage increase or decrease using the built-in function "Compare time periods" then this will happen. 

Here's a made-up example from a clothing shop that just launched its autumn collection. Sorted by percent change, biggest first, the way CJA sorts it:

| Product | Orders, prior period | Orders, this period | % change |
|---|---|---|---|
| Beanie | 2 | 48 | +2300% |
| Rain jacket | 40 | 88 | +120% |
| Linen shirt | 300 | 210 | -30% |
| Cool sandals | 10 | 4 | -60% |
| Wool coat (new) | 0 | 410 | Infinity% |
| Knit sweater (new) | 0 | 250 | Infinity% |

If you read this table top to bottom you'll see the Beanie is the star of the season. The cool sandals look like the biggest problem. And the two new products, the ones that actually brought in the orders, sit at the very bottom, below the worst performers. I always think of the story to tell with these types of visualisations - and here we don't really get to tell the real story in a meaningful way. 

---

## Fix 1: Guard the denominator

The quickest fix is to stop dividing when there's nothing to divide by.

If you made the column with **Compare time periods**, CJA has already built the percent change as a calculated metric for you. Open it in the calculated metric builder and you'll see two date range containers: **Target date range** (the period in your column) and **Compare date range** (the period you compare against). So here, all you have to do is add an IF around the whole thing:

```
IF(
  GREATER THAN( Orders [Compare date range], 0 ),
  ( Orders [Target date range] - Orders [Compare date range] ) / Orders [Compare date range],
  0
)
```

In the builder it can look like this:

<div class="datadiaryimage datadiaryimage--tall" role="img" aria-label="Calculated metric builder: IF, with GREATER THAN Orders in the Compare date range and 0 as the logical test, the percent change from Target date range and Compare date range as value if true, and 0 as value if false">
{% include diagrams/infinity-if-builder.svg %}
</div>

Then open the column settings in the table and turn on **Interpret zero as no value** if you prefer a simplified view. The Infinity% cells become blank. Now stakeholders cannot be confused by ⋆˙⟡ infinity ⋆˙⟡ 

<div class="datadiaryimage datadiaryimage--tall" role="img" aria-label="Freeform table after the fix: the wool coat and chunky knit sweater had 0 orders in the prior period and now show a blank percent change, while the bucket hat going from 2 to 48 orders still shows 2,300 percent in green">
{% include diagrams/infinity-guarded-table.svg %}
</div>

You can also just build this metric from scratch and it would be the same structure and if-function. Then you create the date ranges yourself. Remember if that date range is rolling, look at the panel calendar under 'Show advanced settings' for 'Make date range components relative to panel calendar'. With it on, the comparison moves with the panel dates. If not, whenever someone changes the panel to last quarter or something like that, the table shows a comparison that makes no sense.

**Pro Tip** 
If you want to keep infinity to show what's new. That's the one useful thing Infinity% can tel us. Then you can add a second metric:

```
IF( EQUAL( Orders [Compare date range], 0 ), Orders [Target date range], 0 )
```

Call it something like "Orders from new products" and turn on **Interpret zero as no value** for that column too. It only shows a number on rows that didn't exist last period. Now "new" is its own column instead of a broken percentage.

---

## Fix 2: Raise the bar

So this is definitely more an interpretive decision. Maybe the business is actually only interested in the percentage change of products with a specific number of orders. That would remove a lot of noise from new products and products with a low number of orders. 

So change the 0 to a minimum base:

```
IF(
  GREATER THAN( Orders [Compare date range], 20 ),
  ( Orders [Target date range] - Orders [Compare date range] ) / Orders [Compare date range],
  0
)
```

Now percent change only shows up for rows that had more than 20 orders last period. Infinity% and small-base noise disappear in one go.

The idea is that the threshold should come from what counts as a meaningful base in your data, not from what makes the table look tidy. If you pick 20, write it in the metric description or table description so the next person knows why the Beanie product is blank.

---

## Fix 3: are we actually answering the analysis question?

I think a lot of workspaces are created without really exploring the actual question that needs to be answered.

Most of these tables might have titles like "Which products moved the orders?" (just as an example) and then use a metric where it is actually unclear how that answers said question. 

"Moved the orders" is an absolute question. So here i'd use an absolute metric:

```
Orders [Target date range] - Orders [Compare date range]
```

A difference can never be infinite. If you already have a 'Compare time period' column in the table, you don't even need the builder: select both columns, right-click and choose 'Create metric from selection -> Subtract'.

Here's the same made-up table which is sorted by the change in orders, with the guarded percent change from Fix 2 next to it:

| Product | Orders, prior period | Orders, this period | Δ orders | % change |
|---|---|---|---|---|
| Wool coat (new) | 0 | 410 | +410 | |
| Knit sweater (new) | 0 | 250 | +250 | |
| Rain jacket | 40 | 88 | +48 | +120% |
| Beanie| 2 | 48 | +46 | |
| Cool sandals | 10 | 4 | -6 | |
| Linen shirt | 300 | 210 | -90 | -30% |


Here we have the same data but we are able to tell the story in a more meaningful way. The autumn collection brought in 660 orders. The Beanie that looked like the star at +2300% moved 46 orders, about the same as the rain jacket at +120%. And the biggest drop on the list isn't the Cool sandals, which looked like the worst at -60%. It's the linen shirt at -30%, because 30% of a big number is a lot of shirts. (I mean it's autumn, so that one is probably just the weather.)

I still keep the guarded percent change as a second column. Since its good context.

---

## Bonus: 'Infinity' as a tell-tale

If you see an Infinity row and somewhere further down a row at -100%, check whether they're the same thing under two names.

Sometimes things like that can happen. A product name changed in the feed. A campaign got renamed halfway through the month. A page name got a new casing. So the old value drops to zero, the new value starts from zero, and your table shows a launch and a death that never happened.

---

## Infinity is just maths being honest

Infinity is not the best value to use for storytelling across the organisation. So I think adding some adjustments and adding context is essential. I mean it always is. But definitely when the dashboard receivers might end looking at values such as 'infinity' or 'no value'. 

So from my perspective, there are a few different ways of handling this value: guard the denominator, set a minimum base, and when the question is something like "what moved?", answer it with how much it moved. Your table gets less dramatic and a lot more useful.
