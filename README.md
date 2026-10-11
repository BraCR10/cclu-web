# cclu-web

## About the project

The Cámara de Comercio y Empresarios de La Unión manages its affiliated
businesses through spreadsheets and informal channels. This system replaces
that with a web platform: it centralises member records, gives traceability to
membership fees, and offers affiliated businesses a digital channel for
commercial visibility and job postings.

Built as the term project for IC-7841, Proyecto de Ingeniería de Software,
Escuela de Computación, Instituto Tecnológico de Costa Rica.

## This repository

`cclu-web` is the web client. It renders what the API returns and collects what
the user submits. It runs on Next.js with React and TypeScript, styled with
Tailwind.

It holds no business rules and no database access. Everything it shows comes
from `cclu-api` over HTTP.

## Documentation

| Document                             | Contents                                          |
| ------------------------------------ | ------------------------------------------------- |
| [Setup](docs/setup.md)               | Run the client from a clean clone                 |
| [Architecture](docs/architecture.md) | Module grouping, shared components, boundaries    |
| [Conventions](docs/conventions.md)   | Versioning, code style, comments, components      |
| [Branching](docs/branching.md)       | Branch roles, naming, and the pull request cycle  |
| [Testing](docs/testing.md)           | What carries unit tests, and how they are written |
| [Prototype](docs/prototype.md)       | Figma pages, screen codes, settled decisions      |

The requirement and architecture documents (ERS and SAD) are the source of
truth for what this system does. They are not published here; ask the project
lead for a copy.

## Prototype

The accepted Figma prototype defines the product: screens, flows, UI copy and the business rules they imply.

- [Desktop prototype](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=30-2&starting-point-node-id=30%3A2)
- [Mobile prototype](https://www.figma.com/proto/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=81-557&starting-point-node-id=81%3A557)
- [Design canvas](https://www.figma.com/design/YPsVPnxVtPDJZxj2Q2NtS5/CCLU-%E2%80%94-Prototipo-de-plataforma?node-id=5-2)

See [docs/prototype.md](docs/prototype.md) for how the file is organized and how to build a screen from it.

## Repositories

| Repository | Role                        |
| ---------- | --------------------------- |
| `cclu-web` | This repository. Web client |
| `cclu-api` | REST API and business rules |
