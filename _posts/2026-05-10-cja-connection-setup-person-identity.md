---
layout: post
title: "It starts with the Person: Why CJA Connection Setup Is Your Most Important Architecture Decision"
subtitle: "In Customer Journey Analytics, every configuration choice in a Connection echoes through every report, every segment, and every business decision that follows. I tried diving into why, starting from the one thing that truly matters: the person."
tags: [CJA, AEP]
read_time: 20
emoji: "👤"
---

## The Question Behind Every Analytics Project

When working with Customer Journey Analytics, it is tempting to think of the Connection as a technical step in the setup. Something that needs to be configured correctly, but ultimately sits in the background while the real work happens in analysis and reporting.

That assumption tends to hold, right up until the moment the data starts raising questions that are difficult to answer.

In one case, a simple conversion analysis began to show inconsistencies. Conversion rates dropped significantly when anonymous traffic was included. Attribution models seemed to favor late-stage interactions more than expected. Segments built to identify non-converters appeared unusually large.

At first glance, nothing was broken. The data was flowing, dashboards were populated, and the implementation appeared sound. But the explanation was not found in the reports themselves. It was found much earlier, in how the Connection had been configured.

At the center of the issue was a deceptively simple question: **who is the person in this dataset?**

## Start Here: What Is a "Person" in CJA?

Defining what it means to be a person, as a unique individual, a nuanced and complex being. Sounds deep. And it is. In CJA, the ✨Person ID✨ is the anchor of everything. It is the field that tells CJA: "These events, these page views, these transactions all belong to the same human being."

When you configure a Connection, you add datasets from the Adobe Experience Platform. For each dataset, you select one field as the Person ID. This might be an email address, a CRM ID or an Experience Cloud ID (ECID). That seems straightforward… until you realize the choice has direct effects on:

- How sessions are constructed and how session metrics are counted
- Whether cross-channel journeys can be assembled or remain siloed
- Whether your segment definitions apply to real people or to anonymous identifiers
- Whether your conversion rates reflect actual human behavior or are inflated by identity fragmentation
- Whether attribution models credit the right touchpoints in a journey
- and more…

A Connection combines your datasets into one view, where events are tied together using the Person ID.

Then we can apply stitching to our dataset to connect a persistent ID (often the cookie id) with the Person ID. This is relevant when we want to identify anonymous behavior.

## Specific ID or Identity Map?

This is one of those decisions that looks simple in the UI, but has surprisingly big consequences.

When you configure the Person ID in a CJA Connection, you're essentially choosing between two approaches: picking a single identifier and sticking to it, or allowing multiple identities to exist together.

On paper, choosing one ID (like a CRM ID) feels like the cleanest option. One person, one identifier. Should be simple. But in practice, it quickly raises a question: what happens when that ID isn't there?

Before login, after logout, on a new device… a lot of user activity happens without that one "perfect" identifier. And if you've told CJA to only recognize that one ID, then all of that behavior sits outside your definition of a person.

This is where identityMap starts to make more sense.

The first time it really clicked for me, it wasn't because of documentation. It was because I stopped thinking about "which ID is correct" and started thinking about "what do we actually know at this moment?". IdentityMap is essentially a structure (typically populated via the Web SDK) that allows you to send multiple identifiers with each event. You can think of it as a container holding everything you know about that user at that point in time: a device ID (ECID), maybe a CRM ID after login, and potentially other identifiers depending on your setup.

Instead of forcing everything into a single field, you're preserving the full identity context.

Now, it's important to be precise here. Selecting identityMap doesn't magically define how people are counted in CJA: that still depends on your Person ID choice. When you select identityMap in the Connection UI, you also have to pick a specific namespace from it (like ECID, email, or a custom ID). So you are still anchoring on one primary identifier, just drawn from within the map rather than a flat schema field. What identityMap does do is give CJA access to more identity signals on each event, because the map can carry multiple namespaces simultaneously. And that becomes especially valuable when stitching enters the picture.

Technically, stitching can work without identityMap. But in practice, identityMap makes it more robust. Because multiple identifiers can coexist on the same event, the relationship between them becomes clearer, and CJA has a stronger foundation for connecting behavior over time.

This matters in real-world setups, where identity is rarely clean. Sometimes the "main" Person ID isn't present. Sometimes another identifier appears first. Sometimes they overlap in messy ways. IdentityMap doesn't solve identity by itself, but it ensures that you don't lose information before you even begin resolving it.

So in the end, the choice is less about configuration and more about mindset. Selecting a single ID is like saying: "a person only exists when this identifier exists." Using identityMap is more like saying: "I'll keep all the signals, and decide how to connect them."

