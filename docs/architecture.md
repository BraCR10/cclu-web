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

| Module folder          | Module in the ERS     |
| ---------------------- | --------------------- |
| `modules/agremiados`   | Gestión de Agremiados |
| `modules/marketplace`  | Marketplace           |
| `modules/bolsa-empleo` | Bolsa de Empleo       |
| `modules/panel`        | Panel Administrativo  |

Module folder names keep their domain term in Spanish. An `agremiado` is an
`agremiado`; translating it loses the meaning the ERS gave it.

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

## Data access

This client reaches `cclu-api` over HTTP and by no other means. It holds no
database driver and no direct connection, and it never will. The API owns every
business rule; this repository renders what the API returns and collects what
the user submits.

The API base URL comes from `NEXT_PUBLIC_API_URL`. See [setup.md](setup.md).
