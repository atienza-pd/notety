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
  readonly isModalOpen = signal(false);
  readonly selectedNote = signal<string>('');
  readonly selectedNoteIndex = signal<number>(-1);

  addNote(value: string) {
    const note = value?.trim();
    if (!note) return;
    this.notes.update((list) => [note, ...list]);
  }

  removeNote(index: number) {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }

  viewNote(note: string, index: number) {
    this.selectedNote.set(note);
    this.selectedNoteIndex.set(index);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedNote.set('');
    this.selectedNoteIndex.set(-1);
  }
}
