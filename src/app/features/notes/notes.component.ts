import { Component, signal } from '@angular/core';
import { NoteList } from '../models/note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent {
  readonly title = signal('Notes');
  readonly notes = signal<NoteList>([
    {
      id: '1',
      title: 'Note 1',
      content: 'Welcome to Notety',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Note 2',
      content: 'Try adding and removing notes.',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Note 3',
      content: 'This is a sample note for the grid.',
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Note 4',
      content: 'Cards are styled with Tailwind.',
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Note 5',
      content: 'Three columns layout.',
      createdAt: new Date(),
    },
    {
      id: '6',
      title: 'Note 6',
      content: 'Alignment matches the navbar.',
      createdAt: new Date(),
    },
    {
      id: '7',
      title: 'Note 7',
      content: 'You can customize this content.',
      createdAt: new Date(),
    },
    {
      id: '8',
      title: 'Note 8',
      content: 'Support for optional titles.',
      createdAt: new Date(),
    },
    {
      id: '9',
      title: 'Note 9',
      content: 'Remove any note with the button.',
      createdAt: new Date(),
    },
    {
      id: '10',
      title: 'Note 10',
      content: 'Static seed without randomness.',
      createdAt: new Date(),
    },
  ]);

  addNote(value: string) {
    const note = value?.trim();
    if (!note) return;
    this.notes.update((list) => [
      { id: Date.now().toString(), content: note, createdAt: new Date() },
      ...list,
    ]);
  }

  removeNote(index: number) {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }
}
