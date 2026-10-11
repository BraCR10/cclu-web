# Prototype

The accepted Figma prototype is the source of truth for screens, flows and UI
copy. Where it differs from the ERS, the prototype wins: it is the later, agreed
version of the same decisions.

| View         | Link                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop demo | [Open](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=30-2&starting-point-node-id=30%3A2)     |
| Mobile demo  | [Open](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=81-557&starting-point-node-id=81%3A557) |
| Canvas       | [Open](https://www.figma.com/design/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=5-2)                                   |

## Pages

| Page              | Holds                                   |
| ----------------- | --------------------------------------- |
| Foundations       | Design tokens                           |
| Components        | The shared components every screen uses |
| Prototipo laptop  | Desktop screens and flows               |
| Prototipo celular | Mobile screens and flows                |

## Screen codes

Every frame carries a code that names its audience and number.

| Audience | Desktop | Mobile  |
| -------- | ------- | ------- |
| Public   | `P-xx`  | `PM-xx` |
| Member   | `M-xx`  | `MM-xx` |
| Admin    | `A-xx`  | `AM-xx` |

A screen and its mobile twin share the number: `M-04` on desktop is `MM-04` on
mobile.

Overlays (popups, sheets and toasts) live in the "Superposiciones" sections of
the prototype pages, not inside the screen that opens them.

## Workflow

Before building a screen, open its frame and match the tokens and components it
uses. Desktop and mobile are both normative: a screen is done when it matches
both frames, not when the desktop one looks right.

## Product decisions

The prototype settled these. The code follows them, even where the ERS says
otherwise.

- There is no "Sector" field.
- There are three member types: Empresa, Asociación and Profesional
  independiente.
- A password changes only through a link sent by email.
- Only the account owner can change an email address, and the change is
  confirmed by a link sent to it.
- A membership cannot be withdrawn. When a paid plan expires, the member drops
  to Gratuita.
- Moderation only inactivates, and always records a reason.
- An administrator is Activo, Invitación pendiente, Invitación expirada or
  Inactivo.
- Action feedback appears as toasts. Editing happens in popups or sheets.
- Titles carry no caption underneath.
