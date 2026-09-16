# Conventions

Rules that apply to every change in this repository. They are stable: if a rule
here needs to change, change it deliberately and tell the team.

## Language

| Item                          | Language |
| ----------------------------- | -------- |
| Code, identifiers, file names | English  |
| Documentation                 | English  |
| Commit messages               | Spanish  |
| Content shown to end users    | Spanish  |

The source requirement documents (ERS, SAD) are in Spanish. Translating a
domain term is the exception, not the rule: an `agremiado` is an `agremiado`,
not a `member`.

## Versioning

Commits follow [Conventional Commits](https://www.conventionalcommits.org).

```
<type>(<scope>): <subject in imperative mood>
```

| Type       | Use for                                           |
| ---------- | ------------------------------------------------- |
| `feat`     | New behaviour visible to a user or another system |
| `fix`      | Corrected behaviour                               |
| `refactor` | Restructuring with no behavioural change          |
| `docs`     | Documentation only                                |
| `test`     | Tests only                                        |
| `chore`    | Tooling, dependencies, configuration              |

Rules:

- One commit is one reviewable unit of work. Tests and documentation ship with
  the code they describe, not in a follow-up commit.
- Never commit generated credentials, `.env` files, co-author trailers, or AI
  attribution lines.
- Subject line in the imperative mood: `agrega busqueda de agremiado`, not
  `agregado`.

Branching and pull request rules are defined by CCLU-116 and will be added here
once that ticket lands.

## Self-explaining code

The name is the documentation. If a reader needs a comment to know what a
function does, the name failed.

| Rule                 | Detail                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Naming               | `camelCase` for variables and functions, `PascalCase` for classes and types                               |
| No abbreviations     | `request`, not `req`. `database`, not `db`. The exception is an established acronym such as `id` or `url` |
| Single purpose       | A function does one thing. If the name needs an `and`, split it                                           |
| Short functions      | If a function does not fit on one screen, it is doing too much                                            |
| Explicit over clever | A reader should never have to decode an expression                                                        |

## Comments

Write a comment only when the code cannot express the reason behind it.

- Explain the **why**, never the **what**. The code already states the what.
- Atomic: one idea per comment, two lines at most.
- Never leave commented-out code. Git remembers it; the file should not.
- Never restate a signature, a type, or an obvious assignment.

A comment that explains a business constraint or a non-obvious external
limitation earns its place. Everything else is noise.

## Separation of responsibilities

Code is grouped by functional module. A module never imports from another
module's folder, and a route file composes rather than implements.

The full rules, including when a component is promoted to `shared/`, are in
[architecture.md](architecture.md).

## Components

| Rule                   | Detail                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- |
| Naming                 | `PascalCase` for components and their files                                     |
| One component per file | The file name and the component name match                                      |
| Server by default      | Add `'use client'` only when the component needs state, effects or browser APIs |
| No business rules      | A component renders and collects input. Decisions belong to the API             |
| Typed props            | Every component declares its props. `any` is not a type                         |

A component that fetches, decides and renders is three components wearing one
name. Split it.

## Styling

Tailwind utility classes, applied in the component that owns the markup. No
parallel stylesheet describing the same element twice.

`globals.css` holds design tokens and resets only, never component styling.
