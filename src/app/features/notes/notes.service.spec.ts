import { TestBed } from '@angular/core/testing';
import { NotesService } from './notes.service';
import {
  CategoriesService,
  Category,
} from '../../shared/services/categories.service';
import { Note } from '../models/note.model';

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

    jest.advanceTimersByTime(200);
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
});
