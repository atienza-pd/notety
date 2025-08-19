# Notety

A small note-taking app built with Angular.

## Progressive Web App (PWA)

This app is now a PWA:

- Offline-ready via Angular Service Worker
- Installable on desktop and mobile (Add to Home Screen)
- Uses localStorage for data, so notes persist offline

How to try it locally (production build):

1. Build the app.
2. Serve the `dist` output over HTTP (service workers require http/https).

Commands:

```powershell
npm run build
npm run serve:dist
```

Then open http://localhost:8080 and you should see the install prompt in supported browsers.

Notes:

- Update the app icons under `public/icons` for your brand.
- Service worker registers in production only; `ng serve` disables it by default.

# Notety — Simple Notes

Notety is a minimal notes app built with Angular. It lets you create, view, edit, and remove notes locally (no backend). Notes are persisted in your browser’s localStorage.

## Features

- Create notes with optional title and required content
- View note details in a modal (shareable via `?view=<id>` query param)
- Edit existing notes on a dedicated page
- Remove notes from the list
- Search notes (title and content) using the navbar search input with a 300ms debounce; hidden on the add and edit page
- Local persistence via `localStorage`
- Accessible controls (aria-labels)
- Modern Angular patterns: standalone components, signals, new control flow, reactive forms

## URLs

- `/notes` — list notes
- `/notes/new` — create a new note
- `/notes/:id` — edit a note
- `/notes?view=<id>` — open details modal for a note

## Key files

- List and modal:
  - [`features/notes/NotesComponent`](src/app/features/notes/notes.component.ts)
  - [`features/notes/notes.component.html`](src/app/features/notes/notes.component.html)
  - [`features/notes/NoteDetailsComponent`](src/app/features/notes/note-details.component.ts)
- Create/edit:
  - [`features/notes/AddNoteComponent`](src/app/features/notes/add-note.component.ts)
  - [`features/notes/edit-note/EditNoteComponent`](src/app/features/notes/edit-note/edit-note.component.ts)
  - [`shared/note-form/NoteFormComponent`](src/app/shared/note-form/note-form.component.ts)
- Data and models:
  - [`features/notes/NotesService`](src/app/features/notes/notes.service.ts)
  - [`features/models/Note`](src/app/features/models/note.model.ts)
  - GUID helper: [`createGuid`](src/app/shared/utils/guid.ts)
- App shell and routing:
  - [`App`](src/app/app.ts)
  - [`routes`](src/app/app.routes.ts)
- Search:
  - Navbar UI: [`shared/navbar/navbar.component.html`](src/app/shared/navbar/navbar.component.html) and [`shared/navbar/navbar.component.ts`](src/app/shared/navbar/navbar.component.ts)
  - Debounced state: [`shared/services/search.service.ts`](src/app/shared/services/search.service.ts)

## How it works

- Notes are stored in a signal inside [`NotesService`](src/app/features/notes/notes.service.ts) and persisted to `localStorage`.
- Create: go to `/notes/new`, fill the form, save.
- View: click “View” on a card to open the details modal (URL gains `?view=<id>`).
- Edit: open `/notes/:id`, update fields, save.
- Remove: click “Remove” on a card.
- Search: type in the navbar search on `/notes` to filter by title/content; results update after a short delay. The search is hidden on `/notes/:id` (edit page).

## Search

- Where: Top-right of the navbar on the notes list page (`/notes`). It’s intentionally hidden on the add (`/notes/new`) and edit page (`/notes/:id`).
- What it does: Filters the list by title and content. It also works when viewing a note via modal (`?view=<id>`), because filtering happens in the list component.
- Debounce: 300ms to avoid filtering on every keystroke.
- Implementation:
  - The input writes to `SearchService.term`; a debounced mirror `SearchService.debouncedTerm` updates after 300ms.
  - `NotesComponent` uses the debounced value to compute a filtered list.
- Tuning: Adjust the debounce in [`shared/services/search.service.ts`](src/app/shared/services/search.service.ts) (`debounceMs`).

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

Open http://localhost:4200, then:

- Click “+ New”, enter content (title optional), Save.
- Use “View” to open the details modal, “Remove” to delete.

Build:

```bash
ng build
```

Unit tests:

```bash
ng test
```

Lint:

```bash
npm run lint
```

## Styling

Tailwind CSS v4 via PostCSS:

- Global styles: [`src/styles.css`](src/styles.css)

## Docker (WSL) local deployment

This repo includes a Dockerfile and docker-compose.yml to build the Angular app and serve it with Nginx.

Build and run:

```bash
docker compose build
docker compose up -d
```

Open http://localhost:8080

Notes:

- SPA routing is handled by Nginx (`try_files` to `index.html`).
- Rebuild after changes: `docker compose build --no-cache && docker compose up -d`
- WSL tips: see [docs/wsl-docker-fixes.md](docs/wsl-docker-fixes.md)

## Roadmap ideas

- Backend persistence
- Tags and filters
- Reordering and drag & drop
- Markdown support
- Offline support (PWA)

## License

Apache License 2.0 — see [LICENSE](LICENSE)
