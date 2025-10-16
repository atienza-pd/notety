import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CategoriesService } from '../../shared/services/categories.service';
import { SearchService } from '../../shared/services/search.service';
import { Note } from '../models/note.model';
import { NotesComponent } from './notes.component';
import { NotesService } from './notes.service';

describe('NotesComponent closeDialog', () => {
  let fixture: ComponentFixture<NotesComponent>;
  let component: NotesComponent;

  const notesSvcMock = {
    notes: signal([]),
    findById: jest.fn(() => undefined),
    removeAt: jest.fn(),
  } as unknown as NotesService;

  const searchSvcMock = {
    debouncedTerm: signal(''),
  } as unknown as SearchService;

  const categoriesSvcMock = {
    selectedId: signal<string | null>(null),
  } as unknown as CategoriesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent, RouterTestingModule],
      providers: [
        { provide: NotesService, useValue: notesSvcMock },
        { provide: SearchService, useValue: searchSvcMock },
        { provide: CategoriesService, useValue: categoriesSvcMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('resets dialog state and navigates to /notes with cleared query params', () => {
    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Prime dialog state
    component.isDialogOpen.set(true);
    component.viewingId.set('note-1');
    const fakeNote: Note = {
      id: 'note-1',
      title: 't',
      content: 'c',
      categoryId: 'cat-1',
      createdAt: new Date(),
    };
    component.viewingNote.set(fakeNote);

    component.closeDialog();

    expect(component.isDialogOpen()).toBe(false);
    expect(component.viewingId()).toBeNull();
    expect(component.viewingNote()).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/', 'notes'], { queryParams: {} });
  });
});

describe('NotesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NotesComponent],
    }).compileComponents();
  });

  afterEach(() => {
    // Ensure tests are isolated
    localStorage.removeItem('notety.notes');
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
    // Seed localStorage with one note before component is created
    localStorage.setItem(
      'notety.notes',
      JSON.stringify([
        {
          id: 'test-1',
          title: 'Test Note',
          content: 'Hello world',
          createdAt: new Date().toISOString(),
        },
      ])
    );

    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();

    const getCards = () =>
      fixture.nativeElement.querySelectorAll('article.bg-white');

    const initialCount = getCards().length;
    expect(initialCount).toBeGreaterThan(0);

    const removeBtn: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button[aria-label="Remove"]');
    expect(removeBtn).toBeTruthy();
    // First click opens confirmation dialog
    removeBtn!.click();
    fixture.detectChanges();

    // Confirmation dialog should now be present
    const dialog = fixture.nativeElement.querySelector(
      'app-confirmation-dialog'
    );
    expect(dialog).toBeTruthy();

    // Find the Delete confirm button by its text content
    const buttons = Array.from(
      dialog.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    );
    const confirmButton = buttons.find((b) =>
      /delete/i.test(b.textContent || '')
    );
    expect(confirmButton).toBeTruthy();
    confirmButton!.click();
    fixture.detectChanges();

    const afterCount = getCards().length;
    expect(afterCount).toBe(initialCount - 1);
  });
});

