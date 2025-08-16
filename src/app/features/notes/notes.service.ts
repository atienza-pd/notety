import { Injectable, signal } from '@angular/core';
import { Note, NoteList } from '../models/note.model';
import { createGuid } from '../../shared/utils/guid';

@Injectable({ providedIn: 'root' })
export class NotesService {
  readonly notes = signal<NoteList>([
    {
      id: createGuid(),
      title: 'Note 1',
      content: 'Welcome to Notety',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 2',
      content: 'Try adding and removing notes.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 3',
      content: 'This is a sample note for the grid.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 4',
      content: 'Cards are styled with Tailwind.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 5',
      content: 'Three columns layout.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 6',
      content: 'Alignment matches the navbar.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 7',
      content: 'You can customize this content.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 8',
      content: 'Support for optional titles.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 9',
      content: 'Remove any note with the button.',
      createdAt: new Date(),
    },
    {
      id: createGuid(),
      title: 'Note 10',
      content: 'Static seed without randomness.',
      createdAt: new Date(),
    },
  ]);

  add(note: Note) {
    this.notes.update((list) => [note, ...list]);
  }

  removeAt(index: number) {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }
}
