---
layout: post
title: "Easy way to get CJA Data Straight Into Power BI"
subtitle: "Adobe's BI extension lets you query a CJA dataview directly from Power BI. No exports, no data lake detour. Here is the setup, and the handful of rules that make it click."
tags: [CJA, Power BI]
read_time: 8
emoji: "🔌"
---

I wanted CJA data inside a Power BI report without going through hours of setting up some sort of connection, redefining metrics in DAX and just redoing a lot of stuff. That was not too much to ask for. 

Adobe already built the bridge for this: the **BI extension**, a Postgres-compatible interface that sits in front of your CJA dataviews. Point Power BI's native PostgreSQL connector at it, and you are querying calculated metrics, segments, and dimensions directly from one of your dataviews.

The setup itself is genuinely quick once you know the shape it expects. This post walks through it.

---

## Prerequisite: credentials

You will need Postgres-style credentials for AEP/CJA (a host and a database string, something like `yourorg-prod:cja`). Get these from whoever administers your AEP org.

---

## Step 1: Connect

In Power BI: **Get Data → PostgreSQL database**,


<img class="datadiaryimage--rounded" src="{{ "/assets/images/GetData.png" | relative_url }}" alt="Get Data">

then:

<img class="datadiaryimage--rounded" src="{{ "/assets/images/PostGreSQL.png" | relative_url }}" alt="PostGreSQL">


- **Server**: your AEP query host, e.g. `XXX.platform-query.adobe.io`
- **Database**: `<your-database>?FLATTEN`

Do not forget to add `?FLATTEN`. CJA's data schemas are nested XDM - that is basically how the data is structured, and this flag flattens it into plain columns that any BI tool can actually work with. Without it, you are staring at fields that Power BI cannot make sense of. I learned that the hard way (not having read the entire documentation). ¯\_(ツ)_/¯ 

I think of it like this: nested XDM data is folders inside folders inside folders. `?FLATTEN` pulls every file out into one drawer, so you can just grab all your metrics by name instead of digging through nested folders to find it - totally inception-style (I hope you've watched the movie). 

So that one flag is what makes every simple `SUM(column_name)` later in this post actually work.

You can also find the instructions here: [Customer Journey Analytics BI Extension](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-dataviews/bi-extension)


---

## Step 2: Know the three rules

Quick note before we get into it: a "query" here just means a request for data, sent to Adobe behind the scenes. It does not have to be something you type yourself. I had to recap a lot of PBI-stuff when looking into this. But to simplify it: if you drag a field onto a chart in Power BI (creating a visualisation), Power BI writes a query for you and sends it off. So these rules apply either way, whether Power BI is writing the request for you, or you end up writing it by hand later... like me...in this post.

<img class="datadiaryimage--rounded" src="{{ "/assets/images/query-behind-the-scenes.svg" | relative_url }}" alt="Query">


Moreover, CJA's BI extension is built specifically for reporting-style aggregate queries. That means we have to consider these three things:

1. **Every query must be aggregated.** So this is pretty important. `SELECT * FROM view` will not give you raw rows, you get a message back saying an aggregate query is required instead. Wrap your metric in `SUM()`, `COUNT()`, etc.
2. **Every query needs a bounded date range**, using the special `timestamp` or `daterange` / `daterangeday` columns. Skip it, and you silently get the last 30 days by default which is easy to misread as "no data" if you were not expecting that.
3. **Results are capped at 50 rows by default**, up to 50,000 with an explicit `LIMIT n`.

These are really good to know. 

---

## Step 3: Find your real column names

I wanted to be sure that I was using the correct column namings so I went straight to the source. This pattern is explicitly supported for schema discovery and returns zero rows but the full column list:

```sql
PostgreSQL.Database("your-host.platform-query.adobe.io", "your-database?FLATTEN", [Query="SELECT * FROM public.your_dataview WHERE 1=0"])
```
Look at the header row, and you will find your dimensions and metrics, including custom/calculated metrics, usually labelled with something like `cm_`. So the namings have been changed slightly, having the cm_ added to them. Knowing that, I could create my query more easily. 

<img class="datadiaryimage--rounded" src="{{ "/assets/images/ColumnNames.png" | relative_url }}" alt="Find the Column Name">



---

## Step 4: Write the query

I like to cut to the chase and prefer adding SQL directly in Power Query's Advanced Editor.

Click on Transform Data:

<img class="datadiaryimage--rounded" src="{{ "/assets/images/TransformData.png" | relative_url }}" alt="Transform Data">


Edit the source step to something like:

```
PostgreSQL.Database("your-host", "your-database?FLATTEN", [Query="
  SELECT daterangeday,
         SUM(metric_1) AS metric_1,
         SUM(metric_2) AS metric_2
  FROM public.your_dataview
  WHERE `timestamp` BETWEEN '2026-06-22' AND '2026-07-22'
  GROUP BY daterangeday
  ORDER BY daterangeday
"])
```

- Quote the special `timestamp` column with **these:``**, not double quotes. 
- The first time you run a hand-written query, Power BI will probably show a native-query security prompt. That is expected behavior for any raw SQL source, not an error , click through it.

The datamodel might look something like this: 
<img class="datadiaryimage--rounded" src="{{ "/assets/images/Datamodel.png" | relative_url }}" alt="Data Model">

**Why use raw SQL?** Well I encountered some issues when trying to explore the full dataset in the reporting window in PBI. But I think in theory, if you set the metric aggregation to `Sum`, avoid Power BI's auto-generated date hierarchy, and bind a real date filter from the dataset, you should see the data without having to use SQL. But I kept getting a blank table or a stray `0`, and was pretty much left trying to debug what I did wrong (I haven't used PBI in years). 

By adding the query directly, I got to explore the specific errors straight from the backend instead ("aggregate query required," "unresolved column, did you mean X"), which is a much faster way to find out what actually broke... that is at least what I tell myself after having spent an embarrassing amount of time on this. 

In the query I could use the correct date field, not the PBI hierarchy, when filtering.

---

## Step 5: Build the visual

Because the query already returns real per-day values, `daterangeday` behaves like a genuine date field once loaded. Drop it on an axis, and Power BI's built-in Year → Quarter → Month → Day hierarchy works exactly as expected - drill from a yearly total down to a single day, in the same visual, no extra setup.

<img class="datadiaryimage--rounded" src="{{ "/assets/images/PBIReport.png" | relative_url }}" alt="PBI Report">



---

## The condensed version

- Non-expiring credentials, sorted access. Handled once, outside Power BI.
- `?FLATTEN` on the database string, always.
- Every query: aggregated, and date-bounded.
- `SELECT * FROM view WHERE 1=0` to get real column names instead of guessing from a report label.
- Write the SQL in Power Query rather than hoping the visual layer generates the right shape.
- Once the query is right, Power BI's native date hierarchy and visuals just work. No further wrestling needed.

That is really the whole thing. Once you have the right credentials and know the rules and, setting up a CJA dataview into a Power BI report can be a five-minute job. 