And in a world where identity is messy, that flexibility tends to matter more than simplicity.

---

The impact of this choice between selecting an ID or using identity map becomes even more significant when you look at this together with stitching, because now we're not just deciding which identities we use, but also whether they are connected into one person over time.

**No stitching:** If we have a connection without stitching, even if you use identityMap, CJA will not actively connect identities across events. Each event will simply use whatever ID is present at that moment. In practice, this means the same user can appear as multiple "people" within the same journey. For example, a person can appear anonymous before login (ECID) and as a known customer after login (CRM ID). This means that the continuity of the journey is broken. Funnels will look shorter, attribution will be skewed toward later touchpoints, and we lose visibility into what actually led up to a conversion.

**With stitching:** When you enable stitching, you allow CJA to connect identities across events and over time, but only where a relationship between those identities has been established (for example through co-occurrence). This is where identityMap unlocks its value, as it allows multiple identities (such as ECID, CRM ID, or call center IDs) to be captured together and linked more effectively.

## The Connection: Your Analytics Foundation

A CJA Connection is a configured link between CJA and one or more datasets in AEP. I think of it as the pipeline through which AEP data flows into the CJA analytical engine. But it is also more than a pipeline: it is a definition. Because a connection defines:

1. **Which datasets are included.** You choose which AEP datasets (event, profile, or lookup) to bring into this analytical context. This is important to understand from a business perspective. Not every dataset needs to be in every connection. That is something the business needs to define the use case for.
2. **The Person ID of each dataset.** This is where identity is anchored. The field you choose here determines how CJA stitches events into person-level journeys.
3. **The dataset type and its role.** Event datasets provide the behavioral stream. Profile datasets enrich people with attributes. Lookup datasets add classification and context to events.
4. **The timestamp field and data backfill window.** CJA ingests data within a defined window. The backfill configuration determines how much history is available for trend analysis, forecasting and cohort building.
5. **Whether Stitching (Identity Resolution) is enabled.** Field-based or graph-based stitching allows CJA to connect anonymous sessions to authenticated persons. This does not happen automatically. You need to enable stitching in the connection UI.

And then we can define more specifically the dimensions, metrics and other things in the data views. Attribution, persistence, transformations, formatting etc. But I will not go through data views in this article.

## The Identity Problem: Why One Person Looks Like Many

Without deliberate configuration, a single real customer might appear as multiple "persons" in your data. Which is not only super frustrating, but it also devalues the decision framework.

Consider this scenario:

**Monday:** A customer visits your website. They are not logged in. Their web analytics event carries an ECID: a randomly generated device identifier.

**Wednesday:** they return and log in. A CRM ID is now associated.

**Friday:** they call your support center. Now we have a phone number and a different internal customer ID.

**Saturday:** they buy in-store. A loyalty card ID is captured at POS.

These are four touchpoints reached by one human. But CJA might view these as four separate "persons" in your Connection. And this is not just a tiny inconvenience. It becomes a real issue when you have invested heavily in these tools like CJA and AEP (and others if you have more), expecting some return of investment.

If you selected CRM ID as person ID in this connection, with these datasets, then CJA will count one person based on the CRM ID. Without stitching enabled, we cannot link it to the other touchpoints. We would get a "No Value" for those events if we used a person ID dimension and an event metric in a freeform table. The row exists in the dataset with some other ID but the CRM ID (the selected person ID) was never populated for that record.

| Person ID | Events | Persons | Sessions | |
|---|---|---|---|---|
| Total | 4 | 1 | 1 | |
| CRM-4821 | 1 | 1 | 1 | Wednesday login |
| (No Value) | 3 | 0 | 0 | Mon · Fri · Sat events |

In this example, the "No Value" is actually a useful diagnostic signal in practice. Sometimes it is expected, when you combine certain dimensions with certain events. While other times, it can be used to validate if data is configured correctly. If you see a large proportion of your events sitting there, it tells you directly that your Person ID field is not being populated consistently across your datasets, which can be a sign of identity fragmentation.

### THE BUSINESS COST OF IDENTITY FRAGMENTATION

These are just a few examples. A bit generic, but still extremely relevant.

**CONVERSION RATES**
Journeys that cross authentication events appear broken. Conversion is understated because the anonymous session and the authenticated purchase are counted as separate persons.

**ATTRIBUTION**
The touchpoint that drove the decision (often an early anonymous visit) gets no credit. Your attribution model tells a story that's factually incorrect, leading to misallocated marketing budgets.

