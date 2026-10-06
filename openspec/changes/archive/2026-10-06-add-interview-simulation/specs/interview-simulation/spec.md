# Spec Delta

## Purpose

The interview-simulation capability lets a candidate rehearse for a job by holding a text-chat mock interview with an AI interviewer that knows the job posting and the resume the candidate will present, and keeps each interview's transcript for later review and analysis.

## ADDED Requirements

### Requirement: Interview area requires a session
The system SHALL restrict every interview page and action to a signed-in candidate, redirecting unauthenticated visitors to the login page, and SHALL reject chat requests without a session with an unauthorized response.

#### Scenario: Unauthenticated visitor opens an interview page
- **WHEN** a visitor without an active session opens the interviews list, the start page, or an interview
- **THEN** the system redirects them to the login page

#### Scenario: Unauthenticated chat request
- **WHEN** a request without an active session is sent to the interview chat endpoint
- **THEN** the system responds as unauthorized and calls no AI model

### Requirement: Interview starts from a generated resume
The system SHALL let a signed-in candidate start an interview for one of their own generated resumes, both from the resume's page and by choosing a resume on the start page; the interview is grounded in that resume and its job posting.

#### Scenario: Candidate starts from a resume page
- **WHEN** a signed-in candidate chooses "Simular entrevista" on one of their resumes
- **THEN** the start page opens with that resume selected

#### Scenario: Candidate has no resumes
- **WHEN** a signed-in candidate with no generated resumes opens the start page
- **THEN** the system explains that a resume must be generated first and links to resume generation, without offering to start

#### Scenario: Resume belongs to someone else or does not exist
- **WHEN** a start request references a resume that does not exist or belongs to another candidate
- **THEN** the system refuses it as not found and no interview is created

### Requirement: Interviewer opens the interview
The system SHALL create the interview with an opening message from the interviewer that greets the candidate, briefly frames the interview for the job posting, and asks the first question, and SHALL then show the interview.

#### Scenario: Interview starts
- **WHEN** a candidate starts an interview
- **THEN** the interview page opens with the interviewer's greeting and first question already shown

### Requirement: Mixed interview grounded in the posting and resume
The interviewer SHALL ask one question per turn, mixing behavioral and technical questions that fit the job posting's requirements and responsibilities and the experience in the resume, and MAY ask follow-up questions about the candidate's previous answer.

#### Scenario: Questions relate to the posting and resume
- **WHEN** the interviewer asks questions during an interview
- **THEN** the questions refer to the posting's role, requirements, or responsibilities, or to experience listed in the resume

#### Scenario: One question per turn
- **WHEN** the interviewer replies to a candidate's answer
- **THEN** the reply contains at most one question for the candidate to answer

### Requirement: Interviewer stays in role
The interviewer SHALL stay in the role of a professional interviewer for that posting, SHALL NOT evaluate, score, or give feedback on answers during the interview, and SHALL steer off-topic messages back to the interview.

#### Scenario: Candidate asks for feedback mid-interview
- **WHEN** the candidate asks the interviewer how they are doing
- **THEN** the interviewer politely declines to evaluate during the interview and continues with the next question

#### Scenario: Candidate goes off-topic
- **WHEN** the candidate sends a message unrelated to the interview
- **THEN** the interviewer briefly redirects the conversation back to the interview

### Requirement: Interview language follows the resume
The system SHALL conduct the interview in the language of the chosen resume (Portuguese or English).

#### Scenario: Resume in English
- **WHEN** a candidate starts an interview for a resume written in English
- **THEN** the interviewer's messages are in English

### Requirement: Streamed replies
The system SHALL display the interviewer's reply incrementally while it is being produced, and SHALL prevent the candidate from sending another message until the reply is complete.

#### Scenario: Candidate sends an answer
- **WHEN** the candidate sends an answer
- **THEN** the interviewer's reply appears progressively and the message input stays disabled until it finishes

### Requirement: Candidate answer limits
The system SHALL accept candidate answers that are non-empty after trimming and at most 4,000 characters.

#### Scenario: Answer too long or empty
- **WHEN** the candidate submits an empty answer or one over 4,000 characters
- **THEN** the system rejects it with a message and the interviewer does not reply

### Requirement: Interview ends after eight questions
The system SHALL limit an interview to 8 interviewer questions, follow-ups included: after the candidate answers the eighth, the interviewer SHALL reply with a closing message that asks no further question, and the interview SHALL become completed.

#### Scenario: Candidate answers the last question
- **WHEN** the candidate answers the interviewer's eighth question
- **THEN** the interviewer thanks the candidate and closes without a new question, and the interview is marked completed

#### Scenario: Progress is visible
- **WHEN** the candidate views an interview in progress
- **THEN** the page shows which question of 8 is being answered

### Requirement: Candidate can end the interview early
The system SHALL let the candidate end an in-progress interview at any time, after which the interview is completed with the messages exchanged so far.

#### Scenario: Candidate ends early
- **WHEN** the candidate confirms ending an interview after three answers
- **THEN** the interview is marked completed and shows the transcript up to that point

### Requirement: Interviews are saved and resumable
The system SHALL save every message of an interview once the interviewer's reply to it is complete, and an in-progress interview SHALL be resumable from where it stopped.

#### Scenario: Candidate returns later
- **WHEN** a candidate leaves an in-progress interview after two answers and opens it again later
- **THEN** the full conversation so far is shown and the candidate can answer the pending question

#### Scenario: Reply fails
- **WHEN** the AI model fails while replying to an answer
- **THEN** the candidate sees an error with an option to retry, and neither the answer nor a partial reply is saved

### Requirement: Completed interviews are read-only
The system SHALL show a completed interview as a read-only transcript and SHALL reject new answers to it.

#### Scenario: Answer sent to a completed interview
- **WHEN** a request sends an answer to a completed interview
- **THEN** the system rejects it, calls no AI model, and saves nothing

### Requirement: Interviews are owned by the candidate
The system SHALL scope every interview to the candidate who started it; a candidate MUST NOT see, continue, or end another candidate's interview.

#### Scenario: Accessing another candidate's interview
- **WHEN** a signed-in candidate opens, sends an answer to, or ends an interview started by another candidate
- **THEN** the system responds as not found and changes nothing

### Requirement: Interviews list
The system SHALL show a signed-in candidate their interviews, most recent first, each with the job posting title, company, start date, and status (in progress or completed), plus an empty state with a way to start one.

#### Scenario: Candidate with interviews opens the list
- **WHEN** a signed-in candidate with interviews opens the interviews list
- **THEN** their interviews are listed from most recent to oldest, each linking to the interview with its status shown

#### Scenario: Candidate without interviews opens the list
- **WHEN** a signed-in candidate without interviews opens the interviews list
- **THEN** an empty state is shown with a call to start an interview
