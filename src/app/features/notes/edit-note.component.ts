import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteFormComponent } from '../../shared/note-form/note-form.component';
import { CommonModule } from '@angular/common';
import { NotesService } from './notes.service';

@Component({
  selector: 'app-edit-note',
  standalone: true,
  imports: [CommonModule, NoteFormComponent],
  template: `
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-xl font-semibold text-gray-900 mb-4">Edit Note</h1>
      <ng-container *ngIf="note(); else notFound">
        <app-note-form
          [value]="note()!"
          (submitForm)="onSave($event)"
          (cancel)="onCancel()"
        />
      </ng-container>
      <ng-template #notFound>
        <div class="rounded-md bg-red-50 p-4 text-red-700">Note not found.</div>
      </ng-template>
    </div>
  `,
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
    if (!id) return;
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
