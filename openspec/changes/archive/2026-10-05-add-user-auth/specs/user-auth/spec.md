# Spec Delta

## Purpose

The user-auth capability lets a candidate create an account, sign in, sign out, and restricts access to the parts of the platform that require an identified candidate.

## ADDED Requirements

### Requirement: Candidate registration
The system SHALL let a visitor create a candidate account by providing a name, an email address, and a password, and SHALL reject registration when the email is already registered or the input is invalid (missing fields, malformed email, or a password below the minimum length).

#### Scenario: Successful registration
- **WHEN** a visitor submits the registration form with a name, a unique email, and a password meeting the minimum length
- **THEN** a candidate account is created, the visitor is signed in, and is taken to the dashboard

#### Scenario: Email already registered
- **WHEN** a visitor submits the registration form with an email that already belongs to an account
- **THEN** no new account is created and the visitor sees an error explaining the email is already in use

#### Scenario: Invalid registration input
- **WHEN** a visitor submits the registration form with a missing field, a malformed email, or a password below the minimum length
- **THEN** no account is created and the visitor sees a validation error identifying the problem

### Requirement: Candidate login
The system SHALL let a registered candidate sign in with their email and password, and SHALL reject sign-in attempts with incorrect credentials without revealing whether the email or the password was wrong.

#### Scenario: Successful login
- **WHEN** a candidate submits the login form with their correct email and password
- **THEN** a session is established and the candidate is taken to the dashboard

#### Scenario: Incorrect credentials
- **WHEN** a candidate submits the login form with an email and password that do not match a registered account
- **THEN** no session is established and the candidate sees a generic invalid-credentials error

### Requirement: Candidate logout
The system SHALL let a signed-in candidate end their session.

#### Scenario: Successful logout
- **WHEN** a signed-in candidate activates logout
- **THEN** their session is ended and they are taken to a page that does not require authentication

### Requirement: Session-protected access
The system SHALL restrict access to authenticated-only areas of the platform to candidates with an active session, redirecting anyone else to the login page.

#### Scenario: Unauthenticated access to a protected area
- **WHEN** a visitor without an active session requests the dashboard
- **THEN** they are redirected to the login page instead of seeing the dashboard content

#### Scenario: Authenticated access to a protected area
- **WHEN** a candidate with an active session requests the dashboard
- **THEN** they see the dashboard, including their account information and a way to log out
