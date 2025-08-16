import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotesService } from './notes.service';

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

  // expose notes value for template control flow
  notes() {
    return this.notesSvc.notes();
  }

  removeNote(index: number) {
    this.notesSvc.removeAt(index);
  }
}
