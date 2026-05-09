---
layout: post
title: "Field Notes: Dashboard Debt"
subtitle: "Every dashboard you build is a promise. Most of them expire before anyone notices."
tags: [Field Notes]
read_time: 4
---

We talk about technical debt in code. We don't talk about it enough in dashboards.

I've spent the past few weeks auditing a CJA workspace that grew organically over two years — inherited from two analysts who've since moved on, added to by three different stakeholders with different definitions of "conversion," and now used daily by a team who mostly trusts it implicitly.

What I found wasn't broken. It was just quietly wrong in a dozen small ways.

## The symptoms

Panels with no owner. Metrics with names like `Conversion (v2 - FINAL)` and `Conversion (v2 - FINAL - USE THIS ONE)`. A date range filter applied to one panel but not the others, invisible unless you know to check. A calculated metric referencing a segment that was deprecated eight months ago — still returning data, just not the data anyone thinks it is.

None of this would fail a QA check. It all renders fine. The numbers look plausible. That's what makes it dangerous.

## How it accumulates

Dashboard debt builds the same way code debt does: through small shortcuts taken under time pressure, each reasonable in isolation.

You duplicate a panel instead of refactoring it because the client meeting is in 20 minutes. You name the metric something temporary because you'll "clean it up later." You add a filter for a one-time campaign analysis and forget to remove it. Multiply by six analysts over two years and you get a workspace nobody fully understands.

The difference from code debt is that dashboards have no tests. There's no CI pipeline that fails when a segment gets deprecated. No lint rule that flags an ambiguous metric name. No type system. The wrongness is silent.

## What I'm doing about it

A few things that are actually helping:

**Naming conventions enforced at the component level.** Calculated metrics and segments now follow a `[Scope] Name (version)` pattern — e.g. `[Global] Sessions — Authenticated (v3)`. The scope prefix makes it immediately clear what data is included. Old versions get archived, not deleted, for 90 days.

**Panel descriptions as contracts.** Every panel now has a description that states: what question it answers, what the date range is, and what the primary segment is. Sounds bureaucratic. In practice it takes 90 seconds and has already caught two cases where a panel was answering a slightly different question than its title implied.

**Quarterly workspace reviews.** Thirty minutes, calendar'd, with whoever owns the workspace. We look at: what's still being used (CJA has usage data), what's changed in the underlying data that might affect calculations, what new segments or metrics have been added and whether they duplicate existing ones.

None of this is revolutionary. It's the analytics equivalent of code comments and PR reviews. The fact that it feels like extra work is the problem — it should feel like the default.

## The underlying issue

Dashboards feel finished in a way that code doesn't. When you ship a feature, everyone knows it'll need maintenance. When you hand over a workspace, the implicit message is: here, it's done.

It isn't done. It's just quiet.
