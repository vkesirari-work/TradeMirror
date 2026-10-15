# Zerodha manual sync pilot

Status: implementation and mocked validation ready; live broker access is not activated. Free Console CSV import remains the default. Do not claim broker authorization, live receipt or historical backfill until accepted with the owner.

## Boundaries

The pilot fetches only `GET /user/profile` and `GET /trades` from `https://api.kite.trade`. It verifies the configured broker account before retrieving trades. The trades endpoint returns current-day executions, not old tradebooks. Tokens expire at 6 AM the next day unless invalidated sooner. See [Kite trades documentation](https://kite.trade/docs/connect/v3/orders/#retrieving-all-trades) and [authentication documentation](https://kite.trade/docs/connect/v3/user/).

Only NFO/BFO executions are supported; other rows are counted and excluded visibly. Exact response numeric lexemes pass through the existing Console normalization. Malformed supported executions fail the whole preview; no silent partial save. Price precision is limited to the same four decimals as CSV imports. No broker order placement, modification or cancellation exists in this module.

## Activation prerequisites

1. Owner confirms supported Kite developer access and its service terms/costs. No subscription or purchase is created by this project.
2. Operator sets server-only `TRADEMIRROR_ENABLE_KITE_SYNC=true`, `KITE_ALLOWED_USER_ID` (TradeMirror auth UUID), `KITE_API_KEY`, `KITE_ACCESS_TOKEN`, and `KITE_BROKER_USER_ID` (expected Zerodha account). Never put these in `NEXT_PUBLIC_` variables, Git, URLs or chat. Credentials must come through the approved broker authorization process.
3. Only the explicitly bound TradeMirror owner can use the configured broker session. All other users fail before any broker request. This is an owner pilot, not a shared multi-user credential store or OAuth rollout.
4. Open Settings → Broker connections; preview current-day executions. Verify account/history ownership and timestamps before confirming save.
5. Saving re-fetches broker data and compares the complete supported-execution fingerprint. Changed previews must be refreshed. Valid data uses the existing atomic import RPC: repeated executions deduplicate and conflicts reject the transaction.
6. Confirm real saved counts/history, repeat sync, denied owner, expired token and rate-limit behavior. Renew expired daily sessions through the approved operator setup; do not collect passwords or OTPs in TradeMirror.

## Still deferred

Live authorization and production receipt require owner developer access/configuration. Multi-user OAuth with encrypted token storage, unattended background jobs, historical broker data access and final-charge refresh are separate work. No token refresh loop, new database grants or paid API is enabled automatically. Clearing/unsetting the enable flag disables the pilot without changing execution history.
