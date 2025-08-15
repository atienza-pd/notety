# Notety — Simple Notes

Notety is a minimal notes app built with Angular. It lets you quickly add and remove short notes in-memory (no backend). The Notes feature is the landing page of the app.

## Features

- Add notes via input + Enter or Add button
- Remove notes with a single click
- Accessible controls (aria-labels)
- Modern Angular patterns (standalone components, signals, new control flow)

## How it works

The Notes component keeps an in-memory list of notes and exposes:

- `addNote(text: string)` to append a note
- `removeNote(index: number)` to delete a note
- `title()` and `notes()` signals for reactive rendering

Key files:

- `src/app/features/notes/notes.component.ts`
- `src/app/features/notes/notes.component.html`
- `src/app/features/notes/notes.component.css`

Routing:

- `/` redirects to `/notes`
- `/notes` renders the Notes component

## Getting started

Prereqs: Node.js and npm.

Install deps:

```bash
npm install
```

Start dev server:

```bash
ng serve
```

Open http://localhost:4200. Type a note and press Enter to add. Click ✕ to remove.

Build:

```bash
ng build
```

Unit tests:

```bash
ng test
```

## Roadmap ideas

- Local storage or backend persistence
- Edit and reorder notes
- Tags, search, and filters
- Keyboard shortcuts

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
