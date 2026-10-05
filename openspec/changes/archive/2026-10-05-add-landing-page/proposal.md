# Proposal

## Why

The project's home route (`app/page.tsx`) is still the default `create-next-app` boilerplate — it says nothing about twjobs-ai. Before any feature capability ships, visitors need a real home page that explains what the platform does and why a candidate should sign up.

## What Changes

- Replace the boilerplate home page content with a landing page that presents twjobs-ai's value proposition and its core capabilities (single source-of-truth candidate profile, AI-structured job posting capture, AI-tailored resume generation, AI interview simulation and analysis).
- Update page/site metadata (title, description) to describe the actual product instead of "Create Next App".
- Add calls-to-action pointing visitors toward registration/login.

## Capabilities

### New Capabilities

- `landing-page`: the public home page that presents the platform's value proposition and features to visitors, with calls to action toward registration/login.

### Modified Capabilities

None.

## Impact

- `app/page.tsx`: replaced with landing page content.
- `app/layout.tsx`: metadata (`title`, `description`) updated.
- No new runtime dependencies and no backend/API changes — this is a static, unauthenticated page.
- Registration/login routes (`user-auth` capability) do not exist yet; the landing page's calls-to-action link to their planned paths (`/register`, `/login`) ahead of that capability being built, same as any other forward-looking internal link.
