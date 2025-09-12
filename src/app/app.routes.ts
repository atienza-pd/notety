import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/notes.component').then((m) => m.NotesComponent),
  },
  {
    path: 'notes/new',
    loadComponent: () =>
      import('./features/notes/add-note.component').then(
        (m) => m.AddNoteComponent
      ),
  },
  {
    path: 'notes/:id',
    loadComponent: () =>
      import('./features/notes/edit-note/edit-note.component').then(
        (m) => m.EditNoteComponent
      ),
  },
];
