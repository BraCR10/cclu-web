# Architecture

How code is grouped in the web client, per SAD v1.0, section 4.3.2. Where this
document and the SAD disagree, the SAD wins.

## Grouping

Code is grouped by functional module, not by technical type. There is no
top-level `components/` folder holding every component in the system.

```
src/
  app/        Routing only. Next.js App Router
  modules/    One folder per functional module
  shared/     Used by two or more modules
```

| Module folder         | Module in the ERS     |
| --------------------- | --------------------- |
| `modules/members`     | Gestión de Agremiados |
| `modules/marketplace` | Marketplace           |
| `modules/jobs`        | Bolsa de Empleo       |
| `modules/admin`       | Panel Administrativo  |

Folder names are English, like every other identifier. The ERS names stay beside
them here because that is what a reader will be holding when they come looking.

## What goes where

| Folder                         | Holds                                            |
| ------------------------------ | ------------------------------------------------ |
| `app/`                         | Route segments, layouts, pages. Composition only |
| `modules/<module>/components/` | Components belonging to that module              |
| `shared/components/`           | Components used by two or more modules           |

A module folder starts with `components/` only. Add `services/`, `hooks/` or
`types/` to a module when that module actually needs them. Creating empty
folders in advance documents nothing and ages badly.

`app/` composes; it does not implement. A page imports from its module and
arranges the result. Business-shaped logic does not live in a route file.

## Promotion to shared

A component moves to `shared/` when a **second** module imports it. Not when it
looks reusable, not when someone expects reuse later.

Premature promotion produces a shared component shaped around one caller, and
the second caller then bends it out of shape. Waiting for the second use is
what tells you which parts are genuinely common.

## Module boundaries

A module never imports from another module's folder. If two modules need the
same thing, it belongs in `shared/`.

This mirrors the rule the API applies to its services: a dependency between two
modules is a design decision, not an import statement.

## Session

The session is a cookie the API sets and the browser returns on its own. No
script here can read it, which is the point: a cross-site scripting flaw cannot
carry it away. It also means this client cannot tell who it is by looking, so it
asks, and the answer comes from a token the API verified rather than one the
browser decoded for itself.

| Piece               | Answers                                         |
| ------------------- | ----------------------------------------------- |
| `requestApi`        | Sends the cookie and reports a refusal          |
| `useSession`        | Loading, signed in as whom, or nobody           |
| `useRequireSession` | Sends an expired session to sign in             |
| `RequireRole`       | Shows a part of a screen to the roles it serves |

`requestApi` sets `credentials: 'include'` because the API answers from another
origin and the browser withholds cookies across origins unless asked.

`useSession` reads the identity once, when the application loads. Signing out is
a request rather than a local delete, since the cookie belongs to the server and
nothing here can reach it.

**`RequireRole` hides; it does not protect.** Anyone can call the API directly,
so who may do what is the server's answer and only the server's. What this buys
is a person not being shown a door that will not open for them.

## Data access

This client reaches `cclu-api` over HTTP and by no other means. It holds no
database driver and no direct connection, and it never will. The API owns every
business rule; this repository renders what the API returns and collects what
the user submits.

The API base URL comes from `NEXT_PUBLIC_API_URL`. See [setup.md](setup.md).
