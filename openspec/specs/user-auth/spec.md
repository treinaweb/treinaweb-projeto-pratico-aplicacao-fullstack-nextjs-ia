# user-auth Specification

## Purpose

The user-auth capability lets a candidate create an account, sign in, sign out, and restricts access to the parts of the platform that require an identified candidate.

## Requirements

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
- **THEN** they see the dashboard, with their account information and a way to log out available in the app shell

#### Scenario: Account information on every protected page
- **WHEN** a candidate with an active session opens any other authenticated-only page
- **THEN** their account information and a way to log out are available in the app shell there too

### Requirement: Password change
The system SHALL let a signed-in candidate change their password by providing their current password, a new password, and a confirmation of the new password. The password SHALL only change when the current password is correct and the input is valid.

#### Scenario: Successful password change
- **WHEN** a signed-in candidate submits the change-password form with their correct current password and a valid new password confirmed identically
- **THEN** their password is changed, they stay signed in on the current device, the form is cleared, and they see a confirmation message

#### Scenario: Signing in with the new password
- **WHEN** a candidate who changed their password signs in later
- **THEN** sign-in succeeds with the new password and fails with the old one

#### Scenario: Incorrect current password
- **WHEN** a signed-in candidate submits the form with a current password that does not match their account
- **THEN** the password is not changed and they see an error on the current-password field

### Requirement: Password change validation
The system SHALL reject a password change, without changing the password, when any field is missing, the new password is below the minimum length used at registration, the confirmation does not match the new password, or the new password equals the current one, and SHALL identify the problem to the candidate.

#### Scenario: New password too short
- **WHEN** a signed-in candidate submits a new password below the minimum length
- **THEN** the password is not changed and they see a validation error on the new-password field

#### Scenario: Confirmation does not match
- **WHEN** a signed-in candidate submits a confirmation different from the new password
- **THEN** the password is not changed and they see a validation error on the confirmation field

#### Scenario: New password equals the current one
- **WHEN** a signed-in candidate submits a new password identical to the current password
- **THEN** the password is not changed and they see a validation error on the new-password field

#### Scenario: Missing field
- **WHEN** a signed-in candidate submits the form with any of the three fields empty
- **THEN** the password is not changed and they see a validation error on each empty field

### Requirement: Other sessions ended after password change
The system SHALL end every other active session of the account when its password is changed, keeping only the session used to make the change.

#### Scenario: Signed in on another device
- **WHEN** a candidate signed in on two devices changes their password on one of them
- **THEN** the session on the other device is ended and the next protected page request there redirects to the login page, while the device used for the change stays signed in
