# Spec Delta

## ADDED Requirements

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
