# Architecture

How code is grouped in the web client.

## Grouping

Code is grouped by functional module, not by technical type. There is no
top-level `components/` folder holding every component in the system.

```
src/
  app/        Routing only. Next.js App Router
  i18n/       Locale configuration and message files
  modules/    One folder per functional module
  shared/     Used by two or more modules
```

| Module folder         | Product area                                  |
| --------------------- | --------------------------------------------- |
| `modules/members`     | Member registration, profile, card, payments  |
| `modules/marketplace` | Directory, products, promotions and discounts |
| `modules/jobs`        | Job board                                     |
| `modules/admin`       | Administration panel                          |

Module folder names are English, like every other identifier.

## What goes where

| Folder                         | Holds                                            |
| ------------------------------ | ------------------------------------------------ |
| `app/`                         | Route segments, layouts, pages. Composition only |
| `modules/<module>/components/` | Components belonging to that module              |
| `shared/components/`           | Components used by two or more modules           |
| `shared/api/`                  | The API client and the error it throws           |
| `shared/errors/`               | Deciding how an API error is shown               |
| `shared/hooks/`                | Hooks two or more components share               |
| `shared/layouts/`              | The public, member and admin shells              |
| `shared/utils/`                | Small pure helpers with no React or API concern  |
| `i18n/`                        | `next-intl` configuration and the message files  |

A module folder starts with `components/` only. Add `services/`, `hooks/` or
`types/` to a module when that module actually needs them. Creating empty
folders in advance documents nothing and ages badly.

`app/` has one folder per area, each with its layout: `(public)/`, which adds
no segment to the URL, `member/` and `admin/`. Each area also has a catch-all
route that shows "En construcción" for pages not built yet; a real page added
beside it takes precedence.

`app/` composes; it does not implement. A page imports from its module and
arranges the result. Business-shaped logic does not live in a route file.

## Promotion to shared

A component moves to `shared/` when a **second** module imports it. Not when it
looks reusable, not when someone expects reuse later.

Premature promotion produces a shared component shaped around one caller, and
the second caller then bends it out of shape.

The components on the prototype's Components page are the exception. They are
the design system every module draws from, so they start in
`shared/components/`. Waiting for the second use is
what tells you which parts are genuinely common.

## Module boundaries

A module never imports from another module's folder. If two modules need the
same thing, it belongs in `shared/`.

This mirrors the rule the API applies to its services: a dependency between two
modules is a design decision, not an import statement.

## Data access

This client reaches `cclu-api` over HTTP and by no other means. It holds no
database driver and no direct connection, and it never will. The API owns every
business rule; this repository renders what the API returns and collects what
the user submits.

The API base URL comes from `NEXT_PUBLIC_API_URL`. See [setup.md](setup.md).