**SEGMENT ACCURACY**
A segment defined as "customers who viewed product X and did not convert in 7 days" will be inflated because most of those "non-converters" actually did convert, just under a different ID.

**LTV CALCULATION**
Lifetime value calculations that don't stitch across channels will severely undercount individual customer value, making the best customers look like average ones.

## Stitching: The Configuration That Changes Everything

CJA offers two stitching approaches, and choosing between them, or choosing not to stitch at all, is one of the highest-impact decisions in a Connection setup. I strongly believe that stitching is not a reporting feature but a data quality investment. Because as a business, we can much better connect the journey and make better business decisions. I even dare to say that planning for stitching from day one as part of the implementation of or migration to CJA would be key to really get the value of the tool. Because introducing it retroactively makes historical data unreliable and may ruffle the current data trust in the organization.

### Field-Based Stitching

Field-based stitching is available with CJA Select. This method uses a persistent ID (like an ECID or cookie ID, always present even for anonymous visitors) and a transient ID (like a CRM ID or customer login ID, only present when authenticated) within the same event dataset. CJA uses a lookback window to retroactively assign the transient ID to previously anonymous events. The result: pre-login sessions are linked to the authenticated customer, and the journey is reconstructed end-to-end.

### Graph-Based Stitching

Graph-based stitching is only available with CJA Prime. Here the stitching goes further. It leverages the AEP Identity Graph, which may know, for example, that ECID-A, email-B, and loyalty-ID-C all belong to the same person based on matches across datasets and applies that cross-dataset identity resolution at query time. This is the most powerful form of identity resolution in the platform, and it enables analytics that span channels even when no single dataset carries all identifiers.

### Enabling Stitching

When you enable field-based stitching on a dataset, you might picture it as a single process that links anonymous behavior to known customers. In reality, stitching operates in two distinct phases, and understanding the difference between them is essential for interpreting your data correctly.

**Phase 1: Live stitching**
Runs in real time as events arrive. Stitches anonymous events on already known devices immediately. New, never-seen devices remain unstitched until replay.

**Phase 2: Replay stitching**
Runs periodically (daily or weekly). Goes back in time and retroactively stitches events from devices that have since authenticated within the lookback window.

I think of live stitching as an immediate, best-effort picture. While replay stitching gives us the corrected, more complete picture. So the data improves over time as replays run, which is exactly why recent data should be treated as provisional.

### The Replay Window

CJA reprocesses events for all ECIDs that have since been linked to a Customer ID, and retroactively updates the stitched identity. The replay window defines how far back that reprocessing reaches.

