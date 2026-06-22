---
description: 'Server Route Handler conventions for app/api.'
applyTo: 'app/api/**/*.ts'
---

# API route conventions

- Export named HTTP methods (`GET`, `POST`, …) taking `NextRequest` and returning `NextResponse.json(...)`.
- **Multi-source with graceful degradation.** External data goes through an ordered list of sources, each with a `transform` that normalises to the project shape (`{ base, rates }`). Try them in order; never let one provider's outage break the endpoint.
- **Validate the payload, not just `response.ok`.** Treat a `200 OK` with a missing/empty body as a failure — e.g. reject a normalised result that carries no usable rates — so the chain falls through instead of returning garbage. End the chain with bundled mock data so the app works with no keys/config.
- **Timeouts:** wrap each fetch in an `AbortController` with a sane timeout (~10s) and clear it in `finally`.
- **Caching:** set `export const revalidate = <seconds>` and a matching `Cache-Control` header.
- **Response envelope:** success → `{ success: true, data: { base, rates, timestamp } }`; failure → `{ success: false, error }` with an appropriate status. Log provider failures with enough context to debug, but don't leak internals to the client.
