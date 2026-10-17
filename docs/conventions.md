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

### Error contract

`cclu-api/src/config/errorCodes.json` is the registry: the only codes the API
answers with. A test in the API fails when the source writes a code that is not
in it.

| Status | `code`                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 4xx    | A registered code, or `invalid_request` when the failure came from outside the application, such as a body that is not JSON |
| 5xx    | Always `internal_error`, with a generic `message` and no `field`                                                            |

- The API raises a client error with `ApplicationError`, from
  `cclu-api/src/config/errorCodes.js`: a code, a message and, when needed, a
  status (400 by default), a `field` and a `reason`. Every client error is one,
  and none is built by setting `statusCode` by hand. A server failure needs no
  code, since the answer is `internal_error` whatever caused it.
- `reason` refines a code when a screen needs the detail, such as the state an
  already decided application is in.
- `cclu-web` keeps a copy of the registry in `tests/fixtures/apiErrorCodes.json`.
  Its contract test fails when a code in that copy has no sentence in the
  `errors` messages.

Adding a code takes three edits: the registry, the copy in `cclu-web` (run
`npm run sync:error-codes` there with both repositories cloned side by side),
and the sentence in the `errors` messages.

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

## Shared components

Every screen is built from `src/shared/components`, which mirrors the
Components page of the prototype. Reach for these before writing markup; a
screen that needs a variant they lack adds it here, not in the module.

| Need                                      | Component                                                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| An action                                 | `Button`: `primary` once per view, `secondary` beside it, `ghost` for low emphasis, `danger` for what cannot be undone, `success` to approve |
| Text, a long text, one choice from a list | `Input`, `Textarea`, `Select`                                                                                                                |
| A yes or no in a form                     | `Checkbox`                                                                                                                                   |
| A setting that applies at once            | `Switch`                                                                                                                                     |
| One option among a few, all visible       | `Radio` inside a `RadioGroup`                                                                                                                |
| The state of a record                     | `StatusBadge`, with the state always written                                                                                                 |
| A message that stays on the page          | `Alert`                                                                                                                                      |
| Feedback after an action                  | A toast, through `useToast`                                                                                                                  |
| A grouped block of content                | `Card`                                                                                                                                       |
| A person or business                      | `Avatar`, image or initials                                                                                                                  |
| Sections of one page                      | `Tabs`, the underline style                                                                                                                  |
| A long list                               | `Pagination`                                                                                                                                 |
| A confirmation, a reason, a short form    | `Modal`                                                                                                                                      |

`Modal` is a popup from `lg` up and a bottom sheet below it, which is what the
two prototype frames draw. Use `Dialog` or `BottomSheet` directly only when a
screen is drawn one way on both.

Every component carries its own accessibility, and a screen must not undo it:

- A field is named by its `label`; its help or error is its description.
- Focus is always visible, through `shadow-focus`.
- Everything works from the keyboard: tabs move with the arrow keys, modals
  trap focus and close with Escape, focus returns to what opened them.
- On mobile, anything a person taps is at least 44 px.

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

Each area has one shell, in `src/shared/layouts/`, and a page never draws its
own navigation:

| Shell         | Routes      | Desktop (`lg` up)             | Mobile                          |
| ------------- | ----------- | ----------------------------- | ------------------------------- |
| `PublicShell` | `(public)/` | Header with the sections      | Header, bottom nav and "Más"    |
| `MemberShell` | `member/`   | Sidebar and panel header      | Panel header, bottom nav, "Más" |
| `AdminShell`  | `admin/`    | Grouped sidebar, panel header | Panel header, bottom nav, "Más" |

"Más" opens a bottom sheet with the sections the bottom nav has no room for.
The avatar in a panel header opens the short profile menu. A route that is not
built yet renders `UnderConstruction`, so every link in a shell leads
somewhere. The navigation lists live beside the shells, in
`memberNavigation.ts`, `adminNavigation.ts` and `publicNavigation.ts`.

## Text and translations

Every sentence a person reads comes from `next-intl`, never from the markup.
The `react/jsx-no-literals` lint rule fails on text written inside JSX.

