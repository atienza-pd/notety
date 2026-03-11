import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryModalComponent } from './category-modal.component';

describe('CategoryModalComponent onSubmit', () => {
  let fixture: ComponentFixture<CategoryModalComponent>;
  let component: CategoryModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not emit when form is invalid (empty name)', () => {
    const saveSpy = jest.spyOn(component.save, 'emit');

    component.form.controls.name.setValue(''); // invalid due to required
    component.onSubmit();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('emits trimmed name when valid', () => {
    const saveSpy = jest.spyOn(component.save, 'emit');

    component.form.controls.name.setValue('   New Category   ');
    expect(component.form.valid).toBe(true);

    component.onSubmit();

    expect(saveSpy).toHaveBeenCalledWith('New Category');
  });

  it('respects max length: > MAX_LEN is invalid, == MAX_LEN is valid', () => {
    const max = CategoryModalComponent.MAX_LEN;
    const over = 'x'.repeat(max + 1);
    const exact = 'y'.repeat(max);

    const saveSpy = jest.spyOn(component.save, 'emit');

    // Over limit -> invalid -> no emit
    component.form.controls.name.setValue(over);
    expect(component.form.valid).toBe(false);
    component.onSubmit();
    expect(saveSpy).not.toHaveBeenCalled();

    // Exactly at limit -> valid -> emits
    component.form.controls.name.setValue(exact);
    expect(component.form.valid).toBe(true);
    component.onSubmit();
    expect(saveSpy).toHaveBeenCalledWith(exact);
  });
});
