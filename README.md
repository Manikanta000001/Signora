# Authenticator API

A Django REST API for developer accounts, application API keys, and end-user
authentication by email OTP, Google OAuth, or GitHub OAuth.

## Run locally

Create a virtual environment, install dependencies, configure the local `.env`
file, then run migrations and start the server:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## API workflow

1. `POST /api/v1/accounts/signup/` with `username`, `email`, and `password`.
2. `POST /api/v1/accounts/login/` to receive a JWT access token.
3. With `Authorization: Bearer <access-token>`, create an application at
   `POST /api/v1/applications/`.
4. Create a client key at
   `POST /api/v1/applications/<application-id>/api-keys/`. The complete key is
   returned only in this response; store it securely.
5. Call `POST /api/v1/auth/otp/send/` with `X-API-Key: <client-key>` and an
   email (optionally a name). This creates the end user if necessary and sends
   their six-digit code by email.
6. Call `POST /api/v1/auth/otp/verify/` using the same `X-API-Key`, email, and
   `otp` to verify the sign-in. The response contains separate end-user access
   and refresh tokens; they are not developer JWTs.

Authenticated developer endpoints also support listing, retrieving, updating,
and deleting applications; listing application keys; and revoking a key with
`DELETE /api/v1/applications/<application-id>/api-keys/<key-id>/`.

## Endpoint reference

Developer JWT endpoints:

- `POST /api/v1/accounts/signup/`
- `POST /api/v1/accounts/login/`
- `POST /api/v1/accounts/token/refresh/`

Developer-authenticated application endpoints:

- `GET`, `POST /api/v1/applications/`
- `GET`, `PATCH`, `DELETE /api/v1/applications/<application-id>/`
- `GET`, `POST /api/v1/applications/<application-id>/api-keys/`
- `DELETE /api/v1/applications/<application-id>/api-keys/<key-id>/`

Application-key endpoints:

- `POST /api/v1/auth/otp/send/`
- `POST /api/v1/auth/otp/verify/`
- `GET /api/v1/auth/oauth/google/start/`
- `GET /api/v1/auth/oauth/github/start/`

OAuth callbacks are `GET /api/v1/auth/oauth/<provider>/callback/`. The start
endpoint requires `X-API-Key`; it returns the provider authorization URL. The
callback validates a signed, single-use OAuth state and returns the same
end-user token result as OTP verification. Configure the provider credentials
and registered callback URL before using OAuth.

`POST /api/v1/auth/token/refresh/` refreshes an end-user refresh token.

Example OTP request:

```bash
curl -X POST http://localhost:8000/api/v1/auth/otp/send/ \
  -H 'Content-Type: application/json' -H 'X-API-Key: ak_test_...' \
  -d '{"email":"alex@example.com","name":"Alex"}'
```

Example verification response:

```json
{
  "success": true,
  "user": {"id": "…", "email": "alex@example.com", "name": "Alex"},
  "tokens": {"access": "…", "refresh": "…", "token_type": "Bearer"}
}
```

## Security notes

Only SHA-256 hashes and prefixes of API keys are persisted. A raw key is shown
only by its create response. End users are unique per application, so the same
email in two applications creates two separate identities. OTPs are hashed,
six digits, expire, have a five-attempt limit, are one-time-use, and are
resend-throttled. Authentication activity is retained per application.

## Checks

```bash
python manage.py check
python manage.py test
```
