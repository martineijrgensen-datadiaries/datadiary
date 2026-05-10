---
layout: post
title: "AEP Schema Design: Getting Identity Map Right"
subtitle: "Configure it once, get it slightly wrong, wonder for months why merges are off. Here's the stuff that actually trips people up."
tags: [AEP]
read_time: 8
emoji: "🗺️"
---

The identity map in Adobe Experience Platform is one of those things you configure once, get slightly wrong, and then spend months wondering why your profile merge rates look lower than expected. I've fixed this in production a few times now. Here's what actually tripped us up.

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

The namespace keys (ECID, Email) have to match namespaces you've created in AEP's Identity Service. Case matters -- `email` and `Email` are different namespaces. I've lost a solid hour to this exact typo.

## The primary flag

You can mark exactly one identity as primary per event. The primary identity is what gets used as the record key when the event lands in a dataset with profile-enabled schemas.

Common mistake: marking ECID as primary. ECID is a device identifier. If it's your primary identity and your merge policy treats it as highest priority, two people sharing a device (family laptop, a kiosk, a shared tablet at the office) end up merged into one profile. Almost never what you want.

Set authenticated identities (Email, CRMID, loyalty number) as primary when they're available. Let ECID be a secondary, linking identity.

## authenticatedState values

Three options: `authenticated`, `loggedOut`, `ambiguous`.

- `authenticated`: user explicitly logged in during this session
- `loggedOut`: user explicitly logged out
- `ambiguous`: no auth signal (most anonymous and ECID traffic)

This field feeds into your merge policies. If you're sending everything as `ambiguous` because it's the default and it seemed fine, you're leaving merge accuracy on the table for all your authenticated traffic.

## Namespace priority in merge policies

The merge policy you attach to a schema determines which identity "wins" when two profile fragments conflict. Priority order is set in the UI under Profile > Merge Policies.

A sensible default:
1. CRMID (deterministic, authoritative)
2. Email (deterministic, usually available post-login)
3. ECID (device-level, lowest trust)

If ECID sits above Email in your merge policy and a user logs in from two devices, you may end up with split profiles instead of a merged one.

## Schema field group placement

`identityMap` is a standard XDM field, you don't define it yourself. It's included automatically when you enable a schema for Profile. But it only works correctly if your datastream or source connector is actually populating it.

Something that catches people with the Web SDK: ECID is populated automatically in the identity map. Your authenticated identities (Email, CRMID) are not. Those need to be explicitly set via the `identityMap` option in `alloy("sendEvent", ...)`.

## Checking your identity graph

After ingestion, you can inspect the resolved identity graph in the UI: Profiles > Browse > search by namespace and value. The graph view shows which identities have been linked and through which namespace.

If a known user's email and ECID aren't linked, the usual suspects:
- Namespace name mismatch (capitalisation, classic)
- `primary` flag on the wrong identity
- Merge policy not yet applied to historical data (reprocessing required)

Getting this right at schema design time is worth the effort. Backfilling identity graphs later is not a fun afternoon.
