# Social Login Setup — Google

## Prerequisites

A Google Cloud Platform project with the **Cloud Identity-Aware Proxy (IAP) API** or simply the **OAuth consent screen** configured.

---

## Step 1 — Create OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name: `WC Baseline`
7. **Authorised redirect URIs** — add the callback endpoint:
    - `https://auth.barneyparker.com/api/v1/auth/google/callback`
19. Click **Create**

**Important:** Google OAuth does not support wildcard domains. The auth
service lives at the fixed domain `auth.barneyparker.com` — only that
exact URL needs to be registered. Ephemeral deployment URLs are handled
via the `redirect_uri` parameter (see flow below) and do **not** need to
be added to Google Cloud Console.

---

## Step 2 — Configure OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Choose **External** (or Internal if using Google Workspace)
3. Fill in:
    - App name: `WC Baseline`
    - User support email: your email
    - Developer contact info: your email
4. **Scopes**: add `openid`, `email`, `profile`
5. **Test users**: add your email while in testing mode
6. Publish the app when ready for production

---

## Step 3 — Store Secrets in GitHub

Add the following **repository secrets** in your GitHub repo settings
(`Settings → Secrets and variables → Actions → Repository secrets`):

| Secret                  | Value                         |
|-------------------------|-------------------------------|
| `GOOGLE_CLIENT_ID`      | The client ID from step 1     |
| `GOOGLE_CLIENT_SECRET`  | The client secret from step 1 |

(The RSA key pair for JWT signing is generated automatically by Terraform —
no manual secret is needed.)

---

## How It Works

The auth service runs at `auth.barneyparker.com` as a separate Terraform
stack. All environments (prod, staging, ephemeral) redirect to this
central auth service.

```
Browser                         auth API GW                Google         DynamoDB
  │                                 │                         │                 │
  │  /api/v1/auth/google/login?redirect_uri=https://...       │                 │
  │ ──────────────────────────────►                           │                 │
  │  ◄── 302 Redirect to Google   │                           │                 │
  │                                 │                         │                 │
  │  ──────────────────────────────────────────────────────►  │                 │
  │  User logs in on Google         │                         │                 │
  │  ◄──── Redirect with code ──────│─────────────────────────│                 │
  │                                 │                         │                 │
  │  /api/v1/auth/google/callback?code=...&state=...          │                 │
  │ ──────────────────────────────►                           │                 │
  │                                 │  POST /token (code → tokens)              │
  │                                 │ ────────────────────────►                 │
  │                                 │  ◄──── id_token ────────                  │
  │                                 │                         │                 │
  │                                 │  Query/Create user                       │
  │                                 │ ────────────────────────►                 │
  │                                 │                         │                 │
  │  ◄── 302 to {redirect_uri}/?code=ONETIME_UUID                 │                 │
  │                                 │                         │                 │
  │  Browser follows redirect, lands on app with ?code=...   │                 │
  │  Front-end calls POST /api/v1/auth/token { code }       │                 │
  │ ───────────────────────────────────────────────────────────────────────────►│
  │                                 │                         │                 │
  │  ◄──── { token: JWT } ────────│─────────────────────────│──────────────────│
  │                                 │                         │                 │
```

Key details:

- **`redirect_uri`** — passed by the frontend to `/login`. Encoded into
  the OAuth `state` parameter. The callback handler decodes it and
  redirects the browser back to the original environment's URL with a
  single-use one-time code in the query string.
- **`state`** — HMAC-SHA256-signed payload: `base64url(json) + "." + HMAC`.
  Prevents tampering with the embedded `redirect_uri`.
- The JWT is never in the URL. The callback stores it in a DynamoDB
  table under a random UUID (60 s TTL) and redirects with `?code=<uuid>`.
  The front-end exchanges the code for the JWT via
  `POST /api/v1/auth/token` and stores the result in `localStorage`.
  The token is then sent as `Authorization: Bearer <token>` on subsequent
  API calls.
- The auth API has CORS fully open (`Access-Control-Allow-Origin: *`) so
  any environment can call it.

---

## Protected Routes

Routes with the JWT authorizer require a valid JWT in the
`Authorization` header. API Gateway's built-in JWT authorizer fetches
the public key from `https://auth.barneyparker.com/.well-known/jwks.json`,
verifies the RS256 signature, and checks the `aud` and `iss` claims.
The verified `sub` claim is passed to the downstream handler via
`event.requestContext.authorizer.jwt.claims.sub`.

### Example: `GET /api/v1/auth/me`

```bash
curl -H "Authorization: Bearer <token>" https://auth.barneyparker.com/api/v1/auth/me
```

Response:

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@gmail.com",
  "name": "User Name",
  "created_at": "2026-05-25T12:00:00.000Z"
}
```

---

## Architecture Summary

| Component | Stack | Domain / Name |
|---|---|---|
| Auth API | `wc-auth` (separate repo) | `auth.barneyparker.com` |
| DynamoDB users table | `wc-auth` (separate repo) | `auth-users` |
| JWT signing keys | `wc-auth` (separate repo) | Generated by Terraform (`tls_private_key`) |
| Main app (S3 + CloudFront) | `infrastructure/` | `wcbase.barneyparker.com` (prod) |
| Auth Lambda functions | `functions/` | `auth-google`, `auth-me`, `jwks` |
| Function deploy CI | `.github/workflows/functions.yml` | Gracefully skips non-existent functions |
