# Confirmation Dialog Component

A reusable confirmation dialog component for Angular applications.

## Features

- Reusable confirmation dialog with customizable content
- Close button in the upper right corner
- Confirm and cancel buttons positioned in the bottom right corner
- Customizable button text and styling
- Backdrop click to close
- Accessibility support with proper ARIA attributes
- Built with Angular signals and modern Angular patterns

## Usage

### Basic Usage

```typescript
import { ConfirmationDialogComponent } from "./shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "app-example",
  imports: [ConfirmationDialogComponent],
  template: `
    @if (showDialog()) {
    <app-confirmation-dialog (confirm)="onConfirm()" (cancel)="onCancel()" (close)="onClose()" />
    }
  `,
})
export class ExampleComponent {
  showDialog = signal(false);

  onConfirm() {
    // Handle confirmation
    console.log("User confirmed");
    this.showDialog.set(false);
  }

  onCancel() {
    // Handle cancellation
    console.log("User cancelled");
    this.showDialog.set(false);
  }

  onClose() {
    // Handle dialog close
    this.showDialog.set(false);
  }
}
```

### Custom Content

```typescript
@Component({
  template: `
    @if (showDeleteDialog()) {
    <app-confirmation-dialog title="Delete Note" message="Are you sure you want to delete this note? This action cannot be undone." confirmButtonText="Delete" cancelButtonText="Keep" confirmButtonClass="bg-red-600 hover:bg-red-500 text-white" cancelButtonClass="bg-gray-200 hover:bg-gray-300 text-gray-800" (confirm)="deleteNote()" (cancel)="onCancel()" (close)="onClose()" />
    }
  `,
})
export class DeleteNoteComponent {
  showDeleteDialog = signal(false);

  deleteNote() {
    // Perform delete operation
    this.showDeleteDialog.set(false);
  }

  onCancel() {
    this.showDeleteDialog.set(false);
  }

  onClose() {
    this.showDeleteDialog.set(false);
  }
}
```

## Input Properties

| Property             | Type     | Default                                         | Description                              |
| -------------------- | -------- | ----------------------------------------------- | ---------------------------------------- |
| `title`              | `string` | `'Confirm Action'`                              | The title displayed in the dialog header |
| `message`            | `string` | `'Are you sure you want to proceed?'`           | The message displayed in the dialog body |
| `confirmButtonText`  | `string` | `'Confirm'`                                     | Text for the confirm button              |
| `cancelButtonText`   | `string` | `'Cancel'`                                      | Text for the cancel button               |
| `confirmButtonClass` | `string` | `'bg-red-600 hover:bg-red-500 text-white'`      | CSS classes for the confirm button       |
| `cancelButtonClass`  | `string` | `'bg-gray-200 hover:bg-gray-300 text-gray-800'` | CSS classes for the cancel button        |

## Output Events

| Event     | Description                                          |
| --------- | ---------------------------------------------------- |
| `confirm` | Emitted when the confirm button is clicked           |
| `cancel`  | Emitted when the cancel button is clicked            |
| `close`   | Emitted when the close button or backdrop is clicked |

## Styling

The component uses Tailwind CSS classes for styling. You can customize the appearance by:

1. Modifying the default button classes via input properties
2. Adding custom CSS in the component's stylesheet
3. Using Tailwind utility classes for consistent styling

## Accessibility

The component includes proper accessibility features:

- `role="dialog"` and `aria-modal="true"` attributes
- Proper ARIA labeling with `aria-labelledby`
- Focus management
- Keyboard navigation support
