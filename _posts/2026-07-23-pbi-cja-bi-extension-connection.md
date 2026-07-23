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

Do not forget to add `?FLATTEN`. CJA's schema is nested XDM under the hood, and this flag flattens it into plain columns that any BI tool can actually work with. Without it, you are staring at struct fields Power BI cannot make sense of. I learned that the hard way (not having read the entire documentation). ¯\_(ツ)_/¯ 

This part of the process is the least fun one. But it is also very very important. If you follow the instructions here, then you're set: [Customer Journey Analytics BI Extension](https://experienceleague.adobe.com/en/docs/analytics-platform/using/cja-dataviews/bi-extension)


---

## Step 2: Know the three rules

This is the part that really matters, and it takes a few minutes to learn. The BI extension is not a general SQL endpoint sitting on top of your raw data. It is built specifically for reporting-style aggregate queries. That means we will encounter three constraints:

1. **Every query must be aggregated.** `SELECT * FROM view` will not give you raw rows, you get a message back saying an aggregate query is required instead. Wrap your metric in `SUM()`, `COUNT()`, etc.
2. **Every query needs a bounded date range**, using the special `timestamp` or `daterange` / `daterangeday` columns. Skip it, and you silently get the last 30 days by default which is easy to misread as "no data" if you were not expecting that.
3. **Results are capped at 50 rows by default**, up to 50,000 with an explicit `LIMIT n`.

Keep these three in your head and you skip almost all of the friction.

---

## Step 3: Find your real column names

I wanted to be sure that I was using the correct column namings so I went straight to the source. This pattern is explicitly supported for schema discovery and returns zero rows but the full column list:

```sql
PostgreSQL.Database("your-host.platform-query.adobe.io", "your-database?FLATTEN", [Query="SELECT * FROM public.your_dataview WHERE 1=0"])
```

Look at the header row, and you will find your dimensions and metrics, including custom/calculated metrics, usually prefixed something like `cm_`. This beats guessing based on what a report table happened to label something.

<img class="datadiaryimage--rounded" src="{{ "/assets/images/ColumnNames.png" | relative_url }}" alt="Find the Column Name">



---

## Step 4: Write the query

The most reliable path is probably to write SQL directly in Power Query's Advanced Editor rather than relying on drag-and-drop visuals to generate a query on your behalf.

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

- Quote the special `timestamp` column with **backticks**, not double quotes. The BI extension runs on Adobe Query Service, which follows Spark SQL identifier rules, not standard Postgres ones.
- The first time you run a hand-written query, Power BI will show a native-query security prompt. That is expected behavior for any raw SQL source, not an error , click through it.

The datamodel might look something like this: 
<img class="datadiaryimage--rounded" src="{{ "/assets/images/Datamodel.png" | relative_url }}" alt="Data Model">


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
- Write the SQL yourself in Power Query rather than hoping the visual layer generates the right shape.
- Once the query is right, Power BI's native date hierarchy and visuals just work — no further wrestling needed.

That is really the whole thing. The rules are narrow, but once you know them, wiring a CJA dataview into a Power BI report is a five-minute job, not a debugging session.
