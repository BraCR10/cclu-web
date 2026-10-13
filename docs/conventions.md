# Conventions

Rules that apply to every change in this repository. They are stable: if a rule
here needs to change, change it deliberately and tell the team.

## Language

| Item                          | Language |
| ----------------------------- | -------- |
| Code, identifiers, file names | English  |
| Comments                      | English  |
| Configuration examples        | English  |
| Documentation                 | English  |
| Commit messages               | English  |
| Content shown to end users    | Spanish  |

The interface is Spanish because the people using it are. Everything else is English, including
the parts that are easy to forget: route segments, type names, prop names, the
values sent to and received from the API, comments, and the explanations in
`.env.example`.

A comment is written for whoever maintains the code, and the code is English,
so the comment is too. Nothing in this repository checks comment language
automatically, so the review has to.

The domain term in code is `member`, not `agremiado`: `MemberCard`,
`memberCode`, `fetchMembers`. Spanish appears only in text a user reads, such as
"Agremiado" on a label. Module folder names follow the same rule.

A stored value is an identifier, not a sentence. Keeping `approved` in the
database rather than `aprobada` is what lets the interface say "Aprobada",
"Aprobado" or "En regla" without a data migration each time. This client
compares against and sends the identifier, never the Spanish label.

## Error messages

The API and the web split an error into what a program decides and what a person
reads.

The API answers every client error with the same shape:

```json
{
  "error": "ValidationError",
  "message": "Too long.",
  "code": "too_long",
  "field": "phone"
}
```

- `code` is stable, snake_case and in English. It is the only thing a client
  decides on. Adding an error means adding a code, never reusing a message.
- `field` names the input the error belongs to, when there is one.
- `message` is English and written for whoever reads the logs or calls the API by
  hand. It is never shown to a user and may change at any time.

The web keeps one catalog that turns each `code` into the Spanish sentence a
person reads. An error with a `field` appears under that input; one without it
appears in a toast. A code missing from the catalog, or any server error, shows
the generic message "Algo salió mal. Intentá de nuevo."

Emails are the one exception: the API writes them in Spanish, because they reach
a person without passing through the web.

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
- Subject line in the imperative mood: `add member lookup`, not `added`.

Commits made up to 15 September 2026 are written in Spanish. They stay that
way: the history is public and rewriting it costs more than the inconsistency.
Everything from that point on is English.

Branching and pull request rules are in [branching.md](branching.md).

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
- Never cite a requirement identifier. Write the reason itself.

A comment that explains a business constraint or a non-obvious external
limitation earns its place. Everything else is noise.

`// CA-ADM-003-03 requires this` tells a reader nothing they can act on. They
still do not know why, only that someone decided it, and checking costs them a
trip into a versioned PDF whose identifiers may since have moved. Write what the
rule is and the code explains itself:

```tsx
// An administrator can inactivate an account, so having been approved once
// is not enough to show the member area today.
```

Traceability belongs to the ticket, the pull request and `docs/`, which are
versioned alongside the requirements and read by people looking for exactly
that. Source files are read by people trying to change the code.

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

### Design tokens

`src/app/globals.css` maps the Foundations page of the prototype into Tailwind's
`@theme`. Tailwind's own palette, type scale, radii, shadows and breakpoints are
cleared, so only prototype values exist. A value missing from the theme is a
question for the prototype, not an arbitrary value such as `bg-[#123456]`.

| Figma group        | Token                     | Example utility                |
| ------------------ | ------------------------- | ------------------------------ |
| `action/*`         | `primary`, `on-primary`   | `bg-primary text-on-primary`   |
| `bg/*`             | `canvas`, `surface-*`     | `bg-surface`                   |
| `border/*`         | `line`, `line-subtle`     | `border-line`                  |
| `text/*`           | `fg`, `fg-muted`          | `text-fg-muted`                |
| `status/*`         | `success`, `danger-soft`  | `bg-danger-soft text-danger`   |
| `brand/*`          | `brand-union`             | `bg-brand-union`               |
| Plan badge colours | `plan-pro`, `plan-pro-fg` | `bg-plan-pro text-plan-pro-fg` |
| Text styles        | `text-heading-m`          | `font-display text-heading-m`  |
| Radius             | `rounded-md`              | `rounded-lg`                   |
| Effects            | `shadow-raised`           | `focus-visible:shadow-focus`   |

The Figma group prefix is dropped where it would repeat the utility, so
`text/muted` is `text-fg-muted` rather than `text-text-muted`.

Display, Heading and Metric styles are set in Red Hat Display, so they pair with
`font-display`; Body, Label and Caption use the default `font-sans`, Red Hat
Text. Both load through `next/font` in the root layout.

Spacing keeps Tailwind's 4 px step, which is the prototype's scale: `space/4`
is `p-4`, `space/0-5` is `p-0.5`.

### Responsive

The prototype draws every screen at 390 px (mobile) and 1440 px (desktop).
Styles are written mobile first: the unprefixed class is the 390 px design, and
prefixed classes add the desktop one.

| Breakpoint | From    | Use                                        |
| ---------- | ------- | ------------------------------------------ |
| none       | 0       | The mobile frame                           |
| `md`       | 768 px  | Two columns where the mobile frame has one |
| `lg`       | 1024 px | The desktop frame: sidebar, header, popups |
| `xl`       | 1440 px | The desktop frame's full width             |

Page content is capped at `max-w-page`, the 1280 px column of the desktop frame.
On mobile, anything a person taps is at least 44 px high and wide.
