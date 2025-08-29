import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteFormComponent } from '../../../shared/note-form/note-form.component';
import { CommonModule } from '@angular/common';
import { NotesService } from '../notes.service';
import { CategoriesService } from '../../../shared/services/categories.service';

@Component({
  selector: 'app-edit-note',
  imports: [CommonModule, NoteFormComponent],
  templateUrl: './edit-note.component.html',
  styleUrl: './edit-note.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNoteComponent {
  private readonly notes = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categories = inject(CategoriesService);

  private readonly id = signal<string | null>(null);
  readonly note = computed(() =>
    this.id() ? this.notes.findById(this.id()!) ?? null : null
  );

  constructor() {
    const paramId = this.route.snapshot.paramMap.get('id');
    this.id.set(paramId);
  }

  async onSave(value: {
    title?: string;
    content: string;
    categoryId: string;
  }): Promise<void> {
    const id = this.id();

    if (!id) {
      return;
    }

    this.notes.update(id, {
      title: value.title,
      content: value.content,
      categoryId: value.categoryId,
    });
    this.categories.selectedId.set(value.categoryId);
    await this.router.navigate(['/', 'notes']);
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/', 'notes']);
  }
}
