import { Injectable, effect, signal } from '@angular/core';
import { Note, NoteList } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly storageKey = 'notety.notes';

  readonly notes = signal<NoteList>(this.loadFromStorageOrSeed());

  private readonly persistEffect = effect(() => {
    // Persist any changes to the notes signal into localStorage
    const current = this.notes();
    this.saveToStorage(current);
  });

  private loadFromStorageOrSeed(): NoteList {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        // First run: start with an empty list
        return [];
      }
      const parsed = JSON.parse(raw) as Array<
        Omit<Note, 'createdAt' | 'updatedAt'> & {
          createdAt: string;
          updatedAt?: string;
        }
      >;
      return parsed.map((n) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
      }));
    } catch {
      // On any error, fall back to an empty list to keep the app usable
      return [];
    }
  }

  private saveToStorage(list: NoteList): void {
    try {
      const serializable = list.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt ? n.updatedAt.toISOString() : undefined,
      }));
      localStorage.setItem(this.storageKey, JSON.stringify(serializable));
    } catch {
      // ignore persistence errors
    }
  }

  add(note: Note): void {
    this.notes.update((list) => [note, ...list]);
  }

  removeAt(index: number): void {
    this.notes.update((list) => list.filter((_, i) => i !== index));
  }

  findById(id: string): Note | undefined {
    return this.notes().find((n) => n.id === id);
  }

  update(id: string, changes: Partial<Omit<Note, 'id' | 'createdAt'>>): void {
    this.notes.update((list) =>
      list.map((n) =>
        n.id === id
          ? {
              ...n,
              ...changes,
              updatedAt: new Date(),
            }
          : n
      )
    );
  }
}
