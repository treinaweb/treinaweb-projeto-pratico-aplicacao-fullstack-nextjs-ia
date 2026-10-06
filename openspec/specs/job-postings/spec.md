# job-postings Specification

## Purpose

The job-postings capability lets a candidate capture the job postings they are interested in as structured data — extracted by AI from pasted raw text and reviewed by the candidate — so that resume generation and interview features can use them.

## Requirements

### Requirement: Job posting area requires a session
The system SHALL restrict every job posting page and action to a signed-in candidate, redirecting unauthenticated visitors to the login page.

#### Scenario: Unauthenticated visitor opens the job postings area
- **WHEN** a visitor without an active session opens the job postings list or the new job posting page
- **THEN** the system redirects them to the login page

### Requirement: Raw job posting text input
The system SHALL let a signed-in candidate paste the raw text of a job posting and request its extraction, accepting text between 50 and 20,000 characters after trimming.

#### Scenario: Candidate submits text within limits
- **WHEN** a signed-in candidate submits job posting text with at least 50 and at most 20,000 characters
- **THEN** the system starts extracting structured fields from it

#### Scenario: Candidate submits text that is too short or too long
- **WHEN** a signed-in candidate submits empty text, text under 50 characters, or text over 20,000 characters
- **THEN** the system rejects it with a validation message and does not call the AI model

### Requirement: AI extraction of structured fields
The system SHALL extract from the raw text: title, company, location, work model (remote, hybrid, or on-site), employment type, seniority, salary, summary, and lists of responsibilities, requirements, nice-to-haves, and benefits.

#### Scenario: Complete posting is extracted
- **WHEN** a candidate submits a posting that states the role, company, requirements, and benefits
- **THEN** the system returns those values in the corresponding structured fields

#### Scenario: Posting in Portuguese is extracted in Portuguese
- **WHEN** a candidate submits a posting written in Portuguese
- **THEN** the extracted text fields are in Portuguese, without translation

### Requirement: Missing information is left empty
The system SHALL leave a field empty when the posting does not state that information, and MUST NOT invent values that are not supported by the text.

#### Scenario: Posting without salary or company
- **WHEN** a candidate submits a posting that mentions neither a salary nor a company name
- **THEN** the salary and company fields are returned empty

### Requirement: Extraction failure is reported
The system SHALL show a user-facing error when the extraction cannot be completed, keeping the pasted text so the candidate can retry, and SHALL NOT save anything.

#### Scenario: AI model fails or returns invalid data
- **WHEN** the AI model call errors, times out, or returns data that does not match the expected structure
- **THEN** the candidate sees an error message, the pasted text is preserved, and no job posting is saved

### Requirement: Candidate reviews before saving
The system SHALL present the extracted fields in an editable form and save a job posting only after the candidate explicitly confirms; extraction alone MUST NOT persist anything.

#### Scenario: Candidate corrects a field and saves
- **WHEN** the candidate edits an extracted field in the review form and confirms
- **THEN** the job posting is saved with the edited value

#### Scenario: Candidate abandons the review
- **WHEN** the candidate leaves the review form without confirming
- **THEN** no job posting is saved

#### Scenario: Candidate goes back to edit the raw text
- **WHEN** the candidate chooses to go back from the review form
- **THEN** the original pasted text is shown again for editing and re-extraction

### Requirement: Saved job posting validation
The system SHALL require a non-empty title to save a job posting; all other fields are optional, and a work model, when present, MUST be one of remote, hybrid, or on-site.

#### Scenario: Candidate confirms without a title
- **WHEN** the candidate confirms the review form with the title empty
- **THEN** the system rejects the save and shows a validation message on the title field

### Requirement: Saved job posting keeps the original text
The system SHALL store the original pasted text alongside the reviewed structured fields of each saved job posting.

#### Scenario: Posting is saved
- **WHEN** the candidate confirms the review form with valid data
- **THEN** the saved job posting contains both the reviewed fields and the original raw text

### Requirement: Job postings are owned by the candidate
The system SHALL scope every saved job posting to the candidate who saved it; a candidate MUST only see their own job postings.

#### Scenario: Another candidate's posting is not listed
- **WHEN** candidate A has saved job postings and candidate B opens their job postings list
- **THEN** none of candidate A's postings appear in candidate B's list

### Requirement: Job postings list
The system SHALL show a signed-in candidate the list of their saved job postings, most recent first, displaying at least title, company, and save date, with an entry point to add a new posting.

#### Scenario: Candidate with saved postings opens the list
- **WHEN** a signed-in candidate with saved job postings opens the job postings list
- **THEN** their postings are shown ordered from most recently saved to oldest

#### Scenario: Candidate without postings opens the list
- **WHEN** a signed-in candidate with no saved job postings opens the job postings list
- **THEN** an empty state is shown with a call to add their first job posting

#### Scenario: Candidate saves a posting
- **WHEN** the candidate confirms a valid review form
- **THEN** they are taken to the job postings list, where the new posting appears first
