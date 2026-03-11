import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '../models/note.model';
import { LinkifyPipe } from '../../shared/pipe/linkify/linkify-pipe';

@Component({
  selector: 'app-note-details',
  imports: [CommonModule, DatePipe, RouterLink, LinkifyPipe],
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteDetailsComponent {
  readonly note = input<Note | null>(null);
}