Spanish is the only language, so the locale is fixed and never appears in the
URL. Messages live in `src/i18n/messages/es/`, one file per namespace:

| Namespace      | Holds                                          |
| -------------- | ---------------------------------------------- |
| `common`       | Text more than one area shares                 |
| `errors`       | One sentence per API error code, and `generic` |
| `public`       | Public site                                    |
| `member`       | Member panel                                   |
| `admin`        | Administration panel                           |
| `auth`         | Signing in and out, and recovering a password  |
| `registration` | The registration steps and the sent screen     |
| `correction`   | The correction screen a link opens             |
| `plans`        | Plan cards, comparison and how to pay          |

A new namespace is a new file there and a line in `src/i18n/messages.ts`.

Keys are English `camelCase`, grouped by the screen or component that shows
them: `member.profile.saveButton`, `common.underConstruction.title`. The
exception is `errors`, whose keys are the API codes themselves, in snake_case.
The copy follows the prototype, including its voseo.

## Dates

The API works in one time, UTC. The screen shows every date on the clock of
whoever is looking, so a member in China reads Chinese time.

**Where the zone comes from.** On its first load the browser names its zone and
`TimeZoneSync` keeps it in the `cclu_time_zone` cookie, then renders the page
again. From then on `src/i18n/request.ts` hands that zone to `next-intl`, so the
server and the browser format every date the same way. Until the cookie exists,
and for any value the runtime does not know as a zone, the chamber's
`America/Costa_Rica` is used. The cookie is checked against the known zones
before it reaches a formatter, because a browser writes it.

**How a component shows a date.** Always through the `useDates` hook in
`src/shared/hooks/`, with the formats named once in `src/i18n/formats.ts`:

| The API sends           | Looks like                 | Shown with                    |
| ----------------------- | -------------------------- | ----------------------------- |
| An instant              | `2026-10-17T21:40:00Z`     | `dates.instant(value, style)` |
| The instant a term ends | `2026-11-18T06:00:00Z`     | `dates.termEnd(value)`        |
| A day a person typed    | `2026-10-05T00:00:00.000Z` | `dates.calendarDay(day)`      |

| Style    | Reads                   |
| -------- | ----------------------- |
| `date`   | 17 de octubre de 2026   |
| `short`  | 17 oct 2026             |
| `moment` | 17 oct 2026, 3:40 p. m. |

**When a term ends.** A plan valid through 17 November ends at midnight opening
the 18th in Costa Rica, one instant everywhere. `termEnd` shows the last day
covered where that instant is the viewer's own midnight, and the local date and
time anywhere else, because a day alone would be wrong there:

| Viewer      | Reads                                     |
| ----------- | ----------------------------------------- |
| Costa Rica  | Vigente hasta el 17 de noviembre de 2026  |
| Los Angeles | Vigente hasta el 17 nov 2026, 10:00 p. m. |
| Beijing     | Vigente hasta el 18 nov 2026, 2:00 p. m.  |

**A day a person typed has no time.** The certification's issue date is stored
as midnight UTC of that day. Show its first ten characters with
`dates.calendarDay(value.slice(0, 10))`; converted between zones as an instant,
it would read as the day before in the Americas.

A lint rule refuses `new Intl.DateTimeFormat` and `toLocaleDateString` with
arguments in `src/`, because either one bypasses the configured zone and
formats. Access is never decided by a date in the browser: the API works it out
against its own clock, whatever the screen shows.

## Showing an error

`requestApi` in `src/shared/api/apiClient.ts` is the only way to call the API.
A failed call throws an `ApiError` carrying the status and the API's `code`,
`field` and `reason`. A body that is not the API shape becomes
`internal_error`, and an API that cannot be reached becomes `network_error`.

`useErrorPresenter` in `src/shared/errors/` turns any thrown value into what to
show, following the error contract above:

| Error                               | Shown                               |
| ----------------------------------- | ----------------------------------- |
| Carries a `field`                   | Under that input                    |
| No `field`                          | In a toast                          |
| Code not in `errors`, or status 5xx | "Algo salió mal. Intentá de nuevo." |

A screen never chooses the sentence or the placement itself. The rule lives in
`decideErrorDisplay`, which is tested on its own.
