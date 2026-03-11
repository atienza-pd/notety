import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit confirm event when confirm button is clicked', () => {
    const confirmSpy = jest.spyOn(component.confirm, 'emit');

    component.onConfirm();

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel button is clicked', () => {
    const cancelSpy = jest.spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should emit close event when close button is clicked', () => {
    const closeSpy = jest.spyOn(component.close, 'emit');

    component.onClose();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit close event when backdrop is clicked', () => {
    const closeSpy = jest.spyOn(component.close, 'emit');

    component.onBackdropClick();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should display default title and message', () => {
    const compiled = fixture.nativeElement;

    expect(
      compiled.querySelector('#confirmation-dialog-title').textContent.trim()
    ).toBe('Confirm Action');
    expect(compiled.querySelector('p').textContent.trim()).toBe(
      'Are you sure you want to proceed?'
    );
  });

  it('should display custom title and message when provided', () => {
    fixture.componentRef.setInput('title', 'Delete Item');
    fixture.componentRef.setInput('message', 'This action cannot be undone.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;

    expect(
      compiled.querySelector('#confirmation-dialog-title').textContent.trim()
    ).toBe('Delete Item');
    expect(compiled.querySelector('p').textContent.trim()).toBe(
      'This action cannot be undone.'
    );
  });

  it('should display custom button texts when provided', () => {
    fixture.componentRef.setInput('confirmButtonText', 'Delete');
    fixture.componentRef.setInput('cancelButtonText', 'Keep');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll(
      'button'
    ) as NodeListOf<HTMLButtonElement>;

    // Find buttons by their text content (skip close button)
    const buttonArray = Array.from(buttons);
    const cancelButton = buttonArray.find(
      (btn) => btn.textContent?.trim() === 'Keep'
    );
    const confirmButton = buttonArray.find(
      (btn) => btn.textContent?.trim() === 'Delete'
    );

    expect(cancelButton).toBeTruthy();
    expect(confirmButton).toBeTruthy();
  });
});
