import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

// LocalStorage key constant (exported for test access)
export const SENSITIVE_WARNING_KEY = 'notety.sensitiveWarning.dismissed';

@Component({
  selector: 'app-sensitive-warning-banner',
  standalone: true,
  templateUrl: './sensitive-warning-banner.component.html',
  styleUrls: ['./sensitive-warning-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensitiveWarningBannerComponent {
  readonly visible = signal(!this.isDismissed());

  private isDismissed(): boolean {
    try {
      return !!localStorage.getItem(SENSITIVE_WARNING_KEY);
    } catch {
      return false; // safest: show banner
    }
  }

  dismiss(): void {
    try {
      localStorage.setItem(SENSITIVE_WARNING_KEY, '1');
    } catch {
      /* ignore */
    }
    this.visible.set(false);
  }
}
