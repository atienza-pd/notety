import {
  Component,
  HostListener,
  OnDestroy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NotesService } from './notes.service';
import { NoteList } from '../models/note.model';
import { NoteDetailsComponent } from './note-details.component';
import { toSignal } from '@angular/core/rxjs-interop';

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
  // Tracks current responsive column count to compute vertical tab order
  readonly columnsCount = signal<number>(this.getColumnsCount());

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

  notes(): NoteList {
    return this.notesSvc.notes();
  }

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

  // Compute tabindex in column-major order so keyboard tabs vertically
  getTabIndex(index: number, kind: 'view' | 'remove'): number {
    const C = this.columnsCount();
    const list = this.notes();
    const N = list.length;
    if (C <= 1 || N <= 1) {
      // Single column or single item: natural order
      return index + 1 + (kind === 'remove' ? N : 0);
    }
    const rows = Math.ceil(N / C);
    const row = Math.floor(index / C);
    const col = index % C;
    const base = col * rows + row + 1; // 1-based tabindex sequence
    return kind === 'view' ? base : base + N;
  }

  // Update columnsCount on viewport resize to match Tailwind breakpoints
  @HostListener('window:resize')
  onResize(): void {
    this.columnsCount.set(this.getColumnsCount());
  }

  private getColumnsCount(): number {
    const w = window.innerWidth;
    // Tailwind default breakpoints: sm: 640px, lg: 1024px
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }
}
