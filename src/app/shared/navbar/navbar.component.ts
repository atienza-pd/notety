import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  computed,
  signal,
  DestroyRef,
} from '@angular/core';
import { SearchService } from '../services/search.service';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { CategoriesService } from '../services/categories.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [CategoryModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public readonly title = input.required<string>();
  private readonly searchSvc = inject(SearchService);
  protected readonly categoriesSvc = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly currentUrl = signal<string>(this.router.url);
  private readonly destroyRef = inject(DestroyRef);

  // update currentUrl on navigation end
  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.currentUrl.set(this.router.url);
      });
  }
  protected readonly searchTerm = this.searchSvc.term;
  protected readonly hideSearch = computed(() => {
    const url = this.currentUrl();
    // Hide on edit-note route: /notes/:id and /notes/new
    // Allow search on /notes and /notes?view=...
    const clean = url.split('?')[0];
    return clean.startsWith('/notes/');
  });

  protected onInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.searchSvc.setTerm(value);
  }

  // dropdown ui state
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  protected selectCategory(id: string | null): void {
    this.categoriesSvc.selectCategory(id);
    this.isMenuOpen.set(false);
  }

  protected onAddCategory(): void {
    this.isMenuOpen.set(false);
    this.openModal('add');
  }

  // modal state
  protected readonly showModal = signal(false);
  protected readonly modalMode = signal<'add' | 'edit'>('add');
  protected readonly modalInitial = signal<string>('');
  protected readonly editingId = signal<string | null>(null);

  protected openModal(
    mode: 'add' | 'edit',
    initial = '',
    id: string | null = null
  ): void {
    this.modalMode.set(mode);
    this.modalInitial.set(initial);
    this.editingId.set(id);
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
  }

  protected saveCategory(name: string): void {
    const mode = this.modalMode();
    if (mode === 'add') {
      this.categoriesSvc.addCategory(name);
    } else {
      const id = this.editingId();
      if (id) {
        this.categoriesSvc.editCategory(id, name);
      }
    }
    this.showModal.set(false);
  }
}
