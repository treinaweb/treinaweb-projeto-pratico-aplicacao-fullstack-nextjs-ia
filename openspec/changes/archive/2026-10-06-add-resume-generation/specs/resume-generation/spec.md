# Spec Delta

## Purpose

The resume-generation capability turns a candidate's profile into a resume tailored to one of their saved job postings, using AI to select and reword profile content without inventing information, and lets the candidate keep, view, and export those resumes as PDF.

## ADDED Requirements

### Requirement: Resume area requires a session
The system SHALL restrict every resume page, action, and PDF download to a signed-in candidate, redirecting unauthenticated visitors to the login page.

#### Scenario: Unauthenticated visitor opens a resume page
- **WHEN** a visitor without an active session opens the resumes list, the generation page, a resume, or a resume PDF URL
- **THEN** the system redirects them to the login page

### Requirement: Generation starts from a saved job posting
The system SHALL let a signed-in candidate request a resume for one of their own saved job postings, both from each posting in the job postings list and by choosing a posting on the generation page.

#### Scenario: Candidate starts from the job postings list
- **WHEN** a signed-in candidate chooses "Gerar currículo" on one of their saved job postings
- **THEN** the generation page opens with that posting selected

#### Scenario: Candidate has no saved job postings
- **WHEN** a signed-in candidate with no saved job postings opens the generation page
- **THEN** the system tells them to save a job posting first and links to adding one, without offering generation

#### Scenario: Posting belongs to someone else or does not exist
- **WHEN** a generation request references a job posting that does not exist or belongs to another candidate
- **THEN** the system refuses it as not found, calls no AI model, and saves nothing

### Requirement: Profile must have content to generate
The system SHALL refuse generation when the candidate's profile has no work experience, education, project, or skill, explaining that the profile must be filled in first and linking to it, without calling the AI model.

#### Scenario: Empty profile
- **WHEN** a candidate whose profile has no work experience, education, project, or skill requests a resume
- **THEN** the system shows a message pointing to the profile page and no resume is generated or saved

### Requirement: Resume is tailored to the posting
The system SHALL produce a resume whose headline, professional summary, selection and order of profile items, experience highlights, and project descriptions are written with the chosen job posting's role and requirements in focus.

#### Scenario: Relevant experience comes first
- **WHEN** a candidate with several work experiences generates a resume for a posting
- **THEN** the resume includes the experiences relevant to the posting, with highlights that emphasize what the posting asks for

#### Scenario: Irrelevant items may be left out
- **WHEN** the profile contains items unrelated to the posting
- **THEN** the resume may omit them, but every item it includes exists in the profile

### Requirement: Resume never invents information
The resume MUST NOT contain companies, roles, dates, institutions, degrees, courses, projects, skills, languages, or contact details that are not in the candidate's account or profile; the AI may only select, order, and reword profile content.

#### Scenario: Posting asks for a skill the candidate lacks
- **WHEN** the posting requires a skill that is not in the candidate's profile
- **THEN** that skill does not appear in the resume's skills or as a claimed qualification

#### Scenario: Factual fields match the profile
- **WHEN** a resume includes a work experience or education entry
- **THEN** its company or institution, role or degree, and dates are exactly those stored in the profile

### Requirement: Contact information comes from the candidate's data
The system SHALL show at the top of every resume the candidate's account name and email plus, when filled in, the profile's phone, location, and links.

#### Scenario: Profile without phone
- **WHEN** a candidate without a phone in their profile generates a resume
- **THEN** the resume header shows name, email, and the other filled-in contact data, and no phone

### Requirement: Resume language follows the posting
The system SHALL write the resume, including its section headings, in Portuguese when the job posting is in Portuguese and in English otherwise.

#### Scenario: Posting in Portuguese
- **WHEN** a candidate generates a resume for a posting written in Portuguese
- **THEN** the resume text and section headings are in Portuguese

#### Scenario: Posting in English
- **WHEN** a candidate generates a resume for a posting written in English
- **THEN** the resume text and section headings are in English

### Requirement: Generation failure is reported
The system SHALL show a user-facing error when generation cannot be completed and SHALL NOT save a partial resume.

#### Scenario: AI model fails
- **WHEN** the AI model call errors, times out, or returns data that does not match the expected structure
- **THEN** the candidate sees an error message, can try again, and no resume is saved

### Requirement: Generated resume is saved as a snapshot
The system SHALL save each successfully generated resume, linked to its job posting, and keep its content unchanged even if the profile or posting is edited afterwards; generating again creates a new resume.

#### Scenario: Profile changes after generation
- **WHEN** a candidate edits their profile after generating a resume
- **THEN** the previously generated resume still shows the content it was generated with

#### Scenario: Generating twice for the same posting
- **WHEN** a candidate generates a resume for a posting that already has one
- **THEN** a second resume is saved and both remain available

### Requirement: Resumes are owned by the candidate
The system SHALL scope every resume to the candidate who generated it; a candidate MUST NOT see, open, or download another candidate's resume.

#### Scenario: Opening another candidate's resume
- **WHEN** a signed-in candidate opens the view or PDF URL of a resume generated by another candidate
- **THEN** the system responds as not found

### Requirement: Resumes list
The system SHALL show a signed-in candidate their resumes, most recent first, each with the job posting title, company, and generation date, plus an empty state with a way to generate the first one.

#### Scenario: Candidate with resumes opens the list
- **WHEN** a signed-in candidate with generated resumes opens the resumes list
- **THEN** their resumes are listed from most recent to oldest, each linking to its view page

#### Scenario: Candidate without resumes opens the list
- **WHEN** a signed-in candidate without resumes opens the resumes list
- **THEN** an empty state is shown with a call to generate a resume

### Requirement: Resume view
The system SHALL show a saved resume's full content on its own page, with actions to download it as PDF and to go back to the list.

#### Scenario: Generation succeeds
- **WHEN** a resume is generated successfully
- **THEN** the candidate is taken to that resume's view page

### Requirement: PDF export
The system SHALL let the candidate download a saved resume as a PDF file containing the same content and section order as the view page.

#### Scenario: Candidate downloads the PDF
- **WHEN** the candidate chooses to download a saved resume as PDF
- **THEN** the browser receives a PDF file with the resume's content, named after the candidate and the job posting title
