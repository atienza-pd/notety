import { TestBed } from '@angular/core/testing';
import { NotesComponent } from './notes.component';

describe('NotesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent],
    }).compileComponents();
  });

  it('should create and render title', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const h2: HTMLHeadingElement | null =
      fixture.nativeElement.querySelector('h2');
    expect(h2?.textContent).toContain('Notes');
  });

  it('adds a note when form is submitted', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');

    input.value = 'New note';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBeGreaterThan(0);
  });

  it('opens modal when note is clicked', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    
    const noteContent: HTMLElement = 
      fixture.nativeElement.querySelector('.note-content');
    noteContent.click();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeTruthy();
    
    const modalTitle = fixture.nativeElement.querySelector('.modal-header h3');
    expect(modalTitle?.textContent).toContain('View Note');
  });

  it('closes modal when close button is clicked', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    
    // Open modal
    const noteContent: HTMLElement = 
      fixture.nativeElement.querySelector('.note-content');
    noteContent.click();
    fixture.detectChanges();

    // Close modal
    const closeButton: HTMLElement = 
      fixture.nativeElement.querySelector('.close-button');
    closeButton.click();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeFalsy();
  });
});
