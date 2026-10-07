import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loginErrorMessage, confirmationMessage, confirmationFailureReason } from '../lib/auth/feedback.ts';
test('login distinguishes confirmation, credentials and rate limits without exposing provider internals',()=>{
 assert.match(loginErrorMessage('email_not_confirmed'),/confirm your email/);
 assert.match(loginErrorMessage('invalid_credentials'),/email or password is incorrect/);
 assert.match(loginErrorMessage('over_request_rate_limit'),/wait/);
 assert.match(loginErrorMessage('unexpected'),/try again/);
});
test('confirmation distinguishes a missing browser verifier from expired links',()=>{
 assert.equal(confirmationFailureReason('flow_state_not_found'),'browser');
 assert.equal(confirmationFailureReason('invalid_request','both auth code and code verifier should be non-empty'),'browser');
 assert.equal(confirmationFailureReason('otp_expired'),'failed');
 assert.match(confirmationMessage('browser'),/already confirmed/);
 assert.equal(confirmationMessage('untrusted-value'),null);
});