describe('NotesComponent syncQuery effect', () => {
  it('opens dialog when view param matches an existing note', async () => {
    const note: Note = {
      id: 'n1',
      title: 'A',
      content: 'B',
      categoryId: 'cat-1',
      createdAt: new Date(),
    };
    const notesSvcMock = {
      notes: signal([note]),
      findById: jest.fn((id: string) => (id === 'n1' ? note : undefined)),
      removeAt: jest.fn(),
    } as unknown as NotesService;

    await TestBed.configureTestingModule({
      imports: [NotesComponent, RouterTestingModule],
      providers: [
        { provide: NotesService, useValue: notesSvcMock },
        { provide: SearchService, useValue: { debouncedTerm: signal('') } },
        {
          provide: CategoriesService,
          useValue: {
            selectedId: signal<string | null>(null),
            getName: jest.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ view: 'n1' })),
            snapshot: { queryParamMap: convertToParamMap({ view: 'n1' }) },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDialogOpen()).toBe(true);
    expect(component.viewingId()).toBe('n1');
    expect(component.viewingNote()).toEqual(note);
    expect(component.alertMessage()).toBeNull();
  });

  it('shows alert and clears query when view param does not match a note', async () => {
    jest.useFakeTimers();

    const notesSvcMock = {
      notes: signal([]),
      findById: jest.fn(() => undefined),
      removeAt: jest.fn(),
    } as unknown as NotesService;

    await TestBed.configureTestingModule({
      imports: [NotesComponent, RouterTestingModule],
      providers: [
        { provide: NotesService, useValue: notesSvcMock },
        { provide: SearchService, useValue: { debouncedTerm: signal('') } },
        {
          provide: CategoriesService,
          useValue: { selectedId: signal<string | null>(null) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ view: 'missing' })),
            snapshot: { queryParamMap: convertToParamMap({ view: 'missing' }) },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const qmSpy = jest
      .spyOn(window, 'queueMicrotask')
      .mockImplementation((cb: VoidFunction) => cb());

    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Effect should set alert and schedule microtask navigation
    expect(component.isDialogOpen()).toBe(false);
    expect(component.viewingId()).toBeNull();
    expect(component.viewingNote()).toBeNull();
    expect(component.alertMessage()).toBe('No note found for this ID.');

    // queueMicrotask has been forced to run immediately via the spy above
    expect(navSpy).toHaveBeenCalledWith(['/', 'notes'], { queryParams: {} });

    // After 5s, the alert should clear
    jest.advanceTimersByTime(5000);
    expect(component.alertMessage()).toBeNull();

    jest.useRealTimers();
    qmSpy.mockRestore();
  });
});

describe('NotesComponent filteredNotes computed', () => {
  const notes: Note[] = [
    {
      id: 'a1',
      title: 'Alpha Note',
      content: 'First content',
      categoryId: 'cat-1',
      createdAt: new Date(),
    },
    {
      id: 'b2',
      title: 'Bravo',
      content: 'Contains alpha keyword',
      categoryId: 'cat-2',
      createdAt: new Date(),
    },
    {
      id: 'c3',
      title: 'Charlie',
      content: 'Something else',
      categoryId: 'cat-2',
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent, RouterTestingModule],
      providers: [
        {
          provide: NotesService,
          useValue: {
            notes: signal([...notes]),
            findById: jest.fn(),
            removeAt: jest.fn(),
          } as unknown as NotesService,
        },
        { provide: SearchService, useValue: { debouncedTerm: signal('') } },
        {
          provide: CategoriesService,
          useValue: {
            selectedId: signal<string | null>(null),
            getName: jest.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const search = TestBed.inject(SearchService) as unknown as {
      debouncedTerm: ReturnType<typeof signal<string>>;
    };
    const cats = TestBed.inject(CategoriesService) as unknown as {
      selectedId: ReturnType<typeof signal<string | null>>;
      getName: (id: string) => string | null;
    };
    return { fixture, component, search, cats };
  }

  it('returns all notes when no search term and no category selected', () => {
    const { component } = setup();
    expect(component.filteredNotes().map((n) => n.id)).toEqual([
      'a1',
      'b2',
      'c3',
    ]);
  });

  it('filters by search term (case-insensitive, trims whitespace)', () => {
    const { component, search } = setup();
    search.debouncedTerm.set('  ALPHA  ');
    expect(component.filteredNotes().map((n) => n.id)).toEqual(['a1', 'b2']);
  });

  it('filters by selected category only when no search term', () => {
    const { component, cats } = setup();
    cats.selectedId.set('cat-2');
    expect(component.filteredNotes().map((n) => n.id)).toEqual(['b2', 'c3']);
  });

  it('applies category filter first, then search within that subset', () => {
    const { component, search, cats } = setup();
    cats.selectedId.set('cat-2');
    search.debouncedTerm.set('alpha');
    expect(component.filteredNotes().map((n) => n.id)).toEqual(['b2']);
  });
});

describe('NotesComponent restoreNotes', () => {
  const makeRouteStub = () => ({
    queryParamMap: of(convertToParamMap({})),
    snapshot: { queryParamMap: convertToParamMap({}) },
  });

  let originalFileReader: typeof FileReader;
  type NotesSvcStub = {
    notes: ReturnType<typeof signal<Note[]>>;
    findById: jest.Mock;
    removeAt: jest.Mock;
    replaceAll: jest.Mock;
  };
  type CategoriesSvcStub = {
    selectedId: ReturnType<typeof signal<string | null>>;
    getName: jest.Mock;
    replaceAll: jest.Mock;
  };
  let notesSvcStub: NotesSvcStub;
  let categoriesSvcStub: CategoriesSvcStub;

  beforeEach(() => {
    originalFileReader = globalThis.FileReader;
    // fresh stubs per test
    notesSvcStub = {
      notes: signal([]),
      findById: jest.fn(),
      removeAt: jest.fn(),
      replaceAll: jest.fn(),
    };
    categoriesSvcStub = {
      selectedId: signal<string | null>(null),
      getName: jest.fn(),
      replaceAll: jest.fn(),
    };
  });

  afterEach(() => {
    // restore FileReader
    globalThis.FileReader = originalFileReader;
    jest.useRealTimers();
  });

  function mockFileReaderWithResult(result: string | ArrayBuffer) {
    const mock = {
      onload: null as FileReader['onload'],
      result: result as FileReader['result'],
      readAsText: jest.fn((_blob: Blob) => {
        // Immediately invoke onload with preset result
        if (typeof mock.onload === 'function') {
          mock.onload({} as ProgressEvent<FileReader>);
        }
      }),
    } as unknown as FileReader;

    // Provide a constructor-like function for FileReader
    const FakeFileReader = function () {
      return mock;
    } as unknown as typeof FileReader;
    globalThis.FileReader = FakeFileReader;
    return mock;
  }

  async function configureAndCreate() {
    await TestBed.configureTestingModule({
      imports: [NotesComponent],
      providers: [
        {
          provide: NotesService,
          useValue: notesSvcStub as unknown as NotesService,
        },
        { provide: SearchService, useValue: { debouncedTerm: signal('') } },
        {
          provide: CategoriesService,
          useValue: categoriesSvcStub as unknown as CategoriesService,
        },
        { provide: ActivatedRoute, useValue: makeRouteStub() },
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('restores notes and categories from valid backup and shows success', async () => {
    const { component } = await configureAndCreate();

    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: [{ id: 'cat-1', Name: 'Work' }],
      notes: [
        {
          id: 'n1',
          title: 'T',
          content: 'C',
          categoryId: 'cat-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    mockFileReaderWithResult(backupJson);

    const fakeInput = {
      files: [new Blob([backupJson], { type: 'application/json' })],
      value: 'dummy',
    } as unknown as HTMLInputElement;

    component.restoreNotes(fakeInput);

    expect(notesSvcStub.replaceAll).toHaveBeenCalledTimes(1);
    expect(notesSvcStub.replaceAll).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'n1', title: 'T', content: 'C' }),
      ])
    );
    expect(categoriesSvcStub.replaceAll).toHaveBeenCalledTimes(1);
    expect(categoriesSvcStub.replaceAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'cat-1' })])
    );

    expect(component.successAlertMessage()).toBe('Restore completed.');
    expect(fakeInput.value).toBe('');
  });

  it('shows error and does not replace when backup format is invalid', async () => {
    jest.useFakeTimers();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { component } = await configureAndCreate();

    const invalidBackup = JSON.stringify({ version: 1, exportedAt: 'x' });
    mockFileReaderWithResult(invalidBackup);

    const fakeInput = {
      files: [new Blob([invalidBackup], { type: 'application/json' })],
      value: 'dummy',
    } as unknown as HTMLInputElement;

    component.restoreNotes(fakeInput);

    expect(notesSvcStub.replaceAll).not.toHaveBeenCalled();
    expect(categoriesSvcStub.replaceAll).not.toHaveBeenCalled();
    expect(component.alertMessage()).toBe('Failed to restore.');

    // It schedules auto-hide after 4s
    jest.advanceTimersByTime(4000);
    expect(component.alertMessage()).toBeNull();
    expect(fakeInput.value).toBe('');

    consoleErrorSpy.mockRestore();
  });
});
