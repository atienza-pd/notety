import { TestBed } from '@angular/core/testing';
import { NotesComponent } from './notes.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NotesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NotesComponent],
    }).compileComponents();
  });

  it('should create and render title', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const h1: HTMLHeadingElement | null =
      fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Notes');
  });

  it('removes a note when Remove is clicked', () => {
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();

    const getCards = () =>
      fixture.nativeElement.querySelectorAll('article.bg-white');

    const initialCount = getCards().length;
    expect(initialCount).toBeGreaterThan(0);

    const removeBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-label="Remove"]');
    expect(removeBtn).toBeTruthy();
    removeBtn!.click();
    fixture.detectChanges();

    const afterCount = getCards().length;
    expect(afterCount).toBe(initialCount - 1);
  });
});
