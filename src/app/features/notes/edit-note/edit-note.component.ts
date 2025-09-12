import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteFormComponent } from '../../../shared/note-form/note-form.component';
import { CommonModule } from '@angular/common';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-edit-note',
  standalone: true,
  imports: [CommonModule, NoteFormComponent],
  templateUrl: './edit-note.component.html',
  styleUrl: './edit-note.component.css',
})
export class EditNoteComponent {
  private readonly notes = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = signal<string | null>(null);
  readonly note = computed(() =>
    this.id() ? this.notes.findById(this.id()!) ?? null : null
  );

  constructor() {
    const paramId = this.route.snapshot.paramMap.get('id');
    this.id.set(paramId);
  }

  async onSave(value: { title?: string; content: string }): Promise<void> {
    const id = this.id();

    if (!id) {
      return;
    }

    this.notes.update(id, {
      title: value.title,
      content: value.content,
    });
    await this.router.navigate(['/', 'notes']);
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/', 'notes']);
  }
}
