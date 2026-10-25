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

## The directory

`/directory` is the chamber's public roll, in `modules/marketplace`. It is
built from the same parts as a panel list, `usePagedList`, `FilterSheet` and
`PagedList`, with a grid of cards on a desktop instead of a table.

The district filter offers what `GET /api/directory/districts` answers for the
chosen canton, because a district is typed at registration rather than picked
from a catalog. Choosing another canton clears the district, which belonged to
the first one. There is no filter by plan; a paid plan only shows as a badge.

`/directory/[memberCode]` is one business's public page, the address its card's
QR carries, so the path never changes. A branch shows its own hours when it
wrote them and the shop's week otherwise, with neighbouring days that keep the
same hours joined into one line. Numbers are dialled and opened in WhatsApp
from their digits, so a member who wrote +506 or dashes still gets a working
link. The publications section says it is under construction until it exists.

## Notifications

The bell in the panel header shows the newest notices and how many are unread,
for members and administrators alike: `PanelNavigation` says whose panel it is
(`audience`) and where the full list lives (`notificationsHref`). On a desktop
the bell opens the newest five in place; on a telephone it opens the page.

The API names what happened (`payment_submitted`) and the values involved, and
`useNotificationText` writes the sentence and picks the screen it leads to. The
same event reads differently to the member it is about and to the panel, and a
type this client does not know is left out rather than shown blank. The count
refreshes every minute and on opening, and a refresh that fails keeps what is
on screen: the bell is a hint, the page is the record.

## Vacancies

`/member/vacancies` lists the member's vacancies, in `modules/jobs`. Whether
the plan allows publishing comes with the list (`canPublish`), so a member on
Gratuita sees what unlocks it instead of a form the API would refuse.
`/member/vacancies/new` previews the vacancy with `VacancyCard`, the card the
job board shows, so the member sees what a visitor will. Deleting asks first.

`/jobs` is the public job board and `/jobs/[vacancyId]` one vacancy. The board
filters by canton, district and workday with the same `FilterSheet` as the
directory, and the district list comes from `useDistricts` in `shared`. The
requirements are written one per line or separated by periods, and the detail
reads them back as a list either way. A vacancy that left the board says it is
no longer available.

## Joining the panel

An administrator arrives through an invitation, so the link in that email opens
`/invitation/[token]`, a public page in `modules/auth`. It sits outside `/admin`
on purpose: the panel's layout turns away anybody without a session, and the
person holding the link has none.

The page asks about the link before it draws anything, because a form that
offered the fields first would collect a password for a link already spent. A
valid one shows the address fixed with the lock, the rules the API enforces under
the field, and the day the invitation stops working; a spent one says so and
leads to the sign-in screen.

Accepting sets the password and then signs the new administrator in through the
same `signIn` the login form uses, and opens `/admin`. If that second call fails
the person lands on `/login` with the password they just chose, rather than on a
dead screen: a working password is never thrown away because the entry failed.

## Administrators

`/admin/administrators` (A-13) is the list the panel uses to grow itself: who can
enter, and in what state their account is. `useAdministrators` reads the directory
once, and every write answers with the row the API now holds rather than a guess
from the body, so the screen and the database cannot drift. Each write confirms
with a toast; a refusal that names a field lands under that field in the
invitation form.

Two rules are the API's, and the screen only echoes them. An invitation past its
day reads as `invitation_expired` from its date, not from a stored state. And
nobody can inactivate themselves — that one is not offered at all: your own row
says _"Tu cuenta"_ where the switch would be, so the rule is said before the
click rather than after it.

## The administration summary

`/admin` opens on the day: the figures, each leading to the screen that lists
it, what is waiting for review, the memberships expiring within the chamber's
notice, the members by plan and the latest of the administrator's own notices.
It lives in `modules/admin` and reads `GET /api/admin/summary` once on arrival.
Every figure is a number from the API and every card is a link: the publications
figure counts what the marketplace is showing and leads to moderation, which is
where the panel works on them.

## Panel lists

Every list in the panel is put together from the same parts, so the payments,
the memberships and every list after them search, filter, page and fail in the
same way.

| Part                                  | What it decides                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `usePagedList` in `shared/hooks/`     | The query: filters, a search that waits for a pause, the page, and reload           |
| `ChipGroup`                           | One state among a few, such as Por revisar, Aprobados, Rechazados                   |
| `SearchField`                         | The search input                                                                    |
| `FilterSheet`                         | Further filters: inline on a desktop, a sheet that applies on demand on a telephone |
| `PagedList`                           | The failure, the first load, the empty state and the pages around the rows          |
| `DataList`, `NameCell` and `ListCard` | The rows: a table on a desktop, cards on a telephone                                |
| `ReasonDialog`                        | An action the affected person must be given a reason for                            |

The memberships screen adds one thing: its three figures are also its views —
Activas, Próximas a vencer and Vencidas — so choosing one asks the API for that
view, and the last column follows it, saying Vence on the plans in force and
Venció on the ones that ran out. A view is never a filter the rows apply for
themselves: the list is read whole from the server, counts included, so no
figure can disagree with the rows under it.

A screen keeps only what is its own: the reader of its endpoint, its columns, its
card line and its messages. `read` is passed to `usePagedList` from outside the
component, so the same function arrives on every render and the list is not
read again for nothing.

On a card the badges sit on their own line under the name, never beside it, so
a long business name is not cut to make room for a state.

## Data access

This client reaches `cclu-api` over HTTP and by no other means. It holds no
database driver and no direct connection, and it never will. The API owns every
business rule; this repository renders what the API returns and collects what
the user submits.

The API base URL comes from `NEXT_PUBLIC_API_URL`. See [setup.md](setup.md).
