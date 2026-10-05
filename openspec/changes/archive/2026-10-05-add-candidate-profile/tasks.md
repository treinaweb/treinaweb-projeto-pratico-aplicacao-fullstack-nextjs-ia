# Tasks

## 1. Data model

- [x] 1.1 Add `CandidateProfile`, `WorkExperience`, `Education`, `Course`, `Project`, `ProfileLink`, `Skill`, `Language` models (and a `LanguageProficiency` enum) to `prisma/schema.prisma`, with `CandidateProfile.userId` a plain `String` (no relation to `User`) and the seven list models relating to `CandidateProfile` via `profileId` — verify `npx prisma validate` succeeds
- [x] 1.2 Run `npx prisma migrate dev --name add_candidate_profile` against the local Docker Postgres, then `npx prisma generate` — verify the migration applies and `candidate_profile`/`work_experience`/`education`/`course`/`project`/`profile_link`/`skill`/`language` tables exist

## 2. Repositories (ownership enforced here)

- [x] 2.1 Add `lib/db/repositories/candidate-profile.ts`: `getOrCreateProfile(userId)` and `updatePersonalInfo(userId, data)` — verify `npx tsc --noEmit` passes
- [x] 2.2 Add `lib/db/repositories/work-experience.ts`: `list`, `create`, `update`, `remove`, each scoped to the owning candidate's `userId` — verify `npx tsc --noEmit` passes
- [x] 2.3 Add `lib/db/repositories/education.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes
- [x] 2.4 Add `lib/db/repositories/courses.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes
- [x] 2.5 Add `lib/db/repositories/projects.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes
- [x] 2.6 Add `lib/db/repositories/links.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes
- [x] 2.7 Add `lib/db/repositories/skills.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes
- [x] 2.8 Add `lib/db/repositories/languages.ts` with the same CRUD shape, scoped to `userId` — verify `npx tsc --noEmit` passes

## 3. Validation

- [x] 3.1 Add `lib/validation/profile.ts` with Zod schemas for personal info and all seven list entities (including a `LanguageProficiency` enum schema) — verify `npx tsc --noEmit` passes

## 4. Server Actions

- [x] 4.1 Add `app/profile/actions.ts` with `updatePersonalInfo`, each calling `requireSession()` and validating with the matching schema from `lib/validation/profile.ts` before calling its repository — verify `npx tsc --noEmit` passes
- [x] 4.2 Add `createWorkExperience`/`updateWorkExperience`/`deleteWorkExperience` actions, each calling `requireSession()` and validating input — verify `npx tsc --noEmit` passes
- [x] 4.3 Add `createEducation`/`updateEducation`/`deleteEducation` actions — verify `npx tsc --noEmit` passes
- [x] 4.4 Add `createCourse`/`updateCourse`/`deleteCourse` actions — verify `npx tsc --noEmit` passes
- [x] 4.5 Add `createProject`/`updateProject`/`deleteProject` actions — verify `npx tsc --noEmit` passes
- [x] 4.6 Add `createLink`/`updateLink`/`deleteLink` actions — verify `npx tsc --noEmit` passes
- [x] 4.7 Add `createSkill`/`updateSkill`/`deleteSkill` actions — verify `npx tsc --noEmit` passes
- [x] 4.8 Add `createLanguage`/`updateLanguage`/`deleteLanguage` actions — verify `npx tsc --noEmit` passes

## 5. Profile page and sections

- [x] 5.1 Add `app/profile/page.tsx`: a Server Component that calls `requireSession()`, loads the candidate's profile and all list entities, and renders the personal info form plus the seven section components — verify the route type-checks and loads without error for a signed-in candidate
- [x] 5.2 Add `components/profile/personal-info-form.tsx` (`useActionState` against `updatePersonalInfo`) — verify in the browser that editing headline/phone/location/summary saves and persists on reload
- [x] 5.3 Add `components/profile/work-experience-section.tsx` (list + add/edit form + delete) — verify in the browser: adding an entry shows it in the list, editing it updates the list, removing it drops it from the list
- [x] 5.4 Add `components/profile/education-section.tsx` — verify add/edit/remove in the browser as in 5.3
- [x] 5.5 Add `components/profile/course-section.tsx` — verify add/edit/remove in the browser as in 5.3
- [x] 5.6 Add `components/profile/project-section.tsx` — verify add/edit/remove in the browser as in 5.3
- [x] 5.7 Add `components/profile/link-section.tsx` — verify add/edit/remove in the browser as in 5.3
- [x] 5.8 Add `components/profile/skill-section.tsx` — verify add/edit/remove in the browser as in 5.3
- [x] 5.9 Add `components/profile/language-section.tsx` (with proficiency level) — verify add/edit/remove in the browser as in 5.3

## 6. Wiring and ownership verification

- [x] 6.1 Add a "Meu perfil" link from `app/dashboard/page.tsx` to `/profile` — verify clicking it from the dashboard loads the profile page
- [x] 6.2 Verify unauthenticated access to `/profile` redirects to `/login`, matching `user-auth`'s session-protection behavior
- [x] 6.3 Verify profile data ownership: with two candidate accounts, confirm candidate B cannot view or delete an entry (e.g. a work experience id) that belongs to candidate A — the action returns not-found and candidate A's data is unaffected, matching the "Profile data ownership" scenario

## 7. Final verification

- [x] 7.1 Run `npm run lint` and `npm run build` and confirm both succeed
- [x] 7.2 Run a full manual pass in the dev server covering every scenario in `specs/candidate-profile/spec.md` (personal info update, add/remove for each of the seven list entities, unauthenticated redirect, cross-candidate ownership) and confirm each matches its scenario
