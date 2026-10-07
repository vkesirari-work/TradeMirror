export function loginErrorMessage(code?: string): string {
  switch (code) {
    case 'email_not_confirmed': return 'Please confirm your email before logging in. Open the confirmation link in the same browser where you signed up.';
    case 'invalid_credentials': return 'The email or password is incorrect. Use the password you chose when signing up.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit': return 'Too many attempts. Please wait a few minutes and try again.';
    default: return 'Unable to log in right now. Please try again shortly.';
  }
}
export function confirmationMessage(reason?: string): string | null {
  if (reason === 'browser') return 'The confirmation link could not open a session in this browser. If you already confirmed your email, log in here with your email and password. Use the same site and browser you used for signup.';
  if (reason === 'failed') return 'This confirmation link is invalid or expired. If your email is already confirmed, log in with your email and password.';
  return null;
}
export function confirmationFailureReason(code?: string, message = ''): 'browser' | 'failed' {
  return ['flow_state_not_found','bad_code_verifier','pkce_verifier_mismatch'].includes(code || '') || /code verifier|code_verifier/i.test(message) ? 'browser' : 'failed';
}
