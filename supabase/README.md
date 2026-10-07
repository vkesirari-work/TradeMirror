# Supabase setup — Phase 2

1. Create a Supabase project. No project is created automatically by this repository.
2. Copy `.env.example` to `.env.local`. Set the project URL and **publishable** key from your project settings. Never put service-role or secret keys in `NEXT_PUBLIC_*` variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your application origin. For this local preview use `http://127.0.0.1:3000` if that is the URL you use in the browser; use the same host consistently.
4. Apply `migrations/202610070001_foundation.sql` using the Supabase SQL editor, or the Supabase CLI migration workflow. Apply once to a new project. The migration is transactional; review it before applying to an existing database.
5. In Auth URL configuration, set Site URL to the same origin and allow `<origin>/auth/confirm` as a redirect URL.
6. Enable email/password authentication and email confirmation. The default `{{ .ConfirmationURL }}` template works with the app's PKCE callback. Keep it for initial testing. If custom SMTP is configured later, an optional token-hash template can use the exact redirect supplied by the app:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your TradeMirror account</a>
```

The default Supabase sender only sends to organization-member addresses. Use custom SMTP for public-user signup; do not disable email confirmation to work around this limitation.

7. Restart the app after changing environment variables. Sign up, follow the email link, log out, and log back in. Test with two accounts.

## Data ownership

All nine application tables enable row-level security. Anonymous access has no table privileges. Authenticated users can read only their own rows; the only direct writes are profile display name, trade notes, and planned stop/target fields. Broker imports, executed orders, financial metrics, and final report states require a future trusted backend pipeline. No privileged database client is shipped in this phase.

Composite foreign keys prevent linking a user's rows to another user's import, connection, raw record, or trade. Financial amounts use decimal `numeric`, not floating-point storage. Unknown fields remain nullable. Auth signup creates a profile through a narrowly scoped trigger; existing accounts are backfilled during migration.

Broker tokens must not be placed in these browser-readable tables. A separate protected credential store is required before broker integration.

## Verification

`npm test` executes the migration against embedded PostgreSQL and checks profile creation, row-level isolation for two users, anonymous denial, write restrictions, duplicate fingerprints, ownership of linked records, and financial consistency constraints. This does **not** validate hosted Supabase email delivery, API configuration, or actual session cookie round trips.

Hosted acceptance checklist:

- Signup creates exactly one profile and sends a confirmation email.
- Valid confirmation opens the account workspace; invalid/expired links return to login.
- Login and sign-out work, including after reload and session refresh.
- Signed-out users cannot enter workspace routes when configuration is present.
- User A cannot read or update user B's rows through the REST API.
- A real account sees an empty workspace, never demo trades as its own data.

Official references: [SSR client and session refresh](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Connected instance

The supplied project is connected to local development and Vercel. The migration is applied, with nine RLS-enabled tables. Production Site URL is `https://trademirror-ten.vercel.app`; redirects allow its `/auth/confirm` plus exact `127.0.0.1:3000` and `localhost:3000` confirmation callbacks. First real-account signup/email/session validation remains pending.
