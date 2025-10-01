export interface Note {
  id: string;
  title?: string;
  content: string;
  categoryId: string;
  createdAt: Date;
  updatedAt?: Date;
  categoryName?: string; // populated when listing notes
}

export type NoteList = Note[];
