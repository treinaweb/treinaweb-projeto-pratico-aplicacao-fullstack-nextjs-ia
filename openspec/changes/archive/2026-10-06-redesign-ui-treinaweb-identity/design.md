# Design

## Context

Current state of the UI:
- `app/layout.tsx` only renders `{children}`. Each page builds its own wrapper (`flex flex-1 ... bg-zinc-50 p-6 dark:bg-black`, `max-w-2xl`/`max-w-3xl`), header, and back link ("Voltar ao painel", "Voltar às entrevistas").
- `app/globals.css` holds the shadcn `base-nova` defaults: every color token is grayscale (chroma 0), including `--chart-1..5`. `--font-sans: var(--font-sans)` refers to itself, so the Geist variable set in the layout is never wired to `font-sans`.
- `@custom-variant dark (&:is(.dark *))` exists, but nothing sets `.dark`. The roughly 220 `dark:`/`zinc-*` utilities in 29 files under `app/` and `components/` never use their dark side. shadcn primitives (`button.tsx`) also carry `dark:` variants designed for dark surfaces.
- `components/ui` has only `button`, `card`, `input`, `label` (Base UI based). Icons come from `lucide-react`.
- Every signed-in page already calls `requireSession()` and is dynamic.
- No test runner: verification is `npm run lint`, `npm run build`, and manual checks, as in previous changes.
- Next.js 16.3: route groups `(folder)` keep URLs unchanged and can have their own `layout.tsx` (checked in `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`).

The TreinaWeb tokens were read from the production stylesheet of treinaweb.com.br (`build/assets/app-DmzTBcDO.css`). The site is dark only.

See `proposal.md` for motivation and `specs/` for the requirements.

## Goals / Non-Goals

**Goals:**
- One source of color: after this change, page and feature code use theme tokens only (`bg-card`, `text-muted-foreground`, `border-border`, `text-primary`, ...), never `zinc-*`, raw hex, or `dark:`.
- The next-step rules are a pure function over a plain summary object, so they can be read and checked in isolation.
- The dashboard loads with one batch of parallel queries.

**Non-Goals:**
- Automated tests or adding a test runner.
- Animations beyond what the shadcn components and `tw-animate-css` already provide, plus the button press effect.
- Caching dashboard data. Every request reads fresh data, like the rest of the app.

## Decisions

**1. Dark only, through a permanent `.dark` class, with the TreinaWeb palette in both `:root` and `.dark`.**
`<html>` gets `className="dark"` and `style={{ colorScheme: "dark" }}`. The TreinaWeb values go into `:root`, and the `.dark` block is removed so there is a single definition. The shadcn primitives keep their `dark:` variants, which are tuned for dark surfaces (for example `dark:bg-input/30` on outline buttons), and those now apply. Page-level `dark:` and `zinc-*` utilities are replaced by tokens in the same pass. Turning on `.dark` alone would switch them to their old zinc dark styles, which don't match the palette.
*Alternative:* keep no `.dark` class and delete every `dark:` variant, including in shadcn files. This was rejected because it forks the generated components and loses their dark tuning.

**2. Token mapping (OKLCH conversions of these hex values go in `globals.css`).**

