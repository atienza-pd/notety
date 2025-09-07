import { TestBed } from '@angular/core/testing';
import {
  SensitiveWarningBannerComponent,
  SENSITIVE_WARNING_KEY,
} from './sensitive-warning-banner.component';

function queryByRole(root: HTMLElement, role: string): HTMLElement | null {
  return root.querySelector(`[role="${role}"]`);
}

describe('SensitiveWarningBannerComponent', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem(SENSITIVE_WARNING_KEY);
    } catch {
      /* ignore */
    }
  });

  it('shows the banner by default when not dismissed', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [SensitiveWarningBannerComponent],
    }).createComponent(SensitiveWarningBannerComponent);
    fixture.detectChanges();
    const alert = queryByRole(fixture.nativeElement, 'alert');
    expect(alert).toBeTruthy();
    expect(fixture.nativeElement.textContent).toMatch(/Security notice/i);
  });

  it('hides after dismiss and sets localStorage', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [SensitiveWarningBannerComponent],
    }).createComponent(SensitiveWarningBannerComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    button!.click();
    fixture.detectChanges();
    const alert = queryByRole(fixture.nativeElement, 'alert');
    expect(alert).toBeNull();
    expect(localStorage.getItem(SENSITIVE_WARNING_KEY)).toBe('1');
  });

  it('does not render when already dismissed', () => {
    try {
      localStorage.setItem(SENSITIVE_WARNING_KEY, '1');
    } catch {
      /* ignore */
    }
    const fixture = TestBed.configureTestingModule({
      imports: [SensitiveWarningBannerComponent],
    }).createComponent(SensitiveWarningBannerComponent);
    fixture.detectChanges();
    const alert = queryByRole(fixture.nativeElement, 'alert');
    expect(alert).toBeNull();
  });
});
