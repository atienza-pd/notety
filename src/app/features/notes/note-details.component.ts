import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '../models/note.model';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.css'],
})
export class NoteDetailsComponent {
  readonly note = input<Note | null>(null);
}