| shadcn token | TreinaWeb | hex |
|---|---|---|
| `--background` | canvas | `#0a0d18` |
| `--card`, `--popover` | surface-card | `#161a2e` |
| `--muted`, `--secondary` | surface-soft | `#101426` |
| `--accent` | surface-elevated | `#1e2340` |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--accent-foreground`, `--secondary-foreground` | on-dark | `#f7f7f8` |
| `--muted-foreground` | muted | `#8290ac` |
| `--border` | hairline | `#242a44` |
| `--input` | hairline-strong | `#333b5e` |
| `--primary`, `--ring` | primary | `#7077ff` |
| `--primary-foreground` | canvas | `#0a0d18` (on-dark on `#7077ff` is only 3.4:1; canvas gives 5.3:1, matching TreinaWeb's dark text on the green CTA) |
| `--destructive` | danger | `#ef4444` |
| `--sidebar` | surface-soft | `#101426` |
| `--sidebar-foreground` | body | `#b7cada` |
| `--sidebar-accent` | surface-card | `#161a2e` |
| `--sidebar-accent-foreground` | on-dark | `#f7f7f8` |
| `--sidebar-primary`, `--sidebar-ring` | primary | `#7077ff` |
| `--sidebar-border` | hairline | `#242a44` |
| `--chart-1..5` | primary, cta, primary-active, primary-strong, body | `#7077ff #48d359 #9aa0ff #4e56ff #b7cada` |

New tokens, exposed through `@theme inline` as Tailwind colors: `--cta` `#48d359`, `--cta-hover` `#3bbd4a`, `--cta-foreground` `#0a0d18`, `--body` `#b7cada` (running text, softer than headings), `--surface-elevated` `#1e2340`, `--glow` `#4e56ff`. `--radius` becomes `0.5rem` (TreinaWeb's `radius-lg`).
`muted-soft` (`#4f5f82`, about 3:1 on the canvas) is not mapped to any text token. It may only be used for decorative strokes.

**3. Typography.** `next/font/google` loads Inter (400, 500, 600, 700, 800) as `--font-inter` and JetBrains Mono as `--font-jetbrains-mono`. `@theme inline` maps `--font-sans: var(--font-inter)`, `--font-heading: var(--font-inter)`, and `--font-mono: var(--font-jetbrains-mono)`, which also fixes the self-reference. Large headings follow TreinaWeb: `font-bold tracking-tight` with tighter tracking on the landing H1 (`tracking-[-0.04em] leading-[1.05]`).

**4. Shared visual primitives, kept small.**
- `Button` gains `variant="cta"` (`bg-cta text-cta-foreground hover:bg-cta-hover font-semibold`) and the press effect `active:scale-[0.97]` on all variants. Buttons become pills (`rounded-full`) to match TreinaWeb. Cards keep `rounded-lg`.
- `variant="cta"` marks the single primary action of a screen: the next-step action on the dashboard, "Nova vaga" on the job postings list, submit on login and registration. Other actions use `default` (indigo) or `outline`.
- Background effects are two utilities in `globals.css`: `.bg-grid` (1px lines in `rgb(255 255 255 / 0.05)`, 32px cells, faded with a radial mask) and `.bg-glow` (`radial-gradient(120% 100% at 50% 0, color-mix(in oklab, var(--glow) 16%, transparent), transparent 60%)`). They are used on the landing hero, the auth side panel, and the dashboard next-step card, and not on every page.
- `components/layout/page-header.tsx`: title, optional description, and an actions slot. Every signed-in page uses it in place of its ad-hoc header.
- `components/layout/empty-state.tsx`: icon, text, and action, for the empty lists.
- `components/ui/score-badge.tsx`: one place for score bands, used by the dashboard, the interviews list, and the analysis view. Bands: 75 or more is good (`text-cta`, check icon, no fill, so a full green fill stays reserved for the CTA), 50 to 74 is medium (`text-amber-400`), below 50 is low (`text-destructive`). The icon makes the band readable without relying on color.

**5. App shell through a route group and shadcn `sidebar`.**
```
app/
  layout.tsx           fonts, .dark, tokens
  page.tsx  login/  register/       public, no shell
  (app)/
    layout.tsx         requireSession -> SidebarProvider + AppSidebar + SidebarInset
    dashboard/ profile/ jobs/ resumes/ interviews/   (moved, URLs unchanged)
```
- `(app)/layout.tsx` reads the `sidebar_state` cookie with `cookies()` and passes it as `defaultOpen`, so a collapsed sidebar doesn't flash open on reload. It calls `requireSession()` to get the name and email for the account menu. **Each page keeps its own `requireSession()`**, because layouts don't re-run on client navigation and must not be the only guard.
- `<Sidebar collapsible="icon">` gives the icon rail, tooltips on collapsed items (`SidebarMenuButton tooltip`), the Ctrl/Cmd+B shortcut, and the mobile sheet below 768px.
- The navigation list is client-side (`components/layout/app-sidebar-nav.tsx`) because the active item needs `usePathname()`. Active means `pathname === href || pathname.startsWith(href + "/")`. On mobile, a nav click calls `setOpenMobile(false)`.
- In-progress indicator: the layout runs one `prisma.interviewSession.count({ where: { userId, status: "IN_PROGRESS" } })` through a new repository function and passes a boolean down. The indicator is a small `bg-cta` dot (TreinaWeb's "ao vivo" dot) on the Entrevistas item. Because layouts are not re-rendered on soft navigation, the interview chat already calls `router.refresh()` when an interview completes (see `app/interviews/[id]/page.tsx`), which also refreshes the layout. Ending an interview early takes the same path.
- `SidebarInset` holds a slim top bar (`SidebarTrigger` and the page title area) and a content container `mx-auto w-full max-w-6xl p-4 md:p-8`. Pages no longer set their own background or outer padding. Pages that read better narrow (profile forms, new job posting, resume view) set `max-w-3xl` on their own content.
- The account menu sits in `SidebarFooter`: avatar initials, name, email, and a `dropdown-menu` with "Meu perfil" and "Sair". It reuses the sign-out logic from `LogoutButton`.
*Alternative:* a top navigation bar like treinaweb.com.br's header. The user chose the sidebar. Its cost to the interview chat width is offset by the icon collapse.

**6. Dashboard data: one summary query, one pure rules function.**
```
app/(app)/dashboard/page.tsx  (server)
   |  getDashboardSummary(userId)          lib/dashboard/summary.ts
   |  computeNextStep(summary)             lib/dashboard/next-step.ts   (pure)
   |  computeProfileCompleteness(summary)  lib/dashboard/profile.ts     (pure)
   v
 NextStepCard | MetricCards | ScoreTrendChart* | CriteriaChart* | RecentActivity | OnboardingChecklist
                                    * "use client" (shadcn chart / Recharts), props only
```
`getDashboardSummary` runs a `Promise.all` of small reads, all filtered by `userId`:
- the profile with `_count` of its seven lists, plus `headline` and `summary`;
- job postings: `id, title, company, createdAt, _count.resumes`;
- resumes: `id, createdAt, jobPosting {title, company}, _count.interviews`;
- interviews: `id, status, createdAt, completedAt, resume.jobPosting {title, company}`, whether it has a candidate message (`_count` of messages filtered by `role: CANDIDATE`), and `analysis {overallScore, content, createdAt}`.

Data volumes are per-candidate and small (dozens of rows), so the derived values (metrics, trend, criterion averages, recent activity, pending items) are computed in TypeScript from these lists, not with SQL aggregation. Criterion scores live in `InterviewAnalysis.content` (JSON). They are read through the existing `interviewAnalysisContentSchema` (`safeParse`), and analyses that fail to parse are left out of the criterion averages but kept in the trend, since `overallScore` is a column.

`computeNextStep(summary)` returns `{ kind, title, description, href, ctaLabel }` and implements the rules in `specs/dashboard/spec.md` in that order. Links reuse existing entry points: `/interviews/{id}`, `/profile`, `/jobs/new`, `/resumes/new?jobPostingId=…`, `/interviews/new?resumeId=…`, `/interviews/new`. Criterion labels in pt-BR come from the labels already used by the analysis view.
*Alternative:* a dedicated SQL view or `groupBy` per metric. This was rejected because it means more queries for the same data, and the rules need the lists anyway.

**7. Charts with shadcn `chart`.**
- `ScoreTrendChart`: a `LineChart` with x = analysis date (`dd/MM`), y = 0 to 100 fixed, color `var(--chart-1)`, dots on, and `ChartTooltipContent` showing the date, the job title, and the score. Rendered only with two or more points (see the spec).
- `CriteriaChart`: a horizontal `BarChart` (`layout="vertical"`) with the four criteria and domain 0 to 100. Bars use `var(--chart-1)`. The weakest bar uses `var(--chart-3)` with a label "foco do próximo treino", and the same label is also shown as text, not only through color.
- Both receive plain serializable props from the server page. `ChartContainer` sets a min height so the layout doesn't shift.
*Alternative:* hand-drawn SVG. This was rejected by the user in favor of the shadcn chart.

**8. Dashboard layout.**
```
+------------------------------------------------------------------+
| .bg-glow card: [* PRÓXIMO PASSO] pill badge                      |
| title + description                         ( CTA verde -> )     |
+------------------------------------------------------------------+
| Perfil 62% [progress] | Vagas 5 | Currículos 3 | Nota média 71   |
+--------------------------------------+---------------------------+
| Evolução das notas (or single score) | Critérios (bars)          |
|   -- or, with no analysis --         |                           |
| Comece por aqui (checklist)          | Atividade recente         |
+--------------------------------------+---------------------------+
```
On a phone everything stacks in one column, with the metric cards in a 2x2 grid. The greeting ("Olá, {primeiro nome}") goes in the page header.

**9. Public pages.**
- Landing keeps its content (see the `landing-page` spec). The hero gets `.bg-grid` and `.bg-glow`, a pill badge "TWJobs AI" in TreinaWeb's style (green border at 45%, uppercase, `tracking-[0.08em]`, green dot), the large H1, a CTA pill "Criar minha conta", and an outline pill "Já tenho conta". Feature cards get a lucide icon in an indigo-tinted square, `bg-card border-border`, and a hover border in `primary/40`. It also gets a minimal top bar (logo and "Entrar") and a footer line.
- Login and registration: a two-column split from `lg` up. On the left, the form card on the canvas. On the right, a panel with `.bg-glow`/`.bg-grid`, the logo, the value proposition, and three short benefit lines. Below `lg`, only the form shows. The forms' logic doesn't change.
- Logo: a text wordmark "TWJobs **AI**" (with "AI" in `text-primary`) and a small lucide icon. There is no image asset, and TreinaWeb's own logo is not copied.

**10. Signed-in pages polish.**
- Lists (jobs, resumes, interviews) become cards with a title, a subtitle, metadata in `text-muted-foreground`, and `badge`s (work model and seniority on jobs; language on resumes; status "Em andamento"/"Concluída" plus `ScoreBadge` on interviews). Empty states use `EmptyState`.
- Profile: each section card gets a header with an icon and an item count. Forms stay as they are apart from tokens.
- Interview chat: the interviewer's bubble uses `bg-card border`, the candidate's uses `bg-primary text-primary-foreground`, and the composer sticks to the bottom of the content area.
- Resume view: a white "paper" sheet (`bg-white text-zinc-900`, `ring-1 ring-black/5`, shadow) on the dark canvas. This is the one place where fixed light colors are intentional, and its `dark:` variants must be removed, because with `.dark` always on they would turn the paper dark.

## Risks / Trade-offs

- [The shadcn CLI may try to overwrite `button.tsx`, `input.tsx`, `card.tsx` when adding `sidebar` and its dependencies] → Answer "no" to overwrites (or use `--overwrite=false`), then review the diff of `components/ui` before continuing.
- [Turning on `.dark` before tokens replace the page-level `dark:` utilities makes pages flip to the old zinc dark look] → Do the foundation (tokens, `.dark`, `dark:`/`zinc-*` removal) as one step and check every page before moving on.
- [The layout's in-progress indicator can be stale after a soft navigation that doesn't call `router.refresh()`] → It refreshes on interview completion and on every hard load. Accepted: the dashboard shows the precise state.
- [The layout adds a query to every signed-in navigation] → It is a single indexed `count` on `(userId, …)`, which is negligible.
- [Moving pages into `(app)/` breaks the 13 component imports of Server Actions via `@/app/profile/actions`, `@/app/jobs/actions`, `@/app/resumes/actions`, `@/app/interviews/actions`] → Update them to `@/app/(app)/…/actions` in the same step as the move, and let `npm run build` confirm none remain.
- [Malformed analysis JSON breaks the criterion averages] → `safeParse`, and skip the bad rows.
- [Green means "action" on TreinaWeb, while dashboards often use green for "good"] → Full green fill only on CTAs. The good score band uses green text with an icon (decision 4).
- [Recharts is client-only and adds bundle weight to the dashboard] → It is used only on `/dashboard`, inside two small client components.

## Migration Plan

No data or API migration. Deploy as a normal release. Rollback means reverting the commit. Moving pages into `(app)/` keeps every URL, so links, redirects (`requireSession` → `/login`, post-login → `/dashboard`), and `revalidatePath` calls keep working. Check `revalidatePath` arguments still point to URL paths, not file paths.
