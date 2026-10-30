# Campaign Concept Studio

A responsive creative workspace that turns a campaign brief into a structured concept, with optional server-side AI copy and visual generation.

## Features

- Responsive campaign brief with required-field validation and progress feedback.
- Instant local brief outline and copy-to-clipboard actions.
- Optional AI-generated campaign strategy, creative routes, sample copy, visual direction, and review checklist through the OpenAI Responses API.
- Optional AI-generated visual concept through the Responses API image-generation tool.
- Explicit loading, empty, configuration, provider-error, and retry states.
- API key stays on the server; the browser never receives the key.
- No fabricated audience metrics, market research, testimonials, or performance guarantees.

## Requirements

Node.js 20.9 or later and npm.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

- `OPENAI_API_KEY`: server-side secret from the OpenAI API platform. Never prefix it with `NEXT_PUBLIC_` and never commit it.
- `OPENAI_MODEL`: optional model override. Defaults to `gpt-4.1-mini`.
- `CAMPAIGN_GENERATION_ENABLED`: set to `true` only after Preview validation and a separate production approval. It is disabled unless explicitly enabled.\n- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: required server-only Upstash Redis REST credentials for the endpoint's atomic per-IP rate limit. If either is missing or Redis is unavailable, AI generation fails closed with HTTP 503. Never prefix these variables with `NEXT_PUBLIC_`.

The brief-only workflow works without an API key. AI generation intentionally returns a configuration message until the server key and explicit feature flag are configured.

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```

## Production safety checklist

Before enabling AI generation on a public deployment:

1. Configure `OPENAI_API_KEY` as a server-side Vercel environment variable for the intended environment only.
2. Set `CAMPAIGN_GENERATION_ENABLED=true` only after reviewing the API account's billing and limits.
3. Configure Upstash Redis REST credentials in the Preview environment and verify the atomic rate limit. The current endpoint limits each observed client IP to 5 generation attempts per rolling fixed one-hour counter; it fails closed if Redis is unavailable. This is an IP-based control, not user authentication, and production deployments must verify the trusted proxy's client-IP header behavior and consider account-level quotas/CAPTCHA before public launch.
4. Monitor provider usage and errors; set appropriate project/account spending limits where available.
5. Test text generation, image generation, invalid input, missing/wrong origin, rate-limit threshold, Redis unavailable, provider quota errors, missing key, and disabled-feature behavior in a Preview deployment before any production enablement.

Image generation can incur additional provider charges. Keep the visual option off unless it is needed.

## Privacy

Briefs are submitted to the server only when the user explicitly requests AI generation. They are sent to the configured AI provider for processing. The app does not intentionally persist the brief in a database. Do not submit confidential or sensitive information unless the data-handling implications have been reviewed.

## Vercel

The repository is connected to Vercel. Use Preview deployments for validation. Production promotion and changes to authentication/protection settings require an explicit decision.

## Status

The existing production deployment is a verified build deployment. This branch adds the provider integration behind a disabled-by-default feature flag; AI generation is not live until its server environment is configured and the safety checklist above is completed.
