---
layout: post
title: "CJA Derived Fields: Regex Replace in Practice"
subtitle: "How to clean up messy URL parameters and campaign strings without touching the data layer."
tags: [CJA]
read_time: 6
---

Derived fields in Customer Journey Analytics are one of those features that sound straightforward until you're staring at a regex replace rule that refuses to behave. This is a short field note on the patterns that actually work in production.

## The problem

You've got a `page_url` dimension full of tracking parameters — UTMs, click IDs, session tokens — and marketing wants a clean `page_path` that strips everything after the `?`. Simple enough in SQL. In CJA's derived field builder, slightly less obvious.

## The regex replace approach

The function you want is **Regex Replace**. The gotcha is that CJA's regex engine is Java-based, so some shortcuts you're used to from JavaScript or Python won't behave the same way.

To strip query strings:

```
Pattern:  \?.*$
Replace:  (leave empty)
```

This matches the `?` character and everything that follows, then replaces it with nothing. Works reliably for stripping UTM parameters.

## Capturing groups

Where it gets interesting is when you want to *extract* something from the middle of a string rather than just strip a suffix. Say you want the first path segment from `/products/shoes/red`:

```
Pattern:  ^\/([^\/]+).*$
Replace:  $1
```

The `$1` backreference returns just the first captured group — in this case `products`. CJA supports `$1` through `$9` for group references.

## Case-insensitive matching

CJA's regex replace doesn't have a flag toggle in the UI. To match case-insensitively, use the inline flag at the start of your pattern:

```
(?i)campaign
```

This matches `Campaign`, `CAMPAIGN`, `campaign`, etc.

## Chaining derived fields

One derived field can reference another. This is useful when you want to build up a clean value in stages — first strip the query string, then extract the path segment, then recode known values with a lookup table. Each step is its own derived field, and they compose cleanly.

The build order matters: Jekyll compiles them top-to-bottom in the field list, so make sure a field is defined before anything that references it.

## What doesn't work

- Lookaheads (`(?=...)`) — not supported
- Named capture groups (`(?<name>...)`) — use positional `$1` instead
- The `\s+` shorthand in character classes inside replace strings — spell it out as a space or use `[ \t]`

These limitations catch most people coming from a Python or JS regex background. Once you know them, the derived field builder is actually quite capable for the 80% of use cases that don't need lookaheads.
