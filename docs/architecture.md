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

| Module folder         | Product area                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `modules/members`     | Member registration and its correction, profile, card                                        |
| `modules/plans`       | Plans, fees, the plan a member holds, payments, and the panel's membership and payment lists |
| `modules/auth`        | Signing in and out, and recovering a password                                                |
| `modules/marketplace` | Directory, products, promotions and discounts                                                |
| `modules/jobs`        | Job board                                                                                    |
| `modules/admin`       | Administration panel                                                                         |

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

## One form, two ways in

A registration and a correction are two screens over the same data. The applicant
sends their application, and a request for changes brings them back to a form that
opens with everything they wrote still in it. The way in differs — one is a
session, the other a token in a link — and so does what the screen shows: the
prototype draws the correction as its own card, with the groups `Cuenta`, `Tipo e
identificación`, `Tu negocio` and `Contacto` and nothing else.

So the screen is its own component, and what is shared is what must not drift:

- `validation/fieldRules.ts` holds the field name union and the rule primitives.
  Every form in the module checks its fields with those, so one form's rules
  cannot quietly differ from another's.
- `validation/correctionRules.ts` states which of those rules the correction
  screen answers to, and says nothing about the fields it does not show. The
  address, the password and the consents are changed by their own flows.
- `api/correction.ts` keeps the list of fields the screen may show, which is the
  same list the API refuses anything outside of. A field the form cannot show
  would be erased rather than corrected, so the two lists have to agree.

The registration keeps its own steps because the prototype draws them as three
pages with a stepper, and those steps read a contract rather than a whole wizard,
so a change to the wizard does not reach them.

## The home

`/member` answers three questions: what plan am I on and until when, is anything
waiting on me, and what am I publishing.

The first two are the plans module's data, so the screen lives in
`modules/plans/components/MemberHome.tsx` rather than in a module of its own. The
third has no API yet. The publications grid is drawn for paid plans and states
that nothing has been published, so the screen does not pretend to data the API
cannot give it. When publishing arrives, its component comes from its own module
and `app/member/page.tsx` composes the two.

A rejected payment is shown as pending, not as history: it is the one payment
state the member can still act on, so the home opens its detail in place and
offers to send it again with the same plan.

## The card

`/member/card` draws the card the member shows in their shop. `Descargar` prints
it: a print sheet in `globals.css` leaves nothing but the card, the browser
offers to save it as a PDF, and the QR survives as vector. An image file would
need a rasteriser, and the card's job is to be printed and put up in a shop.

The QR carries the absolute address of the public profile, which only the
browser knows. The server therefore draws the card with a gap where the code
goes and `useSyncExternalStore` fills it in, because a QR holding a relative
address is useless once printed.

This is the one screen where the plan is drawn rather than named: each plan
tints the card, which is part of what the chamber sells, so the plan token
reaches the card's wave as well as its badge.

## The profile is three screens

`/member/profile` is what the chamber knows, `/member/profile/branches` the
places it affiliates and `/member/profile/store` the shop a client meets. They
are separate routes rather than one long form, because each one is saved on its
own and each one is a page in the prototype. `ProfileTabs` is the only thing
they share.

A branch is edited one at a time in a popup that sends the whole branch: the API
takes the three required fields on a new one and only the ones present on an
edit. Closing the last branch is not offered, because the API refuses it — a
member always keeps one place to be found at.

The shop sends the week whole, the same way. A day left out is a day the API
stores as closed, so the screen never has to guess whether an absent pair of
hours means "not set" or "never open".

## Data access

This client reaches `cclu-api` over HTTP and by no other means. It holds no
database driver and no direct connection, and it never will. The API owns every
business rule; this repository renders what the API returns and collects what
the user submits.

The API base URL comes from `NEXT_PUBLIC_API_URL`. See [setup.md](setup.md).
