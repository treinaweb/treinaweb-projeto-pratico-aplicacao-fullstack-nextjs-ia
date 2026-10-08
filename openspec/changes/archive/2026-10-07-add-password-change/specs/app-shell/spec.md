# Spec Delta

## MODIFIED Requirements

### Requirement: Shell on signed-in pages only
The system SHALL wrap every signed-in page (dashboard, profile, account, job postings, resumes, interviews, and their detail and creation pages) in the app shell, and SHALL NOT show it on the landing, login, or registration pages.

#### Scenario: Signed-in page
- **WHEN** a signed-in candidate opens any page under job postings, resumes, interviews, profile, account, or the dashboard
- **THEN** the page is shown inside the app shell

#### Scenario: Public page
- **WHEN** anyone opens the landing, login, or registration page
- **THEN** the app shell is not shown

### Requirement: Account menu
The shell SHALL show the signed-in candidate's name and email, and SHALL offer access to their profile, their account page (where the password is changed), and a logout action.

#### Scenario: Logging out from any page
- **WHEN** a candidate on any signed-in page chooses to log out from the account menu
- **THEN** their session is ended and they are taken to a page that does not require authentication

#### Scenario: Opening the account page from any page
- **WHEN** a candidate on any signed-in page chooses "Minha conta" from the account menu
- **THEN** the account page opens with the change-password form
