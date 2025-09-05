import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { CategoriesService } from '../services/categories.service';
import { SearchService } from '../services/search.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let categoriesMock: {
    addCategory: jest.Mock;
    editCategory: jest.Mock;
    selectCategory: jest.Mock;
  };
  let searchMock: { setTerm: jest.Mock; term: { set: (v: string) => void } };

  beforeEach(async () => {
    categoriesMock = {
      addCategory: jest.fn(),
      editCategory: jest.fn(),
      selectCategory: jest.fn(),
    };
    searchMock = {
      setTerm: jest.fn(),
      term: { set: (_: string) => void 0 },
    };
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [
        { provide: CategoriesService, useValue: categoriesMock },
        { provide: SearchService, useValue: searchMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saveCategory in add mode calls addCategory and closes modal', () => {
    component.modalMode.set('add');
    component.showModal.set(true);

    component.saveCategory('Work');

    expect(categoriesMock.addCategory).toHaveBeenCalledWith('Work');
    expect(categoriesMock.editCategory).not.toHaveBeenCalled();
    expect(component.showModal()).toBe(false);
  });

  it('saveCategory in edit mode with id calls editCategory and closes modal', () => {
    component.modalMode.set('edit');
    component.editingId.set('abc123');
    component.showModal.set(true);

    component.saveCategory('Renamed');

    expect(categoriesMock.editCategory).toHaveBeenCalledWith(
      'abc123',
      'Renamed'
    );
    expect(categoriesMock.addCategory).not.toHaveBeenCalled();
    expect(component.showModal()).toBe(false);
  });

  it('saveCategory in edit mode without id does not call editCategory and closes modal', () => {
    component.modalMode.set('edit');
    component.editingId.set(null);
    component.showModal.set(true);

    component.saveCategory('ShouldNotCall');

    expect(categoriesMock.editCategory).not.toHaveBeenCalled();
    expect(categoriesMock.addCategory).not.toHaveBeenCalled();
    expect(component.showModal()).toBe(false);
  });

  it('openModal in add mode sets defaults and opens modal', () => {
    component.openModal('add');

    expect(component.modalMode()).toBe('add');
    expect(component.modalInitial()).toBe('');
    expect(component.editingId()).toBeNull();
    expect(component.showModal()).toBe(true);
  });

  it('openModal in edit mode sets initial values and opens modal', () => {
    component.openModal('edit', 'Initial Name', 'id-123');

    expect(component.modalMode()).toBe('edit');
    expect(component.modalInitial()).toBe('Initial Name');
    expect(component.editingId()).toBe('id-123');
    expect(component.showModal()).toBe(true);
  });

  it('onInput forwards value to SearchService.setTerm', () => {
    const inputEl = { value: 'hello' } as HTMLInputElement;
    const ev = { target: inputEl } as unknown as Event;
    component.onInput(ev);
    expect(searchMock.setTerm).toHaveBeenCalledWith('hello');
  });

  it('toggleMenu toggles isMenuOpen signal', () => {
    expect(component.isMenuOpen()).toBe(false);
    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(true);
    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('selectCategory delegates to service and closes menu', () => {
    component.isMenuOpen.set(true);
    component.selectCategory('cat-1');
    expect(categoriesMock.selectCategory).toHaveBeenCalledWith('cat-1');
    expect(component.isMenuOpen()).toBe(false);
  });

  it('onAddCategory closes menu and opens modal in add mode', () => {
    component.isMenuOpen.set(true);
    const openSpy = jest.spyOn(component, 'openModal');
    component.onAddCategory();
    expect(component.isMenuOpen()).toBe(false);
    expect(openSpy).toHaveBeenCalledWith('add');
  });
});
