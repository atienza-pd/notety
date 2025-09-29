# Notety — Simple Notes

Notety is a minimal notes app built with Angular. It lets you create, view, edit, and remove notes locally (no backend). Notes are persisted in your browser’s localStorage.

> Security Notice: Do not store passwords, API keys, tokens, personal, regulated, or otherwise sensitive / confidential information in Notety. All data is stored unencrypted in your browser (localStorage) and can be read by anyone with access to this device or the page context.

## Features

- Create notes with optional title and required content
- View note details in a modal (shareable via `?view=<id>` query param)
- Edit existing notes on a dedicated page
- Remove notes from the list
- Search notes (title and content) using the navbar search input with a 300ms debounce; hidden on the add and edit page
- Categories: add/edit categories, pick a category per note, and filter the list by the selected category; seeded defaults and local persistence
- Local persistence via `localStorage`
- Accessible controls (aria-labels)
- Modern Angular patterns: standalone components, signals, new control flow, reactive forms
- Content limits and counters: Content field enforces 1000 characters and up to 20 new lines, with live counters and tooltips
- Notes list cards: Content section capped at 240px with a vertical scrollbar if overflow
- Responsive notes grid (1 → 2 → 3 → 4 columns at sm / lg / xl breakpoints)
- Manual backup & restore: ad‑hoc JSON export/import (localStorage only; no sync or encryption)

### URL Linkification

The application automatically converts URLs in note content to clickable links:

