import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PillsComponent } from './pills.component';

describe('PillsComponent', () => {
  let component: PillsComponent;
  let fixture: ComponentFixture<PillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PillsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided text', () => {
    fixture.componentRef.setInput('text', 'Test Pill');
    fixture.detectChanges();

    const pillElement = fixture.nativeElement.querySelector('span');
    expect(pillElement.textContent).toBe(' Test Pill\n');
  });

  it('should have tailwind classes for styling', () => {
    fixture.componentRef.setInput('text', 'Test');
    fixture.detectChanges();

    const pillElement = fixture.nativeElement.querySelector('span');
    expect(pillElement).toBeTruthy();
    expect(pillElement.classList.contains('text-indigo-600')).toBe(true);
    expect(pillElement.classList.contains('border-indigo-600')).toBe(true);
    expect(pillElement.classList.contains('rounded-full')).toBe(true);
  });
});
