# Spec Delta

## Purpose

The app shell is the navigation frame shared by every signed-in page: it lets the candidate move directly between the platform's areas, shows where they are and what needs attention, and gives access to their account and logout.

## ADDED Requirements

### Requirement: Shell on signed-in pages only
The system SHALL wrap every signed-in page (dashboard, profile, job postings, resumes, interviews, and their detail and creation pages) in the app shell, and SHALL NOT show it on the landing, login, or registration pages.

#### Scenario: Signed-in page
- **WHEN** a signed-in candidate opens any page under job postings, resumes, interviews, profile, or the dashboard
- **THEN** the page is shown inside the app shell

#### Scenario: Public page
- **WHEN** anyone opens the landing, login, or registration page
- **THEN** the app shell is not shown

### Requirement: Navigation sections
The shell SHALL offer navigation to Painel, Perfil, Vagas, Currículos, and Entrevistas, and SHALL mark as active the section that contains the current page, including its detail and creation pages.

#### Scenario: Navigating between sections
- **WHEN** a candidate on the job postings page selects Entrevistas
- **THEN** the interviews list opens without going through the dashboard

#### Scenario: Active section on a nested page
- **WHEN** a candidate opens the page of a single resume or the new job posting page
- **THEN** Currículos or Vagas, respectively, is marked as active

### Requirement: Collapsible navigation
On desktop-sized screens the shell SHALL let the candidate collapse the navigation to icons only and expand it again, by a visible control or by Ctrl/Cmd+B. The collapsed or expanded state SHALL persist across page reloads and navigation. While collapsed, each item SHALL show its name on hover or keyboard focus.

#### Scenario: Collapse persists after reload
- **WHEN** a candidate collapses the navigation and reloads the page
- **THEN** the navigation is still collapsed, without first appearing expanded

#### Scenario: Collapsed item name
- **WHEN** the navigation is collapsed and the candidate hovers over or focuses an item
- **THEN** the item's name is shown

### Requirement: Mobile navigation
On small screens the shell SHALL hide the navigation behind a menu control and open it as an overlay panel, which SHALL close when the candidate picks a destination or dismisses it.

#### Scenario: Navigating on a phone
- **WHEN** a candidate on a small screen opens the menu and selects Vagas
- **THEN** the job postings page opens and the navigation panel is closed

### Requirement: In-progress interview indicator
The shell SHALL show an indicator on the Entrevistas item while the candidate has at least one interview in progress, and SHALL NOT show it otherwise.

#### Scenario: Interview in progress
- **WHEN** a candidate has an interview in progress
- **THEN** the Entrevistas item shows the indicator on every signed-in page

#### Scenario: Interview finished
- **WHEN** the candidate ends their only interview in progress and navigates to another page
- **THEN** the indicator is no longer shown

### Requirement: Account menu
The shell SHALL show the signed-in candidate's name and email, and SHALL offer access to their profile and a logout action.

#### Scenario: Logging out from any page
- **WHEN** a candidate on any signed-in page chooses to log out from the account menu
- **THEN** their session is ended and they are taken to a page that does not require authentication
