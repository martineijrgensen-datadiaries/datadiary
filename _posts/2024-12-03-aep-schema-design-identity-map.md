---
layout: post
title: "AEP Schema Design: Getting Identity Map Right"
subtitle: "The identity map field is deceptively simple. Here's what trips people up in real implementations."
tags: [AEP]
read_time: 8
emoji: "🗺️"
---

The identity map in Adobe Experience Platform is one of those things you configure once, get slightly wrong, and then wonder for months why your profile merge rates are lower than expected. This is what I've learned from fixing it in production.

## What the identity map actually is

At its core, `identityMap` is a map of namespace keys to arrays of identity objects. Each identity object has three fields:

```json
{
  "identityMap": {
    "ECID": [
      {
        "id": "12345678901234567890",
        "primary": false,
        "authenticatedState": "ambiguous"
      }
    ],
    "Email": [
      {
        "id": "user@example.com",
        "primary": true,
        "authenticatedState": "authenticated"
      }
    ]
  }
}
```

The namespace keys (ECID, Email) must match namespaces you've created in AEP's Identity Service. Case matters — `email` and `Email` are different namespaces.

## The primary flag

You can mark exactly one identity as primary per event. The primary identity is what gets used as the record key when the event lands in a dataset with profile-enabled schemas.

Common mistake: marking ECID as primary. ECID is a device identifier — if you use it as the primary identity and merge policy treats it as highest priority, two different people sharing a device (family computer, kiosk, shared tablet) end up merged into one profile. Almost never what you want.

**Best practice:** Set authenticated identities (Email, CRMID, loyalty number) as primary when available. Let ECID be a secondary, linking identity.

## authenticatedState values

Three options: `authenticated`, `loggedOut`, `ambiguous`.

- `authenticated` — user has explicitly logged in during this session
- `loggedOut` — user has explicitly logged out
- `ambiguous` — no auth signal (most anonymous/ECID traffic)

This field feeds into probabilistic and deterministic merge policies. If you're sending everything as `ambiguous` because it's the default, you're leaving merge accuracy on the table for any authenticated traffic.

## Namespace priority in merge policies

The merge policy you attach to a schema determines which identity "wins" when two profile fragments conflict. Priority order is set in the UI: **Profile > Merge Policies**.

A sensible default priority stack:
1. CRMID (deterministic, authoritative)
2. Email (deterministic, usually available post-login)
3. ECID (device-level, lowest trust)

If ECID is above Email in your merge policy and a user logs in from two devices, you may end up with split profiles instead of a merged one.

## Schema field group placement

`identityMap` is a standard XDM field — you don't define it yourself. It's included automatically when you enable a schema for Profile. But it only works correctly if your datastream / source connector is actually populating it.

One thing that catches people: if you're using the Web SDK, ECID is populated automatically in the identity map. But your authenticated identities (Email, CRMID) need to be explicitly set in `alloy("setConsent", ...)` or in the `identityMap` option passed to `alloy("sendEvent", ...)`.

## Checking your identity graph

After ingestion, you can inspect the resolved identity graph in the UI: **Profiles > Browse > search by namespace and value**. The graph view shows which identities have been linked and through which namespace.

If a known user's email and ECID aren't linked, the most common causes are:
- Namespace name mismatch (capitalisation)
- `primary` flag on the wrong identity
- Merge policy not yet applied to historical data (reprocessing required)

Getting the identity map right at schema design time saves a lot of backfilling pain later.
