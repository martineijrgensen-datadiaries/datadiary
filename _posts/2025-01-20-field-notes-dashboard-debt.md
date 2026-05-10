---
layout: post
title: "Field Notes: Dashboard Debt"
subtitle: "Every dashboard you build is a promise. Most of them expire before anyone notices."
tags: [Field Notes]
read_time: 4
emoji: "🗂️"
---

We talk about technical debt in code. We almost never talk about it in dashboards. I think about this more than is probably healthy.

I've spent the past few weeks auditing a CJA workspace that grew organically over two years. Inherited from two analysts who've since moved on, expanded by three different stakeholders with three different definitions of "conversion," used daily by a team who mostly trusts it without question.

What I found wasn't broken. It was just quietly wrong in about a dozen small ways.

## The symptoms

Panels with no owner. Metrics named `Conversion (v2 - FINAL)` and, right below it, `Conversion (v2 - FINAL - USE THIS ONE)`. A date range filter applied to one panel but not the others, invisible unless you already know to look for it. A calculated metric referencing a segment deprecated eight months ago, still returning data, just not the data anyone thinks it is.

None of this fails a QA check. It all renders fine. The numbers look plausible. That's exactly what makes it dangerous.

## How it accumulates

Dashboard debt builds the same way code debt does: small shortcuts taken under time pressure, each one reasonable in isolation.

You duplicate a panel instead of refactoring it because the client meeting is in 20 minutes. You name the metric something temporary because you'll clean it up later. (You won't.) You add a filter for a one-time campaign analysis and forget to remove it. Multiply by six analysts over two years and you get a workspace nobody fully understands, including the people who built it.

The difference from code debt is that dashboards have no tests. No CI pipeline that fails when a segment gets deprecated. No lint rule that flags an ambiguous metric name. No type system. The wrongness is silent and patient.

## What I'm doing about it

A few things that are actually helping:

**Naming conventions enforced at the component level.** Calculated metrics and segments now follow a `[Scope] Name (version)` pattern, like `[Global] Sessions / Authenticated (v3)`. The scope prefix makes it immediately clear what data is included. Old versions get archived for 90 days, not deleted.

**Panel descriptions as contracts.** Every panel now has a description that states: what question it answers, what the date range is, and what the primary segment is. Sounds bureaucratic. In practice it takes 90 seconds and has already caught two cases where a panel was answering a slightly different question than its title implied.

**Quarterly workspace reviews.** Thirty minutes, on the calendar, with whoever owns the workspace. We look at what's still being used (CJA has usage data for this), what's changed in the underlying data that might affect calculations, and whether new metrics or segments duplicate existing ones.

None of this is revolutionary. It's the analytics equivalent of code comments and PR reviews. The fact that it still feels like extra work is the real problem -- it should feel like the default.

## The underlying issue

Dashboards feel finished in a way that code doesn't. When you ship a feature, everyone understands it'll need maintenance. When you hand over a workspace, the implicit message is: here, it's done.

It isn't done. It's just quiet.
