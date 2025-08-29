import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Note } from '../../features/models/note.model';
import { CategoriesService, Category } from '../services/categories.service';

@Component({
  selector: 'app-note-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteFormComponent {
  readonly value = input<Partial<Note> | null | undefined>(null);
  readonly submitForm = output<{
    title?: string;
    content: string;
    categoryId: string;
  }>();
  readonly cancel = output<void>();

  readonly form = this.initForm();
  protected readonly categoriesSvc = inject(CategoriesService);

  // limits
  private static readonly MAX_CHARS = 300;
  private static readonly MAX_NEWLINES = 20;

  constructor() {
    // react to input value changes and patch form
    effect(() => {
      const v = this.value();
      if (v) {
        this.form.patchValue({
          title: v.title ?? '',
          content: v.content ?? '',
          categoryId: v.categoryId ?? this.defaultCategoryId(),
        });
      } else {
        // when creating a new note, ensure category gets a sensible default
        const current = this.form.controls.categoryId.value;
        if (!current) {
          this.form.controls.categoryId.setValue(this.defaultCategoryId());
        }
      }
    });
  }

  private initForm(): FormGroup<{
    title: FormControl<string>;
    content: FormControl<string>;
    categoryId: FormControl<string>;
  }> {
    const fb = new FormBuilder();
    return fb.nonNullable.group({
      title: fb.nonNullable.control<string>('', []),
      content: fb.nonNullable.control<string>('', [
        Validators.required,
        Validators.maxLength(NoteFormComponent.MAX_CHARS),
        this.maxNewLinesValidator(NoteFormComponent.MAX_NEWLINES),
      ]),
      categoryId: fb.nonNullable.control<string>('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { title, content, categoryId } = this.form.getRawValue();
    this.submitForm.emit({
      title: title?.trim() || undefined,
      content: content.trim(),
      categoryId,
    });
  }

  // computed helpers
  get contentControl(): FormControl<string> {
    return this.form.controls.content;
  }

  get charCount(): number {
    return this.contentControl.value?.length ?? 0;
  }

  get newlineCount(): number {
    const v = this.contentControl.value ?? '';
    // count '\n' occurrences
    return (v.match(/\n/g) || []).length;
  }

  get maxChars(): number {
    return NoteFormComponent.MAX_CHARS;
  }

  get maxNewlines(): number {
    return NoteFormComponent.MAX_NEWLINES;
  }

  // event handlers to enforce limits during typing/paste
  onEnterKey(e: Event): void {
    const ev = e as KeyboardEvent;
    if (this.newlineCount >= this.maxNewlines) {
      ev.preventDefault();
    }
  }

  onContentInput(): void {
    const v = this.contentControl.value ?? '';
    const limited = this.limitNewlines(v, this.maxNewlines);
    if (limited !== v) {
      this.contentControl.setValue(limited);
    }
  }

  private limitNewlines(value: string, maxNewlines: number): string {
    let count = 0;
    const chars = [];
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      if (ch === '\n') {
        if (count >= maxNewlines) {
          // skip extra newlines
          continue;
        }
        count++;
      }
      chars.push(ch);
    }
    return chars.join('');
  }

  private maxNewLinesValidator(maxNewlines: number): ValidatorFn {
    return (
      control: AbstractControl<string, string>
    ): ValidationErrors | null => {
      const v = (control?.value as string) ?? '';
      const count = (v.match(/\n/g) || []).length;
      return count > maxNewlines
        ? { maxNewLines: { requiredMax: maxNewlines, actual: count } }
        : null;
    };
  }

  private defaultCategoryId(): string {
    const cats: Category[] = this.categoriesSvc.categories();
    const personal = cats.find((c) => c.Name.toLowerCase() === 'personal');
    if (personal) return personal.id;
    return cats[0]?.id ?? '';
  }
}
