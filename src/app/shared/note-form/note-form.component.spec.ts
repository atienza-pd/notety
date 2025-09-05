import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteFormComponent } from './note-form.component';
import { CategoriesService, Category } from '../services/categories.service';

describe('NoteFormComponent onSubmit', () => {
  let fixture: ComponentFixture<NoteFormComponent>;
  let component: NoteFormComponent;
  let categoriesMock: { categories: jest.Mock<Category[]> };

  beforeEach(async () => {
    categoriesMock = {
      categories: jest.fn(() => [
        { id: 'cat-1', Name: 'Personal' },
        { id: 'cat-2', Name: 'Work' },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [NoteFormComponent],
      providers: [{ provide: CategoriesService, useValue: categoriesMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not emit when form is invalid (missing content)', () => {
    const emitSpy = jest.spyOn(component.submitForm, 'emit');

    // Only category is present by default; content is empty -> invalid
    component.form.controls.categoryId.setValue('cat-1');
    component.form.controls.content.setValue('');

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits trimmed values when valid', () => {
    const emitSpy = jest.spyOn(component.submitForm, 'emit');

    component.form.setValue({
      title: '  Hello World  ',
      content: '   Some content here   ',
      categoryId: 'cat-2',
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Hello World',
      content: 'Some content here',
      categoryId: 'cat-2',
    });
  });

  it('emits with title as undefined when title is empty/whitespace after trim', () => {
    const emitSpy = jest.spyOn(component.submitForm, 'emit');

    component.form.setValue({
      title: '   ',
      content: 'X',
      categoryId: 'cat-1',
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      title: undefined,
      content: 'X',
      categoryId: 'cat-1',
    });
  });
});

describe('NoteFormComponent onContentInput', () => {
  let fixture: ComponentFixture<NoteFormComponent>;
  let component: NoteFormComponent;
  let categoriesMock: { categories: jest.Mock<Category[]> };

  beforeEach(async () => {
    categoriesMock = {
      categories: jest.fn(() => [
        { id: 'cat-1', Name: 'Personal' },
        { id: 'cat-2', Name: 'Work' },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [NoteFormComponent],
      providers: [{ provide: CategoriesService, useValue: categoriesMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not alter content or call setValue when newline count is within limit', () => {
    const n = component.maxNewlines - 1; // within limit
    const original = Array(n + 1)
      .fill('x')
      .join('\n'); // n newlines
    component.form.controls.content.setValue(original);

    const setSpy = jest.spyOn(component.contentControl, 'setValue');

    component.onContentInput();

    expect(setSpy).not.toHaveBeenCalled();
    expect(component.contentControl.value).toBe(original);
  });

  it('trims extra newlines beyond the limit and updates control', () => {
    const n = component.maxNewlines + 5; // exceed limit
    const original = Array(n + 1)
      .fill('x')
      .join('\n'); // n newlines
    component.form.controls.content.setValue(original);

    const setSpy = jest.spyOn(component.contentControl, 'setValue');

    component.onContentInput();

    expect(setSpy).toHaveBeenCalledTimes(1);
    const arg = setSpy.mock.calls[0][0] as string;
    const countNewlines = (s: string) => (s.match(/\n/g) || []).length;
    expect(countNewlines(arg)).toBe(component.maxNewlines);
    expect(countNewlines(component.contentControl.value ?? '')).toBe(
      component.maxNewlines
    );
  });
});

describe('NoteFormComponent onEnterKey', () => {
  let fixture: ComponentFixture<NoteFormComponent>;
  let component: NoteFormComponent;
  let categoriesMock: { categories: jest.Mock<Category[]> };

  beforeEach(async () => {
    categoriesMock = {
      categories: jest.fn(() => [
        { id: 'cat-1', Name: 'Personal' },
        { id: 'cat-2', Name: 'Work' },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [NoteFormComponent],
      providers: [{ provide: CategoriesService, useValue: categoriesMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call preventDefault when below newline limit', () => {
    const n = component.maxNewlines - 1;
    const value = Array(n + 1)
      .fill('x')
      .join('\n'); // n newlines
    component.form.controls.content.setValue(value);

    type MockEvent = { preventDefault: jest.Mock };
    const ev: MockEvent = { preventDefault: jest.fn() };

    component.onEnterKey(ev as unknown as Event);

    expect(ev.preventDefault).not.toHaveBeenCalled();
  });

  it('calls preventDefault when at or above newline limit', () => {
    const n = component.maxNewlines; // exactly at limit
    const value = Array(n + 1)
      .fill('x')
      .join('\n'); // n newlines
    component.form.controls.content.setValue(value);

    type MockEvent = { preventDefault: jest.Mock };
    const ev: MockEvent = { preventDefault: jest.fn() };

    component.onEnterKey(ev as unknown as Event);

    expect(ev.preventDefault).toHaveBeenCalledTimes(1);
  });
});
