import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NotesService } from './notes.service';
import { NoteList } from '../models/note.model';
import { NoteDetailsComponent } from './note-details.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchService } from '../../shared/services/search.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [RouterLink, NoteDetailsComponent],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnDestroy {
  readonly title = signal('Notes');
  private readonly notesSvc = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly searchSvc = inject(SearchService);
  readonly searchTerm = this.searchSvc.debouncedTerm;

  readonly filteredNotes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.notesSvc.notes();

    if (!term) {
      return list;
    }

    return list.filter(
      (n) =>
        (n.title ?? '').toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term)
    );
  });

  // dialog state
  readonly viewingId = signal<string | null>(null);
  readonly viewingNote = signal(
    this.viewingId() ? this.notesSvc.findById(this.viewingId()!) ?? null : null
  );
  readonly isDialogOpen = signal(false);
  readonly alertMessage = signal<string | null>(null);
  private alertTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly syncQuery = effect(() => {
    const id = this.qp().get('view');
    if (id) {
      const note = this.notesSvc.findById(id) ?? null;
      if (note) {
        this.viewingId.set(id);
        this.viewingNote.set(note);
        this.isDialogOpen.set(true);
      } else {
        // show toast-like alert and clear query param
        this.viewingId.set(null);
        this.viewingNote.set(null);
        this.isDialogOpen.set(false);
        this.alertMessage.set('No note found for this ID.');
        if (this.alertTimeout !== null) {
          clearTimeout(this.alertTimeout);
        }
        this.alertTimeout = setTimeout(() => this.alertMessage.set(null), 5000);
        queueMicrotask(() => {
          this.router.navigate(['/', 'notes'], { queryParams: {} });
        });
      }
    }
  });

  removeNote(index: number): void {
    this.notesSvc.removeAt(index);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.viewingId.set(null);
    this.viewingNote.set(null);
    // clear query params so dialog doesn't reopen on refresh
    this.router.navigate(['/', 'notes'], { queryParams: {} });
  }

  ngOnDestroy(): void {
    if (this.alertTimeout !== null) {
      clearTimeout(this.alertTimeout);
    }
  }
}
