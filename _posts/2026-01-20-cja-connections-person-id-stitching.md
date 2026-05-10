---
layout: post
title: "How CJA Connections Actually Work"
subtitle: "Person IDs, merged datasets, and when you actually need stitching — a mental model for getting the setup right."
tags: [CJA]
read_time: 6
emoji: "🔗"
---

One of the most common points of confusion when setting up Customer Journey Analytics is what a Connection actually does to your datasets — and whether you can report on unique people across multiple sources before you've enabled stitching.

The short answer: yes, you can. But it depends on how your Person IDs are set up.

## What a Connection does to your datasets

When you add multiple event datasets to a CJA Connection, they don't stay separate. CJA merges all included event datasets into a single logical event dataset for reporting purposes, combined with any profile and lookup data you've included. Once you're inside a Data View, the origin dataset is essentially invisible — everything is queried as one unified event stream.

This matters because it means dataset-level segmentation doesn't happen at the Connection layer. If you want to compare behaviour across data sources, you do that with dimensions, filters, or calculated metrics inside your Data View — not by querying datasets independently.

## Person ID consolidation

Here's the part that surprises most people: CJA doesn't require all datasets to use the same field *name* for Person ID. What it requires is that each dataset has a Person ID field mapped in the Connection setup. Once mapped, CJA merges them into a single unified Person ID column used across the entire connection.

This means that if Dataset A uses `email_hash` and Dataset B uses `crm_id`, but both contain the same underlying identifier values for your users, CJA can report on unique people across both datasets without any additional stitching. The Person ID values just need to be consistent — same format, same population — even if the field names differ.

Sessions, attribution, and flow analysis all build on top of this unified identifier.

## When stitching actually becomes necessary

Stitching isn't about multi-dataset joins — it's specifically about anonymous-to-known resolution. You need it when:

- **Anonymous visits precede login.** A user arrives as an ECID, browses, then logs in. Without stitching, their pre-login events are a separate person from their post-login events.
- **Datasets lack a shared Person ID across all events.** If some events only have a cookie ID and others only have an authenticated ID, the merged Person ID column can't connect them — there's no common value to join on.
- **You need cross-channel analytics that spans anonymous and known behaviour.** Pre-login web behaviour stitched to CRM data, for example.

When stitching is enabled, CJA generates a stitched version of your event dataset with a new stitched ID column. Anonymous events get re-keyed to the known Person ID after login is observed, working both forward and backward in time depending on your stitching configuration.

One important note: stitching isn't on by default. It requires deliberate enablement and a consistent schema setup. From 2026, it can be enabled directly through the Connection UI rather than requiring a support request — a small but meaningful operational improvement.

## A useful mental model

Think of a CJA Connection as a join operation that runs once at ingestion time and produces a single flat event table. The Person ID column in that table is the key. If you can populate it consistently across your datasets, you have unified person-level reporting. If you can't — because some events are anonymous — stitching is the mechanism that fills in the gaps.

Get the Person ID right at the Connection layer and most downstream analysis just works. Lean on stitching only when the anonymous-to-known problem is genuinely present in your data.

---

*Tagged: #CJA #customerjourneyanalytics #adobe #datamodelling*
