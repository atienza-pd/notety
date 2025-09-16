import {
  ChangeDetectionStrategy,
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
import { SensitiveWarningBannerComponent } from '../../shared/sensitive-warning/sensitive-warning-banner.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchService } from '../../shared/services/search.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { LinkifyPipe } from '../../shared/pipe/linkify/linkify-pipe';

@Component({
  selector: 'app-notes',
  imports: [
    RouterLink,
    NoteDetailsComponent,
    SensitiveWarningBannerComponent,
    LinkifyPipe,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly categories = inject(CategoriesService);
  readonly searchTerm = this.searchSvc.debouncedTerm;

  readonly filteredNotes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.notesSvc.notes();
    const selectedId = this.categories.selectedId();

    const byCategory = selectedId
      ? list.filter((n) => n.categoryId === selectedId)
      : list;

    if (!term) {
      return byCategory;
    }

    return byCategory.filter(
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
  readonly successAlertMessage = signal<string | null>(null);
  private alertTimeout: ReturnType<typeof setTimeout> | null = null;

  // floating action button state
  readonly fabOpen = signal(false);

  toggleFab(): void {
    this.fabOpen.update((o) => !o);
  }

  backupNotes(): void {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        categories: this.categories.categories().map((c) => ({
          id: c.id,
          Name: c.Name,
        })),
        notes: this.notesSvc.notes().map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt ? n.updatedAt.toISOString() : undefined,
        })),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `notety-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      this.successAlertMessage.set('Backup downloaded.');
      this.autoHideSuccessAlert();
    } catch (err) {
      this.successAlertMessage.set('Failed to create backup.');
      this.autoHideSuccessAlert();
      console.error(err);
    }
  }

  restoreNotes(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.notes)) {
          throw new Error('Invalid backup format');
        }
        this.notesSvc.replaceAll(parsed.notes);
        this.categories.replaceAll(parsed.categories ?? []);
        this.successAlertMessage.set('Restore completed.');
        this.autoHideSuccessAlert();
      } catch (e) {
        console.error(e);
        this.alertMessage.set('Failed to restore.');
        this.autoHideSuccessAlert();
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  private autoHideAlert(): void {
    if (this.alertTimeout !== null) {
      clearTimeout(this.alertTimeout);
    }
    this.alertTimeout = setTimeout(() => this.alertMessage.set(null), 4000);
  }

  private autoHideSuccessAlert(): void {
    if (this.alertTimeout !== null) {
      clearTimeout(this.alertTimeout);
    }
    this.alertTimeout = setTimeout(
      () => this.successAlertMessage.set(null),
      4000
    );
  }

  protected readonly syncQuery = effect(() => {
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
