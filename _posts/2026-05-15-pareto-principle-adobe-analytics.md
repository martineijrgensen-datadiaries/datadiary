---
layout: post
title: "The Pareto Principle in Adobe Analytics: When Workspace Wasn't Enough"
subtitle: "Applying the Classic 80/20 Rule to Analytics data and Limitations of Workspace."
tags: [Adobe Analytics, CJA]
read_time: 7
emoji: "📊"
---


![pareto definition](/assets/images/ParetoUpdated.png)


I like the idea of the Pareto Principle and its simplicity. 

The thought that a relatively small number of things often drive the majority of outcomes.

- 20% of products driving 80% of revenue  
- 20% of customers driving 80% of value  
- A handful of pages driving most engagement

It is one of those concepts that sounds almost a lil *too simple* 👀, but somehow keeps appearing everywhere in analytics. So of course I wanted to try this out properly in Adobe Analytics.
 
I wanted to actually identify which products were driving most of the revenue and then use that knowledge operationally inside Adobe Analytics.

This ended up being a small reminder that analysis sometimes takes a brief detour outside Adobe Analytics before finding its way back.


![pareto bar](/ParetoBar.png)

---

## Step 1: The Basics

I wanted to make this as simple as possible. So I started with a table. As you do.

I created a Freeform Table in Adobe Analytics with:

- `Product ID`
- `Online Revenue`

Then I sorted the table descending by revenue. 

<img class="datadiaryimage" src="{{ "/assets/images/Paretotable.png" | relative_url }}" alt="paretotable">

Now I had the foundation.

Next I really wanted to create the classic Pareto chart:

- Bars = revenue per product  
- Line = cumulative % of total revenue  
- Identify where cumulative revenue hits 80%  

The cumulative percentage is the core part of the Pareto analysis because it shows how revenue accumulates across products when they are sorted from highest to lowest contribution. Without the cumulative view, you only see isolated product performance.

With cumulative percentage, you start seeing the distribution of value across the business. So that part is pretty important. 

And all of this which would be fairly simple to create. At least in my head and in theory. But now I started to meet some limitations within the analysis workspace. 

---

## Step 2: The First Confusing Part

I started creating a revenue metric with the cumulative function inside Workspace. At first glance it looked correct.

Then suddenly I noticed things that made absolutely no sense.

![pareto not working](/assets/images/paretonotworking.png)


A product with very low revenue suddenly appeared associated with a very high cumulative percentage.

Something like this:

| Product | Revenue | Cumulative % |
|---|---|---|
| prd1036 | High revenue | 7% |
| ... | ... | ... |
| prd1026 | Low Revenue | 100% |

My first thougth was:

> "Why does a tiny product contribute to 100% of revenue?"

Adn I realised using cumualtive function and sorting revenue by products in the table does not influence the cumulative behavior as I hoped. It's still tied to time-based dimensions. 

Not shaming cumulative functions. They work perfectly over time-based dimensions (like Day, Week, Month), because the data has a natural sequential order.
But for non-time dimensions, like Product, AA or CJA doesn’t handle those values in the way that I want it to. 

That was the moment I realized..

> I probably needed Excel.

---

## Step 3: Exporting the Data

So I exported the table from Adobe Analytics into Excel.

Just:

- `Product ID`
- `Revenue`

Yeah, that's all. 

(You could also use report builder. Do whatever. Just get the data) 

---

## Step 4: Formatting in Excel

I did some formatting to prepare the table.

![pareto not working](/assets/images/paretoexcelformatting.png)


Then I sorted products to be descending by revenue.

Now the next step was just adding the two calculated columns.

### Step 5: Percentage of Total Revenue

```excel
=Revenue / Total Revenue
```
![percentageoftotal](/assets/images/ofTotalRevenue.png)

This showed how much each individual product contributed to overall revenue.

### Step 6: Cumulative Percentage of Total Revenue

```excel
=SUM($C$2:C2)
```

![cumulativepercentage](/assets/images/CumulativeofTotalRevenue.png)

Now the cumulative logic became completely transparent. This one tells us how much of the total revenue has been accumulated up to and including this row in the table. 

The percentage starts low and gradually climbs toward 100%.

To me, that is how a Pareto curve should behave. 

### Step 7: Product Grouping Logic

Then came the important part. We can now apply the principle. 

I created a formula that classified products based on whether they belonged to the group contributing to the first 80% of total revenue. In practice, this meant identifying the point where the cumulative percentage of revenue reached ≥80% (less than or equal to). 

The products included up until that threshold represented the small subset of products driving the majority of revenue. Essentially the classic Pareto principle, where roughly 20% of products contribute to 80% of revenue.


```excel
=IF(D2<=0,8; "Top 20% Products"; "Long Tail")
```
![grouping](/assets/images/Findthe80percent.png)



This separated the dataset into two groups:
- Top Products  
- Long Tail Products  

We could stay here in excel. That is possible. But does anyone really want to do that? 

---

## Step 8: The Visualization

Getting back home is nice. I am not going to compete at The Microsoft Excel World Championship. So why spend more time in Excel. But you can [sign up here](https://excel-esports.com/) if that is what you truly want. 

Things can look nice in AA and CJA. So once the excel-formulas were in place, I could go into the analytics tools again and create a combo chart.

- Bars = revenue per product  
- Line = cumulative percentage  
- Horizontal reference line = 80%  

This would allow me to see the discribution. 
- where the "vital few" products ended  
- where the long tail began  

But… wait. How do we actually get those calculations back into AA? Didn’t I just storm out of Workspace the moment I realized it couldn’t give me what I needed? That maybe I just wanted someone who would finally listen to me and understand my cumulative percentage problems? 🙄 🎀

So maybe this wasn't an actionable real 'step 8'..

---

## Step 8 (for real): Bringing It Back into Adobe Analytics

Now we're here. Where the exercise becomes useful.

I'll try to stay simple. I knew which products belonged to the "Top 20%" group. So I could operationalize it inside Adobe Analytics. I knew the revenue threshold at which the products reached the 80% mark.

I created two calculated metrics. 

- `Top 20% Products`: If the product revenue is greater than or equal to the revenue at the 80% mark, then it can be categorized as Top 20 % Products

![grouping](/assets/images/topproducts.png)

- `Long Tail Products`: This is just the opposite logic. If the product revenue is less than the revenue at the 80% mark, then it can be categorized as Long Tail Products.

![grouping](/assets/images/longtail.png)

With these calculated metrics, I could finally create the bar graph vizualisation (combo).

![grouping](/assets/images/combopareto.png)

And now I had the foundation needed to explore the nuanced differences between the high-value products and the long tail.

- traffic sources  
- entry pages  
- device behavior  
- customer journeys  

![grouping](/assets/images/paretofun.png)

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

That's alright. I got the analysis to work. The only thing to keep in mind with this approach is that you get a snapshot of the real world. It does not automatically update. You could probably set that up. 


