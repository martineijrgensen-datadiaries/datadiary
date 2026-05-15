---
layout: post
title: "The Pareto Principle in Adobe Analytics: When Workspace Wasn't Enough"
subtitle: "A small reminder that sometimes the best analytics workflow is not all inside one tool."
tags: [Adobe Analytics]
read_time: 7
emoji: "📊"
---

I like the idea of the Pareto Principle.  
The thought that a relatively small number of things often drive the majority of outcomes.

- 20% of products driving 80% of revenue  
- 20% of customers driving 80% of value  
- A handful of pages driving most engagement  

It is one of those concepts that sounds almost *too simple*, but somehow keeps appearing everywhere in analytics.

So I wanted to test it properly in Adobe Analytics.

Not just theoretically.  
I wanted to actually identify which products were driving most of the revenue and then use that knowledge operationally inside Adobe Analytics.

And honestly… this ended up being a small reminder that sometimes the best analytics workflow is not "all inside one tool".

---

## The Initial Idea

The setup sounded straightforward.

I created a Freeform Table in Adobe Analytics with:

- `Product ID`
- `Online Revenue`

Then I sorted the table descending by revenue.

At that point I wanted to create the classic Pareto view:

- Bars = revenue contribution per product  
- Line = cumulative % of total revenue  
- Identify where cumulative revenue hits 80%  

Simple.

At least in theory.

---

## The First Confusing Part

I started experimenting with cumulative functions inside Workspace.

At first glance it looked correct.

Then suddenly I noticed things that made absolutely no sense.

A product with very low revenue suddenly appeared associated with a very high cumulative percentage.

Something like this:

| Product | Revenue | Cumulative % |
|---|---|---|
| prd1036 | High revenue | 7% |
| ... | ... | ... |
| prd1026 | $68 | 100% |

My first instinct was:

> "Why does a tiny product contribute to 100% of revenue?"

But that was not actually what the metric meant.

The cumulative percentage was not saying:

> "This product generated 100%."

It was saying:

> "By the time we reach this row, we have accumulated 100% of total revenue."

Which is technically correct.

But another issue appeared.

The cumulative logic inside Workspace is heavily dependent on row order and table structure. Once I started experimenting with breakdowns and different table setups, the logic became difficult to fully trust for this type of analysis.

That was the moment I realized:

> I probably needed Excel.

---

## Exporting the Data

So I exported the table from Adobe Analytics into Excel.

Just:

- `Product ID`
- `Revenue`

Nothing fancy.

Then the process became much easier and much more transparent.

---

## Building the Pareto Analysis in Excel

First step: sort products descending by revenue.

Then I added three calculated columns.

### 1. Percentage of Total Revenue

```excel
=Revenue / Total Revenue
```

This showed how much each individual product contributed to overall revenue.

### 2. Cumulative Percentage of Total Revenue

```excel
=SUM($C$2:C2)
```

Now the cumulative logic became completely transparent.

The line started low and gradually climbed toward 100%.

Exactly how a Pareto curve should behave.

### 3. Product Grouping Logic

Then came the important part.

I created a formula that classified products based on whether they belonged to the products contributing to the first 80% of revenue.

```excel
=IF(D2<=0,8; "Top 20% Products"; "Long Tail")
```

This separated the dataset into two groups:

- Top Products  
- Long Tail Products  

Simple. But very actionable.

---

## The Visualization

Once the formulas were in place, I created a combo chart.

- Bars = revenue per product  
- Line = cumulative percentage  
- Horizontal reference line = 80%  

This immediately made the distribution visible.

You could literally see:

- where the "vital few" products ended  
- where the long tail began  

And honestly, this was the part I liked the most.

Because the analysis suddenly stopped being abstract.

It became visual.

---

## Bringing It Back Into Adobe Analytics

This was where the exercise became genuinely useful.

Now that I knew which products belonged to the "Top 20%" group, I could operationalize it inside Adobe Analytics. I knew the revenue threshold at which the products reached the 80% mark.

I created:

- segments  
- calculated metrics  
- product groupings  

For example:

- `Top Revenue Products`
- `Long Tail Products`

Now I could start comparing:

- conversion rate  
- traffic sources  
- entry pages  
- device behavior  
- customer journeys  

between high-value products and the long tail.

And this is where the real analysis starts.

---

## The Interesting Part About the Long Tail

The long tail is often where things become more interesting than expected.

Maybe the top products dominate revenue because they already have strong visibility.

But:

- what products drive engagement?  
- what products introduce users to the brand?  
- what products overperform in organic search?  
- what products are frequently viewed but rarely promoted?  

Sometimes the "low revenue products" are strategically more important than their direct revenue suggests.

And Pareto analysis becomes less about:

> "What sells the most?"

and more about:

> "How is value distributed across the business?"

---

## My Main Takeaway

I initially thought this would be a pure Analytics exercise.

Instead, it became a good reminder that analysis work can sometimes live between tools.

That's alright. I got the analysis to work. The only thing to keep in mind with this approach is that you get a snapshot of the real world. It does not automatically update. You could probably set that up. I haven't been able to go even further with that yet.
