import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent {
  readonly title = signal('Notes');
  readonly notes = signal<string[]>(['Welcome to Notety', 'Your first note']);

  addNote(value: string) {
    const note = value?.trim();
    if (!note) return;
    this.notes.update((list) => [note, ...list]);
  }

  removeNote(index: number) {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }
}
