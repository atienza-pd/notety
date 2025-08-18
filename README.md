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

## Docker (WSL) local deployment

This repository includes a Dockerfile and docker-compose.yml to build the Angular app and serve it with Nginx for production-like local testing in WSL.

### Prerequisites

- Docker Desktop for Windows with WSL 2 backend enabled (Settings > General > Use the WSL 2 based engine) and integration turned on for your WSL distro (Settings > Resources > WSL Integration).

### Build and run

1. Build the image and start the container:

   - PowerShell (from project root):

     ```powershell
     docker compose build
     docker compose up -d
     ```

   - WSL shell (from /mnt/c/dev/notety):

     ```bash
     docker compose build
     docker compose up -d
     ```

2. Open http://localhost:8080

### Notes

- The Angular app is built in a Node image and served by Nginx. SPA routing is handled by Nginx via `try_files` to `index.html`.
- Modify `nginx.conf` if you need custom headers or caching rules.
- To rebuild after changes: `docker compose build --no-cache && docker compose up -d`.

## Roadmap ideas

- Local storage or backend persistence
- Edit and reorder notes
- Tags, search, and filters
- Keyboard shortcuts

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.
