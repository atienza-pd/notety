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
- Content limits and counters: Content field enforces 300 characters and up to 20 new lines, with live counters and tooltips
- Notes list cards: Content section capped at 240px with a vertical scrollbar if overflow

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

## Content limits and counters

- Limits: The content field allows up to 300 characters and a maximum of 20 new lines.
- Live counters: Two counters show characters and new lines used (e.g., `123/300`, `3/20`). Hover for tooltips.
- Enforcement:
  - Typing: The Enter key is blocked after 20 new lines.
  - Pasting: Excess new lines are trimmed automatically.
- Validation messages: When invalid, an inline message appears aligned with the counters.
- Where implemented:
  - Form logic/UI: [`shared/note-form/NoteFormComponent`](src/app/shared/note-form/note-form.component.ts) and template [`note-form.component.html`](src/app/shared/note-form/note-form.component.html)
  - Limits can be adjusted in `NoteFormComponent` via `MAX_CHARS` and `MAX_NEWLINES` constants.
- Notes list layout:
  - The content text inside each card is limited to a max height of 240px and becomes scrollable on overflow.
  - See [`features/notes/notes.component.html`](src/app/features/notes/notes.component.html) and optional scrollbar styles in [`features/notes/notes.component.css`](src/app/features/notes/notes.component.css).

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

## Progressive Web App (PWA)

Notety ships as a PWA:

- Offline-ready via Angular Service Worker
- Installable on desktop and mobile (Add to Home Screen)
- Notes persist in `localStorage` for offline use

Local PWA test (production build):

```powershell
npm run build
npm run serve:dist
```

Open http://localhost:8080 and check DevTools → Application → Service Workers. Note: service worker registers only on production builds and over HTTPS or `http://localhost`.

More details, HTTPS/NGINX tips, sub-path deploy, and troubleshooting: see [docs/pwa.md](docs/pwa.md) and [docs/pwa-nginx-fixes.md](docs/pwa-nginx-fixes.md).

## Docker (WSL) local deployment

This repo includes a Dockerfile and docker-compose.yml to build the Angular app and serve it with NGINX. HTTPS is enabled for PWA testing.

Build and run:

```powershell
docker compose build
docker compose up -d
```

Open:

- HTTP: http://localhost:8080 (redirects to HTTPS)
- HTTPS: https://localhost:8443

Certificates:

- If you don’t mount certs, the container generates a self-signed cert for localhost. Browsers may warn; for LAN devices use trusted certs.
- To use your own certs (mkcert or CA-backed):
  - Create `./certs/server.crt` and `./certs/server.key` on the host.
  - For LAN: include the IP/hostname in Subject Alternative Names (SANs).
  - Uncomment the certs volume in `docker-compose.yml` to mount `./certs` into `/etc/nginx/certs`.
  - See detailed steps: [docs/docker-certs.md](docs/docker-certs.md)

Generate local CA + server certs for client trust:

- Windows (PowerShell):

  - Run: `./certs/generate-certs.ps1 -Hosts "localhost,127.0.0.1,192.168.1.50,notety.local"`
  - Trust the CA at `certs/trust/notety-local-ca.crt` on client machines

- macOS/Linux (Bash):

  - Run: `./certs/generate-certs.sh "localhost,127.0.0.1,192.168.1.50,notety.local"`
  - Trust the CA at `certs/trust/notety-local-ca.crt` on client machines

Then uncomment the certs volume and restart compose.

Notes:

- SPA routing handled by NGINX (`try_files` to `index.html`).
- Rebuild after changes: `docker compose build --no-cache && docker compose up -d`
- WSL tips: see [docs/wsl-docker-fixes.md](docs/wsl-docker-fixes.md)

## Roadmap ideas

- Backend persistence
- Tags and filters
- Reordering and drag & drop
- Markdown support
- PWA enhancements (background sync, share target, file/URL handling, badges)

## License

Apache License 2.0 — see [LICENSE](LICENSE)
