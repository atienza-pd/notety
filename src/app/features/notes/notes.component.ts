import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { PillsComponent } from '../../shared/pills/pills.component';
import { LinkifyPipe } from '../../shared/pipe/linkify/linkify-pipe';
import { SensitiveWarningBannerComponent } from '../../shared/sensitive-warning/sensitive-warning-banner.component';
import { CategoriesService } from '../../shared/services/categories.service';
import { SearchService } from '../../shared/services/search.service';
import { Note } from '../models/note.model';
import { NoteDetailsComponent } from './note-details.component';
import { NotesService } from './notes.service';

@Component({
  selector: 'app-notes',
  imports: [
    RouterLink,
    NoteDetailsComponent,
    SensitiveWarningBannerComponent,
    LinkifyPipe,
    PillsComponent,
    ConfirmationDialogComponent,
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
      return byCategory.map((n: Note) => ({
        ...n,
        categoryName: this.categories.getName(n.categoryId),
      }));
    }

    const byTitleAndContent = byCategory.filter(
      (n) =>
        (n.title ?? '').toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term)
    );
    return byTitleAndContent.map((n) => ({
      ...n,
      categoryName: this.categories.getName(n.categoryId),
    })); // return copies to ensure reactivity;
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
  readonly deleteDialog = signal({
    show: false,
    noteIndex: null as number | null,
  });
  readonly restoreDialog = signal({
    show: false,
    input: null as HTMLInputElement | null,
  });

  // floating action button state
  readonly fabOpen = signal(false);

  toggleFab(): void {
    this.fabOpen.update((o) => !o);
  }

  public confirmDelete(noteIndex: number | null): void {
    if (noteIndex !== null) {
      this.notesSvc.removeAt(noteIndex);
      this.deleteDialog.set({ show: false, noteIndex: null });
    }
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

  public onRestoreFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    // Open confirmation dialog; keep a reference to the input to use on confirm
    this.restoreDialog.set({ show: true, input });
  }

  public closeRestoreDialog(): void {
    const current = this.restoreDialog();
    if (current.input) {
      // Clear the file selection when canceling/closing
      current.input.value = '';
    }
    this.restoreDialog.set({ show: false, input: null });
  }

  public confirmRestore(): void {
    const current = this.restoreDialog();
    if (!current.input) {
      this.restoreDialog.set({ show: false, input: null });
      return;
    }
    // Hide dialog before performing restore
    this.restoreDialog.set({ show: false, input: null });
    this.restoreNotes(current.input);
  }

  public restoreNotes(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const res = reader.result;
        if (res == null) {
          throw new Error('Failed to read file contents.');
        }
        let text: string;
        if (typeof res === 'string') {
          text = res;
        } else if (res instanceof ArrayBuffer) {
          // Guard against accidental ArrayBuffer results; decode as UTF-8
          text = new TextDecoder('utf-8').decode(new Uint8Array(res));
        } else {
          // As a last resort, use Blob/text
          throw new Error('Unsupported file content type.');
        }
        const parsed = JSON.parse(text);
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
        this.autoHideAlert();
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
    this.deleteDialog.set({ show: true, noteIndex: index });
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.viewingId.set(null);
    this.viewingNote.set(null);
    // clear query params so dialog doesn't reopen on refresh
    this.router.navigate(['/', 'notes'], { queryParams: {} });
  }

  public closeDeleteDialog(): void {
    this.deleteDialog.set({ show: false, noteIndex: null });
  }

  ngOnDestroy(): void {
    if (this.alertTimeout !== null) {
      clearTimeout(this.alertTimeout);
    }
  }
}
