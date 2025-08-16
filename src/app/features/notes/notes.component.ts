import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotesService } from './notes.service';
import { NoteList } from '../models/note.model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent {
  readonly title = signal('Notes');
  constructor(private readonly notesSvc: NotesService) {}

  notes(): NoteList {
    return this.notesSvc.notes();
  }

  removeNote(index: number): void {
    this.notesSvc.removeAt(index);
  }
}
