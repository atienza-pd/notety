import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/notes.component').then((m) => m.NotesComponent),
  },
];