| | DAILY REPLAY (24H WINDOW) | WEEKLY REPLAY (7D WINDOW) |
|---|---|---|
| Speed | Fast (data updates daily) | Slower (data updates weekly) |
| Stitching coverage | Less (must authenticate same day) | More (captures multi-day journeys) |
| Data stability | Stable (numbers don't change much) | Changing (numbers shift after each replay) |
| Journey length | Short journeys only | Longer journeys reconstructed |
| Attribution impact | Early touchpoints often missed | Attribution is more complete and fair |
| Typical risk | Checkout looks like first step | Reports are not final until replay completes |

This means that the replay window has direct consequences for how we read our data.

A 24-hour window means that if a customer researches our product on Monday and logs in on Wednesday, the Monday session will never be stitched. It stays in "(No Value)."

A 7-day window captures that full arc and connects the research to the conversion.

With a 7-day window, numbers we see today may be different in 7 days once the replay has run. This is not a data quality problem, it is stitching working correctly. But it requires people to understand that recent data is provisional, and that week-old data is more reliable than yesterday's.

## Three Connections, Three Definitions of a Person

Maybe this is mostly for my own sake, but in this section I want to dive into the impact of the connection setup based on three different scenarios. Because the definition of a "person" means something inside every report, every funnel, and every business decision that follows.

To make this concrete, let's use the same underlying data, three different configurations and observe exactly what CJA sees in each one.

The dataset foundation is the same throughout: web behavioral data collected via Adobe's Web SDK (carrying an ECID for every visitor) and call center interaction data (carrying a customer ID when a caller is identified). Both datasets live in AEP, ready to be connected.

## Scenario A: Connection with No Stitching

The first connection is a common starting point. Two datasets, a sensible-looking Person ID choice, no stitching. It feels reasonable. The gaps only become visible when you look at what the data actually shows.

**Connection settings:**
- Dataset 1: Web data
- Dataset 2: Call center data
- Person ID: Customer ID (CRM ID, populated on login and authenticated calls)
- Stitching: Not enabled

The Customer ID is a logical choice. It is a stable, unique identifier that appears in both datasets when a customer is known. The problem is not the ID itself, but what happens to all the events where the customer is not yet known.

**What CJA shows in a freeform table:**

| Customer ID | Events | People | Sessions |
|---|---|---|---|
| Total | 10,000 | 1,840 | 1,840 |
| CRM-0042 | 6 | 1 | 2 |
| CRM-1187 | 3 | 1 | 1 |
| CRM-2291 | 4 | 1 | 1 |
| … | … | … | … |
| (No Value) | 7,200 | 1,100 | 1,700 |

One person equals one Customer ID. That part works correctly. But notice the "(No Value)" row: 7,200 events. That is a huge part of all traffic, sitting in a bucket with no known customer ID. But a lot of activities.

This doesn't mean that we cannot use this connection at all. It means that we need to be aware of some limitations:

**What you can and cannot see:**

❌ First visits and pre-login browsing behavior  
❌ Full picture of campaign traffic: most ad clicks land on anonymous sessions  
❌ Product discovery before login: the research phase is invisible  
❌ The actual entry into the funnel: you only see from login onwards  
❌ Anonymous browsing journeys of any kind  

✅ Cross-channel analysis: you can follow a known customer from a web interaction to a call center interaction, because both carry the Customer ID when authenticated  
✅ Cross-device analysis: if the same person logs in on a second device, that session is correctly linked to the same Customer ID  

The cross-channel capability is real and valuable. If a customer logs in on the website, orders something and later calls support, CJA can join those interactions into a single journey. That is the connection doing exactly what it is designed to do.

Any behavior that happens without authentication (before login, after logout, on a new device before the first login) is unknown. And in most digital experiences, that unknown phase is most of the journey:

| Event | Timestamp | Person Identifier | Cookie ID |
|---|---|---|---|
| 1 | 12:01 | ❌ | 246 |
| 2 | 12:02 | ❌ | 246 |
| 3 | 12:03 | ❌ | 246 |
| 4 | 12:04 | ❌ | 246 |
| 5 | 12:05 | ❌ | 246 |
| 6 | 12:06 | ❌ | 246 |
| 7 | 12:03 | ❌ | 246 |
| 8 | 12:09 | Bob | 246 |
| 9 | 12:02 | Bob | 246 |
| 10 | 12:05 | Bob | 246 |
| 11 | 12:12 | Bob | 246 |

In this example, even when we have the person ID AND the cookie ID, CJA will not connect the cookie ID to the person. That would require enabling stitching.

Consider a real journey might look like this:

- A customer visits the website to view a specific product page (unknown traffic)
- Then they visit the Contact page (unknown traffic)
- Then they login and order (known traffic)
- However, they need to change something in the order and visit the FAQ (unknown traffic)
- The customer ends up contacting customer service for support (known traffic)

In this scenario, we would be missing the nuances of the journey. Consider the costs of customer service calls. Did we need to provide more information in the FAQ section?

## Scenario B: Connection with Field-Based Stitching

The second connection uses the same two datasets and the same Customer ID as the anchor, but now we enable field-based stitching on the web dataset. This is where CJA starts doing detective work.

**Connection settings:**
- Dataset 1: Web data, field-based stitching enabled
  - Persistent ID: ECID (always present, even for anonymous visitors)
  - Transient ID: Customer ID (present only when logged in)
- Dataset 2: Call center data, with Customer ID as Person ID
- Stitching: Field-based, enabled on web dataset

The mechanism: every web event already carries an ECID, a persistent device-level identifier that is always present, even for anonymous visitors. When a login happens and a Customer ID appears, CJA looks back in time across all events sharing that ECID and retroactively assigns the Customer ID to them. Anonymous behavior before the login is now linked to the known person.

**What CJA shows after stitching:**

| Customer ID | Events | People | Sessions |
|---|---|---|---|
| Total | 10,000 | 1,840 | 1,840 |
| CRM-0042 | 14 | 1 | 6 |
| CRM-1187 | 7 | 1 | 5 |
| CRM-2291 | 5 | 1 | 5 |
| … | … | … | … |
| (No Value) | 2,100 | 300 | 500 |

The metrics in the "no value" bucket have decreased significantly. We see fewer events, sessions and people without a customer ID. So the "no value" bucket shrinks, but it does not disappear. The remaining "no value" rows are genuine unknowns: visitors who never authenticated within the replay window, or real anonymous traffic who are not customers at all.

So now anonymous behavior is stitched to the person because they have at some point logged in. Then if they browse again later on without logging in, we can still identify them.

| Event | Timestamp | Persistent ID | After Live Stitch | After Replay |
|---|---|---|---|---|
| 1 | 12:01 | 246 | 246 | Bob (retroactively stitched) |
| 2 | 12:02 | 246 | Bob | Bob |
| 3 | 12:03 | 246 | Bob | Bob |
| 4 | 12:04 | 246 | Bob | Bob |
| 5 | 12:05 | 246 | Bob | Bob |
| 6 | 12:06 | 246 | Bob | Bob |
| 7 | 12:03 | 3579 | 3579 | 3579 (never authenticated) |
| 8 | 12:09 | 3579 | 3579 | 3579 (never authenticated) |
| 9 | 12:02 | 81911 | 81911 | Bob (retroactively stitched) |
| 10 | 12:05 | 81911 | Bob | Bob |
| 11 | 12:12 | 81911 | Bob | Bob |

## Scenario C: Connection with No Stitching and ECID as Person ID

The third connection is maybe the most common setup for teams focused purely on web analytics. One dataset, no call center data, and ECID as the Person ID. It is clean, simple, and entirely valid for a specific analytical purpose.

**Connection settings:**
- Dataset: Web data only
- Person ID: ECID
- Stitching: Not enabled

With ECID as the Person ID, every event belongs to a "person." Person counts look complete. Session counts look complete. Funnels close properly.

But this is where a critical distinction must be made: in this connection, a "person" is a device and browser combination, not a human being.

**What this means in practice:**
- Same person on mobile and desktop = two different "people", two different ECIDs
- Same person after clearing cookies = a brand new "person"
- Cross-channel analysis is impossible, no call center, no store, no CRM linkage
- Customer-centric metrics (LTV, repeat purchase rate, churn) are meaningless
- On-site behavior analysis is clean and complete
- Device-level funnels and drop-off analysis are reliable

**Where this connection excels... and doesn't:**

If you're only interested in understanding what happens on the website: which pages perform, where funnels break, how content drives engagement, then this is a strong and reliable setup. The data is dense, complete, and clean at the device level. It breaks down the moment you ask any question about the person behind the device. But then, having CJA is a bit much innit?

Also note that person counts in this setup will be inflated compared to your actual customer base. This can have a bigger or smaller impact depending on how often your audience switches devices or clears cookies. If an executive looks at "3.2 million people visited this month" and interprets that as 3.2 million unique human beings, the analytical foundation has already misled the business.

## The Backfill Window: History Has Value

I don't want to skip the importance of the backfill window. When you configure a dataset in a Connection, you set a backfill window. That basically means how far back in history CJA will ingest data. There are some considerations to make when selecting the backfill window.

A 3-month backfill gives you enough history for recent trend analysis, but not for annual cohort comparisons. A 13-month backfill enables year-over-year comparison from day one of your CJA rollout. A 3-year backfill supports long-term customer behavior analysis.

The cost of a short backfill is invisible at first. You launch your CJA rollout, dashboards look fine, and executives start consuming reports. Six months later, someone asks: "How does this compare to last year?". The data simply is not there. It's not the end of the world, but that be quite inconvenient when you want to show how great CJA is at answering people's questions.

## Summary: The Setup Choices and What They Control

**PERSON ID SELECTION**
Controls whether analytics are at the person level or the device/session level. Determines cross-channel journey completeness.

**STITCHING CONFIGURATION**
Determines whether pre-login behavior is connected to authenticated identity. Directly impacts conversion, attribution, and segment accuracy.

**DATASET TYPE MIX**
Determines the richness of analysis, whether you can segment journeys by profile attributes and enrich events with lookup context.

**BACKFILL WINDOW**
Determines historical depth available for trend analysis, cohort comparison, and LTV modeling from the moment of launch.

**CONNECTION SCOPE**
Determines which analytical questions can be answered in a single workspace and how data governance requirements are enforced.

**IDENTITY GRAPH ALIGNMENT**
Determines whether CJA analysis can be connected back to RTCDP activations, enabling closed-loop measurement of paid media and personalization.

## The Closing Argument

In Customer Journey Analytics, architecture is not a technical responsibility that can be delegated to implementation teams alone. The choices inside a Connection (who is the person, which data is included, how identity is resolved, how far back history goes) are business decisions dressed in technical clothing.

Every dashboard that follows, every insight that executives act on, every segment that marketing activates: all of it rests on the foundation of the Connection. If that foundation is built on fragmented identity, incomplete history, or misaligned dataset types, the entire analytics program is measuring a distorted version of reality.

Start with the person. Resolve the identity. Build the Connection right the first time.

---

*Tagged: #CJA #customerjourneyanalytics #adobe #datamodelling*
