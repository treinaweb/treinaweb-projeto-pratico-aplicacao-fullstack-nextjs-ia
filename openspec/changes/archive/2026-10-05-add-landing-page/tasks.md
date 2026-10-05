# Tasks

## 1. Content

- [x] 1.1 Write hero copy (platform name + value proposition) and feature-overview copy for the four capabilities (candidate profile, AI job posting capture, AI resume generation, AI interview simulation and analysis) — verify the draft covers the "Value proposition" and "Feature overview" requirements in `specs/landing-page/spec.md`

## 2. Home page implementation

- [x] 2.1 Replace the `app/page.tsx` boilerplate with a hero section rendering the platform name and value proposition, removing the default Next.js/Vercel promotional content and images — verify by running `npm run dev` and confirming the home route no longer shows "To get started, edit the page.tsx file."
- [x] 2.2 Add a features section to the home page listing the four core capabilities with a short description each — verify by confirming all four capability descriptions render on the home route
- [x] 2.3 Add a primary call-to-action linking to `/register` and a secondary call-to-action linking to `/login` — verify both links are present with the correct `href` values
- [x] 2.4 Update `app/layout.tsx` metadata (`title`, `description`) to describe twjobs-ai instead of the default scaffold values — verify by inspecting the rendered `<head>` in the browser dev tools

## 3. Verification

- [x] 3.1 Run `npm run lint` and `npm run build` and confirm both succeed — verify by checking the command exit status
- [x] 3.2 Manually load the home route in the dev server at both a mobile and a desktop viewport width and confirm the hero, features, and CTAs are all visible and usable — verify by visual check in the browser
