import { Component, effect, input, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Note } from '../../features/models/note.model';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css'],
})
export class NoteFormComponent {
  readonly value = input<Partial<Note> | null | undefined>(null);
  readonly submitForm = output<{ title?: string; content: string }>();
  readonly cancel = output<void>();

  readonly form = this.initForm();

  constructor() {
    // react to input value changes and patch form
    effect(() => {
      const v = this.value();
      if (v) {
        this.form.patchValue({
          title: v.title ?? '',
          content: v.content ?? '',
        });
      }
    });
  }

  private initForm(): FormGroup<{
    title: FormControl<string>;
    content: FormControl<string>;
  }> {
    const fb = new FormBuilder();
    return fb.nonNullable.group({
      title: [''],
      content: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { title, content } = this.form.getRawValue();
    this.submitForm.emit({
      title: title?.trim() || undefined,
      content: content.trim(),
    });
  }
}
