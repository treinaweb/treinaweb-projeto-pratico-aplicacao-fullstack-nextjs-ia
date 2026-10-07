# Proposal

## Why

Every feature of the MVP now works, but the app still looks like a `create-next-app` scaffold: grayscale shadcn defaults, no shared layout (each page builds its own wrapper and a "Voltar ao painel" link), and a dashboard that is just a card with four buttons and says nothing about the candidate's progress. Now that profile, job postings, resumes, interviews, and analyses all store data, the dashboard can guide the candidate through that journey, and the whole app can take on TreinaWeb's visual identity so it feels like a real product.

## What Changes

- Apply TreinaWeb's visual identity to the whole app, taken from the production CSS of treinaweb.com.br: navy canvas `#0a0d18`, indigo brand `#7077ff`, green action `#48d359`, layered navy surfaces and hairline borders, Inter + JetBrains Mono, pill-shaped buttons and badges, radial indigo glows, and a subtle grid background. The app becomes **dark only**: no light theme and no theme toggle.
- Replace hardcoded `zinc-*`/hex colors in pages and components with theme tokens; Geist fonts are replaced.
- Add an authenticated app shell: a collapsible left sidebar (shadcn `sidebar`) shared by every signed-in page, with navigation (Painel, Perfil, Vagas, Currículos, Entrevistas), the active item highlighted, an "interview in progress" indicator, and the account menu with logout. It collapses to icons on desktop (state remembered across reloads) and becomes a slide-over sheet on mobile. The per-page "Voltar ao painel" links are removed.
- Rebuild the dashboard around the candidate's real data:
  - a **next step** card computed from their data, using a fixed priority order (resume an in-progress interview, then analyze a completed interview, complete the profile, add a job posting, generate a resume, practice an interview, and finally practice again focusing on the weakest criterion);
  - metrics: profile completeness, job postings, resumes, interviews, and average interview score;
  - a score trend line chart (shown only with two or more analyses) and a per-criterion bar chart that highlights the weakest criterion (shadcn `chart`, Recharts);
  - recent activity;
  - an onboarding checklist instead of empty charts while the candidate has no analysis yet.
- Restyle the public pages: landing (hero with glow, grid, and pill badge; same content), login, and registration (split screen with the form next to a value-proposition panel).
- Polish the remaining signed-in pages (profile, job postings, resumes, interviews, and their detail/new pages): consistent page headers, status badges, empty states with icons, and the resume preview rendered as a white "paper" sheet on the dark canvas, matching the exported PDF.

**Out of scope:** a light theme or theme toggle; new features or data (no schema changes); changes to AI behavior, prompts, or the PDF template; sidebar counters other than the in-progress indicator.

## Capabilities

### New Capabilities

- `dashboard`: the signed-in candidate's home: next-step recommendation and its priority rules, profile completeness, progress metrics, interview score trend and per-criterion averages, recent activity, and the onboarding state for candidates with no analysis yet.
- `app-shell`: the shared navigation frame for signed-in pages: sidebar sections and active state, collapsing and its persistence, mobile behavior, the in-progress interview indicator, and the account menu with logout.

### Modified Capabilities

- `user-auth`: the "Session-protected access" requirement says the dashboard itself shows account information and logout; these now live in the app shell and are available on every protected page.

The `landing-page` requirements (value proposition, feature overview, calls to action, metadata) are unchanged; only its visuals change.

## Impact

- New shadcn components: `sidebar` (brings `sheet`, `tooltip`, `separator`, `skeleton`, and the `use-mobile` hook), `chart`, `badge`, `avatar`, `progress`, `dropdown-menu`. New dependency `recharts` (pulled in by `chart`).
- `app/globals.css` rewritten with TreinaWeb tokens; `app/layout.tsx` switches to Inter/JetBrains Mono and turns on dark mode permanently.
- New route group `app/(app)/` with a shell layout; `dashboard`, `profile`, `jobs`, `resumes`, and `interviews` move into it. URLs don't change.
- New `lib/dashboard/` (summary query and the pure next-step function), plus small read-only queries in `lib/db/repositories/`.
- Every page and feature component under `app/` and `components/` gets restyled; no server action, route handler, AI module, or Prisma model changes.
