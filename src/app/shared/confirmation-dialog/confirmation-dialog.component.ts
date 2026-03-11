import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
  },
})
export class ConfirmationDialogComponent {
  // Input properties using signals API
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to proceed?');
  readonly confirmButtonText = input<string>('Confirm');
  readonly cancelButtonText = input<string>('Cancel');
  readonly confirmButtonClass = input<string>(
    'bg-red-600 hover:bg-red-500 text-white'
  );
  readonly cancelButtonClass = input<string>(
    'bg-gray-200 hover:bg-gray-300 text-gray-800'
  );

  // Output events
  readonly confirm = output<void>();
  readonly cancel = output<void>();
  readonly close = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }
}
