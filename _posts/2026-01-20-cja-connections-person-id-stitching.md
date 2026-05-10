---
layout: post
title: "How CJA Connections Actually Work"
subtitle: "Person IDs, merged datasets, and when you actually need stitching. A mental model I wish I had earlier."
tags: [CJA]
read_time: 6
emoji: "🔗"
---

How does Customer Journey Analytics connection setup work? And can you already report on unique people across datasets before stitching ever comes into play?

When you create a Connection with different datasets, CJA does not keep those datasets separate.

Instead:

- All included event datasets are merged into one logical event dataset
- Reporting is done based on this merged dataset (together with profile and lookup data)
- Dataset origin no longer matters for analysis

![Two datasets (Dataset A and Dataset B) being merged into one combined event dataset in CJA](/assets/images/connection.jpeg)

## Person ID merging across datasets

If multiple datasets use a Person ID (even if the field names differ), CJA merges them into one Person ID column. This column is used to identify unique people. Then it builds sessions and attribution on top of it.

This means you can already report on unique people across datasets and answer some business questions from this. No stitching required yet, as long as the Person ID is present and consistent — which is not always the case.

## The gap: when Person ID is missing

Now we can see unique people and how they interact across datasets. But whenever we don't have a Person ID, we don't know who they are. A user might visit the website without being logged in for some time. Those sessions are not identified with a unique Person ID.

## When stitching becomes relevant

Stitching becomes relevant when identity is incomplete, for example:

- Anonymous visits (cookie / ECID only)
- Login happens later in the session
- Different datasets don't share the same Person ID on all events

In those cases:

- CJA cannot connect anonymous and known behavior by default, so cross-channel analytics becomes difficult
- People counts and journeys become fragmented

Stitching exists to connect the dots when we see behavior before an identity is known — not to enable basic reporting. Depending on your CJA license, you can use either Field Based Stitching or Graph Based Stitching.

## What happens when stitching is enabled

- You get a stitched version of your event dataset added to your connection
- A new stitched ID column is generated in that dataset
- Anonymous events can be re-keyed to a known person after login

So stitching is not automatic. It has to be enabled, and you need a clear, consistent schema and identity setup.

---