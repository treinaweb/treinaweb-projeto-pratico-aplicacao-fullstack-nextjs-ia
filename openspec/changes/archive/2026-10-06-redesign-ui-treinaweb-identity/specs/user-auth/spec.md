# Spec Delta

## MODIFIED Requirements

### Requirement: Session-protected access
The system SHALL restrict access to authenticated-only areas of the platform to candidates with an active session, redirecting anyone else to the login page.

#### Scenario: Unauthenticated access to a protected area
- **WHEN** a visitor without an active session requests the dashboard
- **THEN** they are redirected to the login page instead of seeing the dashboard content

#### Scenario: Authenticated access to a protected area
- **WHEN** a candidate with an active session requests the dashboard
- **THEN** they see the dashboard, with their account information and a way to log out available in the app shell

#### Scenario: Account information on every protected page
- **WHEN** a candidate with an active session opens any other authenticated-only page
- **THEN** their account information and a way to log out are available in the app shell there too
