import { TestBed } from '@angular/core/testing';
import {
  CategoriesService,
  Category,
} from '../../shared/services/categories.service';
import { Note } from '../models/note.model';
import { NotesService } from './notes.service';

describe('NotesService update', () => {
  const STORAGE_KEY = 'notety.notes';
  let categoriesMock: {
    categories: jest.Mock<Category[]>;
    addCategory: jest.Mock;
  };
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  const makeStored = (
    notes: Array<
      Omit<Note, 'createdAt' | 'updatedAt'> & {
        createdAt: Date;
        updatedAt?: Date;
      }
    >
  ) =>
    notes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt ? n.updatedAt.toISOString() : undefined,
    }));

  beforeEach(async () => {
    jest.useFakeTimers();

    categoriesMock = {
      categories: jest.fn(() => [
        { id: 'cat-1', Name: 'Personal' },
        { id: 'cat-2', Name: 'Work' },
      ]),
      addCategory: jest.fn(),
    };

    const initial = makeStored([
      {
        id: 'n1',
        title: 'Title 1',
        content: 'Content 1',
        categoryId: 'cat-1',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        id: 'n2',
        title: 'Title 2',
        content: 'Content 2',
        categoryId: 'cat-2',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ]);

    await TestBed.configureTestingModule({
      providers: [{ provide: CategoriesService, useValue: categoriesMock }],
    }).compileComponents();

    getItemSpy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) =>
        key === STORAGE_KEY ? JSON.stringify(initial) : null
      );
    setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('updates matching note fields and sets updatedAt', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    const before = svc.notes();
    expect(before.length).toBe(2);
    const orig = svc.findById('n1')!;
    const origCreated = orig.createdAt;

    svc.update('n1', {
      title: 'New Title',
      content: 'New Content',
      categoryId: 'cat-2',
    });

    const after = svc.notes();
    expect(after.length).toBe(2);
    const updated = svc.findById('n1')!;
    expect(updated.title).toBe('New Title');
    expect(updated.content).toBe('New Content');
    expect(updated.categoryId).toBe('cat-2');
    expect(updated.createdAt.getTime()).toBe(origCreated.getTime());
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.updatedAt!.getTime()).toBeGreaterThan(origCreated.getTime());
    // other note unchanged
    const other = svc.findById('n2')!;
    expect(other.title).toBe('Title 2');
    expect(other.content).toBe('Content 2');
  });

  it('does nothing when id is not found', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    const before = svc.notes();
    svc.update('missing', { title: 'X' });
    const after = svc.notes();
    expect(after).toEqual(before);
  });

  it('add prepends a new note to the list and schedules persistence', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    const newNote: Note = {
      id: 'n3',
      title: 'Title 3',
      content: 'Content 3',
      categoryId: 'cat-1',
      createdAt: new Date('2024-03-01T00:00:00.000Z'),
    };

    svc.add(newNote);

    const list = svc.notes();
    expect(list.length).toBe(3);
    expect(list[0]).toEqual(newNote);

    // advance debounce to ensure persistence attempted
    jest.advanceTimersByTime(200);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('removeAt removes the note at the specified index', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    // initial notes: [n1, n2]; remove index 1 -> remove n2
    svc.removeAt(1);

    const list = svc.notes();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('n1');
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('findById returns the matching note when present, otherwise undefined', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    const found = svc.findById('n2');
    expect(found).toBeTruthy();
    expect(found!.title).toBe('Title 2');

    const missing = svc.findById('nope');
    expect(missing).toBeUndefined();
  });

  it('add() refreshes from localStorage first, then prepends the new note', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    // Simulate another tab writing a newer list to storage after service initialization
    const latestRaw = [
      {
        id: 'n10',
        title: 'Latest 10',
        content: 'Latest content 10',
        categoryId: 'cat-1',
        createdAt: new Date('2024-04-01T00:00:00.000Z'),
      },
      {
        id: 'n2',
        title: 'Title 2 (latest)',
        content: 'Content 2 (latest)',
        categoryId: 'cat-2',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ];
    getItemSpy.mockImplementation((key: string) =>
      key === STORAGE_KEY ? JSON.stringify(makeStored(latestRaw)) : null
    );

    const newNote: Note = {
      id: 'n11',
      title: 'Newest',
      content: 'Newest content',
      categoryId: 'cat-1',
      createdAt: new Date('2024-05-01T00:00:00.000Z'),
    };

    svc.add(newNote);

    // Expected: notes are refreshed to latestRaw, then new note is prepended
    const expectedAfterRefresh = latestRaw.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      categoryId: n.categoryId,
      createdAt: n.createdAt,
      updatedAt: undefined,
    }));
    const list = svc.notes();
    expect(list.length).toBe(1 + expectedAfterRefresh.length);
    expect(list[0]).toEqual(newNote);
    expect(list.slice(1)).toEqual(expectedAfterRefresh);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('update() refreshes from localStorage first and applies changes on the latest snapshot', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    // The latest snapshot modifies n2 content compared to initial
    const latestRaw = [
      {
        id: 'n1',
        title: 'Title 1',
        content: 'Content 1',
        categoryId: 'cat-1',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        id: 'n2',
        title: 'Title 2',
        content: 'Content 2 (from another tab)',
        categoryId: 'cat-2',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ];
    getItemSpy.mockImplementation((key: string) =>
      key === STORAGE_KEY ? JSON.stringify(makeStored(latestRaw)) : null
    );

    svc.update('n2', { title: 'New Title 2' });

    const updated = svc.findById('n2')!;
    expect(updated.title).toBe('New Title 2');
    // Content should remain from the latest snapshot (not the original in-memory)
    expect(updated.content).toBe('Content 2 (from another tab)');
    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('gracefully handles null storage on refresh before add/update', () => {
    const svc = TestBed.runInInjectionContext(() => new NotesService());

    // Force refresh to return null
    getItemSpy.mockImplementation(() => null);

    const before = svc.notes();
    svc.update('n1', { title: 'T1 updated' });
    // Should have updated in-memory without replacing with an empty list
    const afterUpdate = svc.findById('n1')!;
    expect(afterUpdate.title).toBe('T1 updated');

    const newNote: Note = {
      id: 'n999',
      title: 'T999',
      content: 'C999',
      categoryId: 'cat-1',
      createdAt: new Date('2024-06-01T00:00:00.000Z'),
    };
    svc.add(newNote);
    const afterAdd = svc.notes();
    expect(afterAdd.length).toBe(before.length + 1); // added exactly one
    expect(afterAdd[0]).toEqual(newNote);
  });
});
