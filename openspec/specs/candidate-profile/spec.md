# candidate-profile Specification

## Purpose

The candidate-profile capability is the single source of truth for a candidate's personal, academic, and professional data, letting them manage it directly and feeding every other capability (resume generation, interview simulation, interview analysis) that needs it.

## Requirements

### Requirement: Personal information management
The system SHALL let a signed-in candidate view and edit their personal information (headline, phone, location, and a short summary).

#### Scenario: Candidate updates personal information
- **WHEN** a signed-in candidate submits updated personal information
- **THEN** the changes are saved and reflected the next time the candidate views their profile

### Requirement: Work experience management
The system SHALL let a signed-in candidate add, view, edit, and remove entries in their work experience history (company, role, period, and description).

#### Scenario: Candidate adds a work experience entry
- **WHEN** a signed-in candidate submits a new work experience entry with company, role, and period
- **THEN** the entry appears in their work experience list

#### Scenario: Candidate removes a work experience entry
- **WHEN** a signed-in candidate removes an existing work experience entry
- **THEN** the entry no longer appears in their work experience list

### Requirement: Education management
The system SHALL let a signed-in candidate add, view, edit, and remove entries in their education history (institution, degree, and period).

#### Scenario: Candidate adds an education entry
- **WHEN** a signed-in candidate submits a new education entry with institution, degree, and period
- **THEN** the entry appears in their education list

#### Scenario: Candidate removes an education entry
- **WHEN** a signed-in candidate removes an existing education entry
- **THEN** the entry no longer appears in their education list

### Requirement: Course management
The system SHALL let a signed-in candidate add, view, edit, and remove entries for courses and certifications (name, institution, and completion date or workload).

#### Scenario: Candidate adds a course entry
- **WHEN** a signed-in candidate submits a new course entry with a name and institution
- **THEN** the entry appears in their course list

#### Scenario: Candidate removes a course entry
- **WHEN** a signed-in candidate removes an existing course entry
- **THEN** the entry no longer appears in their course list

### Requirement: Project management
The system SHALL let a signed-in candidate add, view, edit, and remove entries describing personal or professional projects (name, description, and an optional link).

#### Scenario: Candidate adds a project entry
- **WHEN** a signed-in candidate submits a new project entry with a name and description
- **THEN** the entry appears in their project list

#### Scenario: Candidate removes a project entry
- **WHEN** a signed-in candidate removes an existing project entry
- **THEN** the entry no longer appears in their project list

### Requirement: Useful link management
The system SHALL let a signed-in candidate add, view, edit, and remove useful links, each with a label and a URL (for example LinkedIn, GitHub, or a portfolio).

#### Scenario: Candidate adds a useful link
- **WHEN** a signed-in candidate submits a new link with a label and a valid URL
- **THEN** the link appears in their list of useful links

#### Scenario: Candidate removes a useful link
- **WHEN** a signed-in candidate removes an existing useful link
- **THEN** the link no longer appears in their list of useful links

### Requirement: Skill management
The system SHALL let a signed-in candidate add, view, edit, and remove skills they want to highlight on their profile.

#### Scenario: Candidate adds a skill
- **WHEN** a signed-in candidate submits a new skill name
- **THEN** the skill appears in their skill list

#### Scenario: Candidate removes a skill
- **WHEN** a signed-in candidate removes an existing skill
- **THEN** the skill no longer appears in their skill list

### Requirement: Language management
The system SHALL let a signed-in candidate add, view, edit, and remove languages they speak, each with a proficiency level.

#### Scenario: Candidate adds a language
- **WHEN** a signed-in candidate submits a new language with a name and proficiency level
- **THEN** the language appears in their language list

#### Scenario: Candidate removes a language
- **WHEN** a signed-in candidate removes an existing language
- **THEN** the language no longer appears in their language list

### Requirement: Profile data ownership
The system SHALL restrict access to a candidate's profile data (personal information and all list entries) to that candidate alone.

#### Scenario: Candidate attempts to access another candidate's profile data
- **WHEN** a signed-in candidate requests another candidate's profile data by its identifier
- **THEN** the system denies access and does not return that data
