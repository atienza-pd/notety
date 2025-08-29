export interface Note {
  id: string;
  title?: string;
  content: string;
  categoryId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type NoteList = Note[];
