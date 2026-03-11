import { TestBed } from '@angular/core/testing';
import { CategoriesService, Category } from './categories.service';

describe('CategoriesService addCategory', () => {
  const STORAGE_KEY = 'notety.categories';
  const initial: Category[] = [
    { id: '1', Name: 'Alpha' },
    { id: '2', Name: 'Beta' },
  ];

  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    // Mock localStorage to return a deterministic initial list, preventing seeding defaults
    getItemSpy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(initial);
        return null;
      });
    setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a new trimmed category and selects it', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    expect(svc.categories().length).toBe(2);
    expect(svc.selectedId()).toBeNull();

    svc.addCategory('  Gamma  ');

    const cats = svc.categories();
    expect(cats.length).toBe(3);
    const gamma = cats.find((c) => c.Name === 'Gamma');
    expect(gamma).toBeTruthy();
    expect(svc.selectedId()).toBe(gamma!.id);
  });

  it('does not add duplicate (case-insensitive) and selects existing', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    expect(svc.categories().length).toBe(2);

    svc.addCategory('alpha');

    const cats = svc.categories();
    expect(cats.length).toBe(2); // no new item
    expect(svc.selectedId()).toBe('1'); // selects existing Alpha
  });

  it('ignores empty/whitespace names', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    expect(svc.categories().length).toBe(2);
    expect(svc.selectedId()).toBeNull();

    svc.addCategory('   ');

    expect(svc.categories().length).toBe(2);
    expect(svc.selectedId()).toBeNull();
  });
});

describe('CategoriesService editCategory', () => {
  const STORAGE_KEY = 'notety.categories';
  const initial: Category[] = [
    { id: '1', Name: 'Alpha' },
    { id: '2', Name: 'Beta' },
  ];

  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    getItemSpy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(initial);
        return null;
      });
    setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renames category when id exists and newName is valid (trim applied)', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());

    svc.editCategory('2', '  Gamma  ');

    const cats = svc.categories();
    expect(cats.length).toBe(2);
    expect(cats.find((c) => c.id === '2')!.Name).toBe('Gamma');
    expect(cats.find((c) => c.id === '1')!.Name).toBe('Alpha');
    expect(svc.selectedId()).toBeNull();
  });

  it('does nothing when id does not exist', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    const before = svc.categories();

    svc.editCategory('999', 'Gamma');

    expect(svc.categories()).toEqual(before);
    expect(svc.selectedId()).toBeNull();
  });

  it('ignores empty/whitespace newName', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    const before = svc.categories();

    svc.editCategory('1', '   ');

    expect(svc.categories()).toEqual(before);
    expect(svc.selectedId()).toBeNull();
  });

  it('selects existing duplicate when renaming to an existing name (case-insensitive)', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());

    svc.editCategory('1', 'beta');

    const cats = svc.categories();
    // No changes to names
    expect(cats.find((c) => c.id === '1')!.Name).toBe('Alpha');
    expect(cats.find((c) => c.id === '2')!.Name).toBe('Beta');
    // Should select the existing duplicate target
    expect(svc.selectedId()).toBe('2');
  });
});

describe('CategoriesService selectCategory', () => {
  const STORAGE_KEY = 'notety.categories';
  const initial: Category[] = [
    { id: '1', Name: 'Alpha' },
    { id: '2', Name: 'Beta' },
  ];

  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    getItemSpy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return JSON.stringify(initial);
        return null;
      });
    setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sets selectedId when id exists', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    expect(svc.selectedId()).toBeNull();

    svc.selectCategory('1');

    expect(svc.selectedId()).toBe('1');
    expect(svc.selected()!.Name).toBe('Alpha');
  });

  it('clears selection when passing null', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    svc.selectCategory('2');
    expect(svc.selectedId()).toBe('2');

    svc.selectCategory(null);

    expect(svc.selectedId()).toBeNull();
    expect(svc.selected()).toBeNull();
  });

  it('does nothing when id does not exist (no prior selection)', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    expect(svc.selectedId()).toBeNull();

    svc.selectCategory('999');

    expect(svc.selectedId()).toBeNull();
    expect(svc.selected()).toBeNull();
  });

  it('does nothing when id does not exist (keeps prior selection)', () => {
    const svc = TestBed.runInInjectionContext(() => new CategoriesService());
    svc.selectCategory('1');
    expect(svc.selectedId()).toBe('1');

    svc.selectCategory('999');

    expect(svc.selectedId()).toBe('1');
    expect(svc.selected()!.Name).toBe('Alpha');
  });
});
