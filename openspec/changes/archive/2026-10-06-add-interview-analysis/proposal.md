# Proposal

## Why

Candidates can now rehearse a full mock interview, but practice without feedback doesn't show them what to improve. This is the last capability planned in `define-platform-architecture`: an AI evaluation of a completed interview that highlights strengths, weaknesses, and concrete improvements, with a score the candidate can track across attempts.

## What Changes

- Add interview analysis: on a completed interview, the candidate chooses "Gerar análise", and the AI evaluates the transcript against the job posting and the resume used.
- The analysis contains:
  - an overall score from 0 to 100;
  - scores from 0 to 100 for four criteria: communication, technical knowledge, fit with the role, and use of concrete examples;
  - strengths, weaknesses, and improvement suggestions;
  - for each candidate answer, a short comment and a suggestion of how to answer better.
- One analysis per interview: generated on demand, saved, and shown every time the interview is opened. There is no regeneration.
- The analysis is written in the interview's language (Portuguese or English).
- An interview with no answers from the candidate can't be analyzed.
- The interviews list shows the score of analyzed interviews.

**Out of scope** (later changes): regenerating or deleting an analysis, analyzing an interview still in progress, comparing scores across interviews over time, and exporting the analysis.

## Capabilities

### New Capabilities

- `interview-analysis`: on-demand AI evaluation of a completed interview (overall and per-criterion scores, strengths, weaknesses, improvement suggestions, and per-answer feedback), saved once per interview, shown with the interview, and scoped to its owner.

### Modified Capabilities

None. The interview page and the interviews list gain the analysis section and the score, but `interview-simulation`'s requirements don't change: completed interviews stay read-only, and the analysis is additional content owned by `interview-analysis`.

## Impact

- New Prisma model `InterviewAnalysis` (1:1 with `InterviewSession`, cascade delete) plus a migration.
- New `lib/ai/interview-analyzer.ts` and an `interviewAnalyzerModel` handle in `lib/ai/provider.ts` (optional `OPENAI_INTERVIEW_ANALYZER_MODEL` override); new `lib/validation/interview-analysis.ts`, `lib/interview-analysis/assemble.ts`, and `lib/db/repositories/interview-analyses.ts`.
- `app/interviews/[id]/page.tsx` gains the analysis section, with a new Server Action in `app/interviews/actions.ts`. `app/interviews/page.tsx` gains the score badge.
- No new dependencies.
