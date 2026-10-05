# landing-page Specification

## Purpose

The landing page is the platform's public home route: it tells a visitor what twjobs-ai is and what it does for them before they create an account.

## Requirements

### Requirement: Value proposition
The home route SHALL present the platform's name and a concise value proposition explaining what twjobs-ai does for a job-seeking candidate.

#### Scenario: Visitor loads the home page
- **WHEN** a visitor navigates to the home route (`/`)
- **THEN** the page displays the platform name and a value-proposition statement without requiring authentication

### Requirement: Feature overview
The home route SHALL describe each of the platform's core capabilities for candidates: maintaining a single candidate profile, capturing job postings via AI, generating an AI-tailored resume for a job, and running an AI-simulated interview with feedback and a score.

#### Scenario: Visitor reviews the feature overview
- **WHEN** a visitor scrolls through the home page
- **THEN** the page shows a distinct description for each of the four capabilities: candidate profile, AI job posting capture, AI resume generation, and AI interview simulation with analysis

### Requirement: Calls to action
The home route SHALL offer calls to action that let a visitor proceed to registration or login.

#### Scenario: Visitor wants to create an account
- **WHEN** a visitor activates the primary call to action
- **THEN** the visitor is directed to the registration path

#### Scenario: Visitor already has an account
- **WHEN** a visitor activates the secondary call to action
- **THEN** the visitor is directed to the login path

### Requirement: Accurate page metadata
The home route SHALL expose page metadata (title and description) that identifies twjobs-ai, instead of the default scaffold metadata.

#### Scenario: Visitor views the browser tab or a shared link preview
- **WHEN** the home page is loaded or its URL is shared
- **THEN** the displayed title and description identify twjobs-ai and its purpose, not "Create Next App"