- Plain text URLs (starting with http://, https://, or www.) are detected and converted to hyperlinks
- Links open in a new tab with appropriate security attributes (noopener, noreferrer)
- URLs are styled with indigo color and underline for better visibility
- Long URLs break properly to maintain readable content

This feature is implemented using a custom Angular pipe (`LinkifyPipe`) that:

1. Detects URLs using regex pattern matching
2. Transforms them into HTML anchor tags
3. Sanitizes the resulting HTML to prevent XSS vulnerabilities

Example usage in templates:

```html
<div [innerHTML]="textWithUrls | linkify"></div>
```

### Responsive Notes Grid

The notes list uses a mobile‑first responsive CSS Grid layout powered by Tailwind utility classes:

Container classes:

```
grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

Breakpoints & column counts:

- Base / <640px: 1 column (full width cards)
- ≥640px (`sm:`): 2 columns
- ≥1024px (`lg:`): 3 columns
- ≥1280px (`xl:`): 4 columns

Why this approach:

- Pure CSS (no JS resize observers required)
- Consistent row alignment vs. masonry for easier scanning
- Simple to customize by adjusting breakpoint utility classes

Card internals use `flex flex-col` so the content area (with scroll) expands while header + actions stay compact. The scrollable content region caps height at 240px to prevent very long notes from stretching the grid unevenly.

Customizing:

- Change / add breakpoints in `features/notes/notes.component.html` by editing the `sm: lg: xl:` column utilities (e.g., add `2xl:grid-cols-5`).
- Adjust spacing with `gap-*` utilities.
- Modify the max content height via the `max-h-[240px]` class on the paragraph element if you prefer taller cards.

Accessibility & semantics:

- Each note is an `<article>` for better landmark semantics and potential future list virtualisation.
- Action buttons include `aria-label` attributes (View / Remove) for clear intent.

Performance considerations:

- Keeping a fixed maximum height avoids large layout shifts when filtering or restoring notes.
- No dynamic measurement code—relies entirely on Tailwind’s generated classes, minimizing runtime overhead.

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
  - Categories logic and UI:
    - Service and state: [`shared/services/CategoriesService`](src/app/shared/services/categories.service.ts)
    - Navbar dropdown: [`shared/navbar/navbar.component.html`](src/app/shared/navbar/navbar.component.html) and [`shared/navbar/navbar.component.ts`](src/app/shared/navbar/navbar.component.ts)
    - Add/Edit modal: [`shared/category-modal/CategoryModalComponent`](src/app/shared/category-modal/category-modal.component.ts) and template [`category-modal.component.html`](src/app/shared/category-modal/category-modal.component.html)
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

## Categories

Organize notes by category and quickly filter the list.

- Where

  - Category dropdown lives in the navbar to the left of the search on the notes list page (`/notes`).
  - Modal for Add/Edit opens inline above the page.

- Defaults and persistence

  - On first run, categories are seeded to: Personal, Work, Ideas, Todo, Archive.
  - Categories are stored in `localStorage` under the key `notety.categories` as objects: `{ id: string, Name: string }`.
  - The currently selected category is not persisted; refresh resets to “All Categories”.
  - Legacy storage that contains an array of strings is migrated automatically to the new object shape.

- Filtering behavior

  - Selecting a category filters the notes list to that category; “All Categories” shows everything.
  - Search and category filtering compose: the final list is filtered by the selected category first, then by the debounced search term.

- Add/Edit

  - Use “Add new Category” inside the dropdown or the edit pencil next to any category.
  - Name is required and limited to 20 characters; validation is shown in the modal.
  - Duplicate names (case-insensitive) are prevented. When adding a duplicate, the existing category is selected. When renaming to a duplicate, the duplicate is selected instead.
  - Category deletion isn’t implemented yet.

- Notes and categories
  - Each note has a required `categoryId`.
  - When creating a note, the form defaults to the “Personal” category if available, else the first category.
  - Notes saved previously without a category are migrated to “Personal” (or the first/created category) on load.

Key implementation points

- Service: `CategoriesService` manages a `categories` signal, a `selectedId`, derives the selected category, and persists changes.
- Navbar: the dropdown binds to `CategoriesService`, and the modal is wired through outputs to add or edit names.
- Modal: `CategoryModalComponent` provides title by mode (Add/Edit), enforces required + max length (20), and emits the name on save.

## Search

- Where: Top-right of the navbar on the notes list page (`/notes`). It’s intentionally hidden on the add (`/notes/new`) and edit page (`/notes/:id`).
- What it does: Filters the list by title and content. It also works when viewing a note via modal (`?view=<id>`), because filtering happens in the list component.
- Debounce: 300ms to avoid filtering on every keystroke.
- Implementation:
  - The input writes to `SearchService.term`; a debounced mirror `SearchService.debouncedTerm` updates after 300ms.
  - `NotesComponent` uses the debounced value to compute a filtered list.
- Tuning: Adjust the debounce in [`shared/services/search.service.ts`](src/app/shared/services/search.service.ts) (`debounceMs`).

## Content limits and counters

- Limits: The content field allows up to 1000 characters and a maximum of 20 new lines.
- Live counters: Two counters show characters and new lines used (e.g., `123/1000`, `3/20`). Hover for tooltips.
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

## Backup & Restore

Because data lives only in your browser’s `localStorage`, clearing site data, switching browsers/profiles, or uninstalling the PWA will remove your notes. Manual backup lets you migrate or safeguard your data.

### Included in a backup

- Notes (`notety.notes`)
- Categories (`notety.categories`) — current object shape `{ id: string; Name: string }` (legacy string[] auto‑migrated on load)
- Metadata you add when exporting (e.g., `version`, `exportedAt`)

Not included: selected category (ephemeral), search term, service worker caches, any future transient UI state.

### JSON schema (current)

```json
{
  "version": 1,
  "exportedAt": "2025-09-23T12:34:56.789Z",
  "notes": [
    /* Note objects */
  ],
  "categories": [
    /* { id, Name } objects */
  ]
}
```

If you change structures later, bump `version` and provide a migration on import.

### Quick export (temporary console approach)

1. Open the app at `/notes`.
2. DevTools → Console, paste and run:

```javascript
(() => {
  const notes = JSON.parse(localStorage.getItem("notety.notes") || "[]");
  const rawCats = localStorage.getItem("notety.categories");
  let categories = [];
  try {
    const parsed = JSON.parse(rawCats || "[]");
    if (Array.isArray(parsed)) {
      if (parsed.every((x) => typeof x === "string")) {
        // legacy string[] -> object shape
        categories = parsed.map((Name) => ({ id: Name.toLowerCase().replace(/\s+/g, "-"), Name }));
      } else {
        categories = parsed;
      }
    }
  } catch {
    categories = [];
  }
  const payload = { version: 1, exportedAt: new Date().toISOString(), notes, categories };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `notety-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
})();
```

Produces a `notety-backup-YYYY-MM-DD-HH-MM-SS.json` file.

### Quick restore

1. (Recommended) Export first as a safety copy.
2. Open the backup file, review contents.
3. In DevTools Console:

```javascript
// Paste the JSON object (not a string) after the '='
const backup = {
  /* ...backup JSON... */
};

if (backup && backup.version === 1) {
  localStorage.setItem("notety.notes", JSON.stringify(backup.notes || []));
  localStorage.setItem("notety.categories", JSON.stringify(backup.categories || []));
  console.log("Restore complete; reloading.");
  location.reload();
} else {
  console.error("Unsupported or malformed backup.");
}
```

If categories were legacy string[] originally, they will be migrated automatically on next load.

### Planned UI (future enhancement)

- Export button (e.g., in a Settings / overflow menu) → triggers JSON download
- Import dialog with file picker → parse → confirm overwrite → run migration → reload
- Validation: reject malformed JSON, >5MB, or unsupported version

### Safety & best practices

- Keep at least one external copy (cloud drive, encrypted disk, git private repo)
- Treat backups as sensitive (plain text)
- Verify the file (open & skim) before deleting older versions

### Migration guidance

When evolving schema:

- Preserve unknown fields on import (forward compatibility)
- Provide a `migrateBackup(data)` utility handling version steps (e.g., 1→2)
- Avoid destructive renames without fallback defaults

### Troubleshooting

| Symptom                     | Likely cause                               | Fix                                          |
| --------------------------- | ------------------------------------------ | -------------------------------------------- |
| Notes missing after restore | Wrong key names or empty arrays            | Inspect backup JSON structure                |
| Duplicate categories        | Restored over existing without clearing    | Clear `localStorage` first or merge manually |
| JSON parse error            | File corrupted / manual edit mistake       | Re-export or repair JSON syntax              |
| Unexpected note order       | Order not stored (no ordering feature yet) | Implement & persist ordering (future)        |

### Minimal helper snippet (optional future util)

```typescript
export interface NotetyBackupV1 {
  version: 1;
  exportedAt: string;
  notes: any[];
  categories: any[];
}
export function createBackup(): NotetyBackupV1 {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes: JSON.parse(localStorage.getItem("notety.notes") || "[]"),
    categories: JSON.parse(localStorage.getItem("notety.categories") || "[]"),
  };
}
```

### Disclaimer

Backups are only current at the time you export them. No automatic/scheduled export, sync, or encryption features exist yet.

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
- Pick a category in the form (defaults to Personal if present).
- Use “View” to open the details modal, “Remove” to delete.
- Filter by category using the navbar dropdown; combine with search as needed.

Build:

```bash
ng build
```

Production build:

```bash
npm run build:prod
```

Unit tests:

The project uses Jest (via `jest-preset-angular`) instead of the default Karma/Jasmine setup.

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report (outputs to `coverage/`):

```bash
npm run test:coverage
```

Lint:

```bash
npm run lint
```

## Recommended VS Code extensions

- Jest Runner (`firsttris.vscode-jest-runner`) – run or debug individual Jest tests/spec files via inline code lens or context menu. After installing, you can quickly execute a single test without running the whole suite.

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

## Development guidelines

This repo includes concise instructions for contributors and AI assistants: see `.github/instructions/.instructions.md`.

Highlights of the conventions used here (Angular v20+):

- Standalone components, signals for state, and new control flow in templates
- `input()`/`output()`, `computed()` for derived state, `ChangeDetectionStrategy.OnPush`
- Prefer reactive forms; use class/style bindings instead of `ngClass`/`ngStyle`
- Avoid `@HostBinding`/`@HostListener` (use `host` in decorators); use `inject()` for DI

## License

Apache License 2.0 — see [LICENSE](LICENSE)
