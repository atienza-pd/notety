import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NoteFormComponent } from '../../shared/note-form/note-form.component';
import { NotesService } from './notes.service';
import { createGuid } from '../../shared/utils/guid';

@Component({
  selector: 'app-add-note',
  standalone: true,
  imports: [NoteFormComponent],
  template: `
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-xl font-semibold text-gray-900 mb-4">New Note</h1>
      <app-note-form (submitForm)="onSave($event)" (cancel)="onCancel()" />
    </div>
  `,
})
export class AddNoteComponent {
  private readonly notes = inject(NotesService);
  private readonly router = inject(Router);

  async onSave(value: { title?: string; content: string }): Promise<void> {
    this.notes.add({
      id: createGuid(),
      title: value.title,
      content: value.content,
      createdAt: new Date(),
    });
    await this.router.navigate(['/', 'notes']);
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/', 'notes']);
  }
}
