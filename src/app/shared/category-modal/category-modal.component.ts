import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
  },
})
export class CategoryModalComponent {
  // inputs/outputs using signals API
  readonly mode = input<'add' | 'edit'>('add');
  readonly initialValue = input<string>('');
  readonly close = output<void>();
  readonly save = output<string>();

  static readonly MAX_LEN = 20;
  readonly maxLen = CategoryModalComponent.MAX_LEN;

  readonly form = new FormBuilder().nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(CategoryModalComponent.MAX_LEN),
      ],
    ],
  });

  readonly title = computed(() =>
    this.mode() === 'edit' ? 'Edit Category' : 'Add new Category'
  );

  constructor() {
    // react to initial value changes (e.g., editing a category)
    effect(() => {
      const v = this.initialValue() ?? '';
      this.form.patchValue({ name: v }, { emitEvent: false });
    });
  }

  get nameCtrl() {
    return this.form.controls.name;
  }

  get count() {
    return (this.nameCtrl.value?.length ?? 0) as number;
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.nameCtrl.value.trim();
    this.save.emit(value);
  }
}
