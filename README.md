# EZ Novel

EZ Novel is a browser-based writing workspace for drafting and organizing novels across books, chapters, characters, locations, and plot points.

## Current Highlights

- Rich text chapter editor with autosave.
- Multi-book workspace with fast switching.
- Book cards are click-to-activate.
- Book cards support rename and guarded delete:
  - Red `Delete` button on each card.
  - Confirmation requires typing `DELETE` (all caps).
  - Shows deletion summary (chapters, words, characters, locations, plot points) before removal.
- Header includes a `Home` button linking to `https://blahpunk.com`.
- Export panel for manuscript PDF output.
- OAuth-based authentication flow.

## Project Structure

```text
ez_novel/
  client/   # React frontend
  server/   # Node/Express API
  screenshots/
```

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
# from repo root
cd server && npm install
cd ../client && npm install
```

### Run

```bash
# terminal 1
cd server
npm start

# terminal 2
cd client
npm start
```

Default ports:

- API: `7385`
- Client/dev: `7692` (or CRA-assigned local dev port)

## Deployment Notes (punknet)

Typical frontend deploy flow:

```bash
cd /opt/ez_novel/client
npm run build
pm2 restart ez-novel --update-env
```

API process:

```bash
pm2 restart ez-novel-api --update-env
```

## Security Notes

- API auth now verifies both `user` and `user_sig` cookies via HMAC (`SECURE_AUTH_SECRET`).
- Novel data files are encrypted at rest with AES-256-GCM (`DATA_ENCRYPTION_KEY`).
- API CORS is allowlisted with `ALLOWED_ORIGINS`.

Required server env vars:

- `SECURE_AUTH_SECRET`: must match the OAuth signer secret used by `secure.blahpunk.com`.
- `DATA_ENCRYPTION_KEY`: encryption key material for at-rest data (falls back to `SECURE_AUTH_SECRET` if omitted).
- `ALLOWED_ORIGINS`: comma-separated frontend origins allowed to call the API.

Important limitation:

- Google login without a separate user-held secret is not true zero-knowledge encryption. It protects against database/file leaks and cookie forgery, but a full server operator can still decrypt.

## License

MIT
