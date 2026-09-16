# Setup

Start the web client from a clean clone.

## Requirements

| Requirement                      | How to check                        |
| -------------------------------- | ----------------------------------- |
| Node, version pinned in `.nvmrc` | `node --version`                    |
| `cclu-api` running and reachable | `curl http://localhost:4000/health` |

With `nvm` installed, `nvm use` reads `.nvmrc` and selects the right version.
The exact version lives in `.nvmrc` and `package.json`, never in this document.

This client renders what the API returns. It starts without the API, but every
screen that reads data will fail until the API answers. Start `cclu-api` first;
its own setup guide covers MongoDB Atlas access.

## Steps

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in the values:

| Variable              | Value                                                       |
| --------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of `cclu-api`. Defaults to `http://localhost:4000` |

`NEXT_PUBLIC_` variables are inlined into the browser bundle at build time and
are readable by anyone using the site. Never put a secret behind that prefix.

Then start it:

```bash
npm run dev
```

The client runs on port 3000. The API runs on 4000 so the two do not collide.
If you change either port, update `NEXT_PUBLIC_API_URL` to match.

## Verify

Open `http://localhost:3000`. The page renders and the browser console reports
no failed request to the API.

## Checks before pushing

```bash
npm run lint
npm run typecheck
npm run format:check
```

## Never commit

`.env` is ignored by git and this repository is public. A credential pushed
here is compromised the moment it lands, and deleting the file afterwards does
not undo it: rotate the credential instead.
