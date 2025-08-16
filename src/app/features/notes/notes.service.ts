import { Injectable, signal } from '@angular/core';
import { Note, NoteList } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  readonly notes = signal<NoteList>([
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
      title: 'Note 1',
      content: 'Welcome to Notety',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
      title: 'Note 2',
      content: 'Try adding and removing notes.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003',
      title: 'Note 3',
      content: 'This is a sample note for the grid.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
      title: 'Note 4',
      content: 'Cards are styled with Tailwind.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
      title: 'Note 5',
      content: 'Three columns layout.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000006',
      title: 'Note 6',
      content: 'Alignment matches the navbar.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000007',
      title: 'Note 7',
      content: 'You can customize this content.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000008',
      title: 'Note 8',
      content: 'Support for optional titles.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000009',
      title: 'Note 9',
      content: 'Remove any note with the button.',
      createdAt: new Date(),
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000010',
      title: 'Note 10',
      content: 'Static seed without randomness.',
      createdAt: new Date(),
    },
  ]);

  add(note: Note): void {
    this.notes.update((list) => [note, ...list]);
  }

  removeAt(index: number): void {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }

  findById(id: string): Note | undefined {
    return this.notes().find((n) => n.id === id);
  }
}
