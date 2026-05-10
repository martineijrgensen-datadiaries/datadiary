---
layout: post
title: "CJA Derived Fields: Regex Replace in Practice"
subtitle: "The derived field builder is actually great. The Java regex engine takes some getting used to."
tags: [CJA]
read_time: 6
emoji: "⚙️"
---

Derived fields in CJA sound deceptively simple. Then you're twenty minutes into a regex replace rule that silently does nothing, and you start questioning your life choices. Here's what actually works in production, because the docs don't cover this part.

## The problem

You've got a `page_url` dimension stuffed with UTMs, click IDs, and session tokens. Marketing wants a clean `page_path` with none of that. In SQL it's one line. In CJA's derived field builder it's a bit more of an adventure.

## The regex replace approach

The function you want is **Regex Replace**. The thing nobody mentions upfront: CJA's regex engine is Java-based. If you're coming from JavaScript or Python, some of your shortcuts won't behave the same way, and the error messages won't help much.

To strip query strings:

```
Pattern:  \?.*$
Replace:  (leave empty)
```

Matches the `?` and everything after it, replaces with nothing. Reliable for UTM cleanup every time.

## Capturing groups

Where it gets interesting is when you want to pull something out of the middle of a string instead of just chopping off a suffix. Say you want the first path segment from `/products/shoes/red`:

```
Pattern:  ^\/([^\/]+).*$
Replace:  $1
```

`$1` is a backreference to the first captured group, which gives you `products`. CJA supports `$1` through `$9`.

## Case-insensitive matching

There's no flag toggle in the UI for this one. Instead, drop an inline flag at the start of your pattern:

```
(?i)campaign
```

Matches `Campaign`, `CAMPAIGN`, `campaign`, all of it.

## Chaining derived fields

One derived field can reference another, and this is genuinely useful. Strip the query string in field one, extract the path segment in field two, recode known values with a lookup table in field three. Each step is its own field and they compose cleanly.

Build order matters though: CJA evaluates them top-to-bottom in the field list, so a field has to be defined before anything else can reference it.

## What doesn't work

- Lookaheads (`(?=...)`) -- not supported
- Named capture groups (`(?<name>...)`) -- use positional `$1` instead
- The `\s+` shorthand inside replace strings -- spell out a space or use `[ \t]`

These catch almost everyone coming from a Python or JS background. Once you know the limits, the builder handles the 80% of cases that don't need lookaheads just fine.
