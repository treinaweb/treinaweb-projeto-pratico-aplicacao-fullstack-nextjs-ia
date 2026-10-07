# Spec Delta

## Purpose

The dashboard is the signed-in candidate's home: it summarizes their progress across profile, job postings, resumes, interviews, and analyses, and recommends the single next action that moves them closer to being ready for the real interview.

## ADDED Requirements

### Requirement: Dashboard shows only the candidate's own data
Every number, chart, recommendation, and activity item on the dashboard SHALL be computed only from the signed-in candidate's own data.

#### Scenario: Two candidates with different data
- **WHEN** two candidates with different job postings, resumes, and interviews each open the dashboard
- **THEN** each one sees only figures and items derived from their own records

### Requirement: Next step recommendation
The dashboard SHALL show exactly one recommended next step, with a short explanation and an action that leads to the page where it can be done. The step SHALL be the first rule that applies, in this order: resume an interview in progress; analyze a completed interview; complete the profile; add a job posting; generate a resume; practice an interview; practice again on the weakest criterion.

#### Scenario: Interview in progress
- **WHEN** the candidate has at least one interview in progress
- **THEN** the next step is to continue their most recently started interview in progress, and the action opens that interview

#### Scenario: Completed interview without analysis
- **WHEN** no interview is in progress and the candidate has a completed interview with at least one answer and no analysis
- **THEN** the next step is to generate the analysis of the most recent such interview, and the action opens that interview

#### Scenario: Completed interview with no answers is ignored
- **WHEN** the candidate's only interview without an analysis was completed without any answer
- **THEN** that interview does not produce the "generate analysis" step and the following rules are evaluated

#### Scenario: Profile is incomplete
- **WHEN** no earlier rule applies and the candidate's profile lacks a core section
- **THEN** the next step is to complete the profile, naming the missing core sections, and the action opens the profile page

#### Scenario: No job posting
- **WHEN** no earlier rule applies and the candidate has no saved job posting
- **THEN** the next step is to add a job posting, and the action opens the new job posting page

#### Scenario: Job posting without resume
- **WHEN** no earlier rule applies and at least one of the candidate's job postings has no resume
- **THEN** the next step is to generate a resume for the most recently saved such posting, and the action opens resume generation with that posting selected

#### Scenario: Resume without interview
- **WHEN** no earlier rule applies and at least one of the candidate's resumes has never been used in an interview
- **THEN** the next step is to practice an interview with the most recently generated such resume, and the action opens the interview start page with that resume selected

#### Scenario: Everything done
- **WHEN** no earlier rule applies and the candidate has at least one analysis
- **THEN** the next step is to practice another interview focusing on their weakest criterion, naming it, and the action opens the interview start page

#### Scenario: Nothing left and no analysis
- **WHEN** no earlier rule applies and the candidate has no analysis
- **THEN** the next step is to add a new job posting

### Requirement: Profile core sections
The profile SHALL be considered to lack a core section when its headline or summary is empty, when it has no skill, or when it has neither a work experience nor an education entry.

#### Scenario: Recent graduate without work experience
- **WHEN** a candidate has a headline, a summary, skills, and an education entry but no work experience
- **THEN** the profile has all core sections and does not trigger the "complete the profile" step

#### Scenario: Profile without skills
- **WHEN** a candidate has filled personal information and work experience but has no skill
- **THEN** the profile lacks a core section and the step names skills as missing

### Requirement: Profile completeness
The dashboard SHALL show profile completeness as a percentage over eight equally weighted sections: personal information (headline and summary filled), work experience, education, courses, projects, links, skills, and languages. A list section counts when it has at least one entry. The sections not yet filled SHALL be listed.

#### Scenario: Half of the sections filled
- **WHEN** a candidate has filled personal information, work experience, education, and skills only
- **THEN** the dashboard shows 50% and lists courses, projects, links, and languages as missing

#### Scenario: Empty profile
- **WHEN** a candidate has filled nothing in their profile
- **THEN** the dashboard shows 0% and lists all eight sections as missing

### Requirement: Progress metrics
The dashboard SHALL show the candidate's number of saved job postings, generated resumes, interviews (split into in progress and completed), and the average overall score of their analyzed interviews, rounded to an integer.

#### Scenario: Candidate with activity
- **WHEN** a candidate has 3 job postings, 2 resumes, 1 interview in progress, 2 completed interviews, and analyses scoring 60 and 81
- **THEN** the dashboard shows 3 job postings, 2 resumes, 1 interview in progress, 2 completed interviews, and an average score of 71

#### Scenario: No analysis yet
- **WHEN** a candidate has no analyzed interview
- **THEN** the average score is shown as not available instead of zero

### Requirement: Score trend
The dashboard SHALL show the overall scores of the candidate's analyzed interviews in chronological order of analysis as a trend chart when there are at least two analyses. With exactly one analysis, it SHALL show that single score instead of a chart.

#### Scenario: Several analyses
- **WHEN** a candidate has analyses scoring 55, 62, and 78, generated in that order
- **THEN** the trend chart shows the three scores from oldest to newest, and each point identifies its date and the job posting

#### Scenario: Single analysis
- **WHEN** a candidate has exactly one analysis
- **THEN** no trend chart is shown and the dashboard shows that analysis's score

### Requirement: Criterion averages
The dashboard SHALL show, for each of the four analysis criteria (communication, technical knowledge, fit with the role, use of concrete examples), the average score across the candidate's analyses, rounded to an integer, and SHALL highlight the criterion with the lowest average as the one to practice. Ties go to the first in that order.

#### Scenario: Weakest criterion highlighted
- **WHEN** a candidate's averages are communication 82, technical knowledge 74, fit with the role 78, and concrete examples 54
- **THEN** the four averages are shown and use of concrete examples is highlighted as the criterion to practice

#### Scenario: Tie for the lowest average
- **WHEN** communication and concrete examples share the lowest average
- **THEN** communication is highlighted

### Requirement: Recent activity
The dashboard SHALL list the candidate's five most recent events, newest first, from: job posting saved, resume generated, interview started, interview completed, and analysis generated. Each event SHALL name the related job posting and link to the related item.

#### Scenario: Mixed activity
- **WHEN** a candidate saved a posting, then generated a resume for it, then started and completed an interview
- **THEN** recent activity lists interview completed, interview started, resume generated, and job posting saved, in that order, each linking to its item

#### Scenario: No activity
- **WHEN** a candidate has no job posting, resume, or interview
- **THEN** recent activity is not shown

### Requirement: Onboarding state
While the candidate has no analysis, the dashboard SHALL show an onboarding checklist instead of the score trend and criterion averages. The checklist SHALL list, in order: create account, complete the profile core sections, add a job posting, generate a resume, complete an interview, and receive an analysis, each marked done or pending.

#### Scenario: New candidate
- **WHEN** a candidate who just registered opens the dashboard
- **THEN** the checklist shows the account step done and every other step pending, and no chart is shown

#### Scenario: Candidate receives their first analysis
- **WHEN** a candidate with one completed interview generates its analysis and returns to the dashboard
- **THEN** the onboarding checklist is no longer shown and the score and criterion averages are shown instead
