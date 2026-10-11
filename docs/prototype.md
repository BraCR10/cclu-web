# Prototype

The accepted Figma prototype defines the product: screens, flows, UI copy and the business rules they imply.

- [Desktop prototype](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=30-2&starting-point-node-id=30%3A2)
- [Mobile prototype](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=81-557&starting-point-node-id=81%3A557)
- [Design canvas](https://www.figma.com/design/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=5-2)

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
both frames, not when the desktop one looks right. The code follows the
decisions below.

### Product decisions settled by the prototype

- Member types: Empresa, Asociación, Profesional independiente. Asociación provides the same data as Empresa.
- There is no "Sector"; members are classified by economic activity only.
- A password changes only through an emailed link, never with the current password in session.
- Only the account owner changes their email, and the change is confirmed by a link sent to the new address.
- There is no membership withdrawal. An expired paid plan drops to Gratuita.
- Moderation only inactivates a publication, and a reason is required. There is no permanent block.
- Administrator states: Activo, Invitación pendiente, Invitación expirada, Inactivo.
- Feedback appears in toasts; editing happens in popups or bottom sheets.
- No captions or sentence-style legends under titles.
