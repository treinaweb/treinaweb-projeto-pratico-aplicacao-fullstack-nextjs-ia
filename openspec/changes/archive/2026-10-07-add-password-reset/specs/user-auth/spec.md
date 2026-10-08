# Spec Delta

## ADDED Requirements

### Requirement: Password reset request
The system SHALL let a visitor, from the login page, request a password reset by entering an email address. When the email belongs to an account, the system SHALL email a reset link to it. The visitor SHALL see the same confirmation, with no difference in content, whether or not the email is registered.

#### Scenario: Registered email
- **WHEN** a visitor requests a reset for an email that belongs to an account
- **THEN** a reset email with a link is sent to that address and the visitor sees a message saying that, if the email is registered, a link was sent

#### Scenario: Unregistered email
- **WHEN** a visitor requests a reset for an email that does not belong to any account
- **THEN** no email is sent and the visitor sees the same message as for a registered email

#### Scenario: Malformed email
- **WHEN** a visitor submits the reset request with an empty or malformed email
- **THEN** no request is made and they see a validation error on the email field

#### Scenario: Reaching the reset request
- **WHEN** a visitor on the login page chooses "Esqueci minha senha"
- **THEN** the reset request page opens

### Requirement: Reset link validity
A reset link SHALL be valid for one hour after it is sent and SHALL work only once. Opening an invalid, expired, or already used link SHALL show an explanation and a way to request a new link instead of the reset form.

#### Scenario: Valid link
- **WHEN** a visitor opens a reset link within one hour of receiving it and before using it
- **THEN** they see the form to choose a new password

#### Scenario: Expired link
- **WHEN** a visitor opens a reset link more than one hour after it was sent
- **THEN** they see that the link is invalid or expired and can request a new one

#### Scenario: Link already used
- **WHEN** a visitor opens a reset link that was already used to reset the password
- **THEN** they see that the link is invalid or expired and can request a new one

### Requirement: Password reset
The system SHALL let a visitor holding a valid reset link set a new password with a confirmation, applying the minimum length used at registration and requiring the confirmation to match. After a successful reset the visitor SHALL be taken to the login page with a success message and SHALL NOT be signed in automatically.

#### Scenario: Successful reset
- **WHEN** a visitor submits a new password meeting the minimum length and a matching confirmation through a valid link
- **THEN** the password is changed, they are taken to the login page with a message that the password was reset, and they can sign in with the new password but not the old one

#### Scenario: Invalid new password
- **WHEN** a visitor submits a new password below the minimum length, a confirmation that does not match, or an empty field
- **THEN** the password is not changed, the link stays usable, and they see a validation error on the field with the problem

#### Scenario: Link becomes invalid while the form is open
- **WHEN** a visitor submits the form after the link expired or was used in another tab
- **THEN** the password is not changed and they see that the link is invalid or expired, with a way to request a new one

### Requirement: Sessions ended after password reset
The system SHALL end every active session of the account when its password is reset through a reset link.

#### Scenario: Signed in elsewhere during a reset
- **WHEN** the password of an account with an active session on some device is reset
- **THEN** that session is ended and the next protected page request on that device redirects to the login page

### Requirement: Password reset notice
The system SHALL send an email to the account's address after its password is reset, telling the owner that the password was changed. A failure to send this notice SHALL NOT undo or block the reset.

#### Scenario: Notice after reset
- **WHEN** a password is reset through a reset link
- **THEN** an email telling the owner that their password was changed is sent to the account's address

#### Scenario: Notice cannot be sent
- **WHEN** a password is reset and the notice email fails to send
- **THEN** the password is still changed and all sessions are still ended
