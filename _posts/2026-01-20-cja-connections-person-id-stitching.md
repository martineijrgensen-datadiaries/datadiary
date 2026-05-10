---
layout: post
title: "How CJA Connections Actually Work"
subtitle: "Person IDs, merged datasets, and when you actually need stitching. A mental model I wish I had earlier."
tags: [CJA]
read_time: 6
emoji: "🔗"
---

I spent more time than I'd like to admit confused about what a CJA Connection actually does to your datasets. Specifically: can you report on unique people across multiple data sources before you've enabled stitching?

Turns out yes. But it depends entirely on how your Person IDs are set up, and nobody warned me about that upfront.

## What a Connection does to your datasets

When I add multiple event datasets to a CJA Connection, they don't stay separate. CJA merges all included event datasets into one logical event dataset for reporting purposes, combined with any profile and lookup data I've added. Once I'm inside a Data View, the dataset origin is essentially invisible. Everything gets queried as one unified event stream.

That matters because it means I can't do dataset-level segmentation at the Connection layer. If I want to compare behaviour across data sources, I do that with dimensions, filters, or calculated metrics inside my Data View. Not by querying datasets independently. I tried that mentally for a while and it doesn't exist.

## The Person ID thing that surprised me

Here's the bit that genuinely surprised me: CJA doesn't require all datasets to use the same field *name* for Person ID. It just requires that each dataset has a Person ID field mapped in the Connection setup. Once mapped, CJA merges them into a single unified Person ID column used across the entire connection.

So if Dataset A uses `email_hash` and Dataset B uses `crm_id`, but both contain the same underlying identifier values for my users, CJA can report on unique people across both datasets without any additional stitching. The Person ID values just need to be consistent (same format, same population) even if the field names are different.

Sessions, attribution, and flow analysis all build on top of this unified identifier. Which is quite elegant, really.

## When stitching actually becomes necessary

Stitching is not about multi-dataset joins. I had that wrong for a while. It's specifically about anonymous-to-known resolution. I need it when:

- **Anonymous visits precede login.** A user arrives as an ECID, browses, then logs in. Without stitching, their pre-login events are counted as a completely separate person. Spooky.
- **Datasets lack a shared Person ID across all events.** If some events only have a cookie ID and others only have an authenticated ID, there's no common value to join on and the unified column can't help me.
- **I need cross-channel analytics that spans anonymous and known behaviour.** Pre-login web behaviour stitched to CRM data, for example.

When stitching is enabled, CJA generates a stitched version of my event dataset with a new stitched ID column. Anonymous events get re-keyed to the known Person ID after login is observed, working both forward and backward in time depending on my stitching configuration. Time travel, basically.

One thing worth knowing: stitching isn't on by default. It needs deliberate enablement and a consistent schema setup. From 2026, it can be enabled directly through the Connection UI instead of requiring a support request. Small thing, but I'm genuinely happy about it.

## The mental model that finally made it click for me

I now think of a CJA Connection as a join operation that runs once at ingestion time and produces a single flat event table. The Person ID column in that table is the key. If I can populate it consistently across my datasets, I get unified person-level reporting. If I can't (because some events are anonymous) stitching is the mechanism that fills in the gaps.

Get the Person ID right at the Connection layer and most of the downstream analysis just works. Stitching is for when the anonymous-to-known problem is genuinely present in the data. Not before.

---

*Tagged: #CJA #customerjourneyanalytics #adobe #datamodelling*
