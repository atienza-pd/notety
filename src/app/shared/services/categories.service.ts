import { Injectable, signal, computed, effect } from '@angular/core';
import { createGuid } from '../utils/guid';

export interface Category {
  id: string;
  Name: string;
}

/**
 * CategoriesService manages the list of note categories and the currently selected category.
 * It persists to localStorage and seeds defaults on first run.
 */
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private static readonly STORAGE_KEY = 'notety.categories';
  private static readonly DEFAULTS: string[] = [
    'Personal',
    'Work',
    'Ideas',
    'Todo',
    'Archive',
  ];

  readonly categories = signal<Category[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed<Category | null>(() => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }

    return this.categories().find((c) => c.id === id) ?? null;
  });
  readonly hasCategories = computed(() => this.categories().length > 0);

  constructor() {
    // initialize from storage or seed
    const stored = this.readCategories(CategoriesService.STORAGE_KEY);
    if (stored.length === 0) {
      const seeded = CategoriesService.DEFAULTS.map((Name) => ({
        id: createGuid(),
        Name,
      }));
      this.categories.set(seeded);
      this.persistCategories();
    } else {
      this.categories.set(stored);
    }

    // Do not initialize selected from storage; start with no selection.
    this.selectedId.set(null);

    // persist on changes
    effect(() => {
      this.persistCategories();
    });
    // Do not persist selected category.
  }

  selectCategory(id: string | null): void {
    if (id === null) {
      this.selectedId.set(null);
      return;
    }
    if (!this.categories().some((c) => c.id === id)) return;
    this.selectedId.set(id);
  }

  addCategory(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = this.categories();
    if (list.some((c) => c.Name.toLowerCase() === trimmed.toLowerCase())) {
      // already exists (case-insensitive) -> just select existing
      const existing = list.find(
        (c) => c.Name.toLowerCase() === trimmed.toLowerCase()
      )!;
      this.selectedId.set(existing.id);
      return;
    }
    const created: Category = { id: createGuid(), Name: trimmed };
    this.categories.set([...list, created]);
    this.selectedId.set(created.id);
  }

  editCategory(id: string, newName: string): void {
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }

    const list = this.categories();
    const idx = list.findIndex((c) => c.id === id);

    if (idx < 0) {
      return;
    }

    // prevent duplicate names (case-insensitive)
    const duplicate = list.some(
      (c, i) => i !== idx && c.Name.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      // if duplicate, just select the duplicate target
      const existing = list.find(
        (c, i) => i !== idx && c.Name.toLowerCase() === trimmed.toLowerCase()
      )!;
      this.selectedId.set(existing.id);
      return;
    }
    const next = [...list];
    next[idx] = { ...next[idx], Name: trimmed };
    this.categories.set(next);
  }

  // persistence helpers
  private persistCategories(): void {
    try {
      localStorage.setItem(
        CategoriesService.STORAGE_KEY,
        JSON.stringify(this.categories())
      );
    } catch {}
  }

  private readCategories(key: string): Category[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const arr: unknown = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // Legacy array of strings -> migrate to objects
      if ((arr as unknown[]).every((x) => typeof x === 'string')) {
        return (arr as string[]).map((Name) => ({ id: createGuid(), Name }));
      }
      // Current shape
      const isObj = (v: unknown): v is Record<string, unknown> =>
        typeof v === 'object' && v !== null;
      const isCategoryLike = (
        v: unknown
      ): v is { id: unknown; Name: unknown } =>
        isObj(v) && 'id' in v && 'Name' in v;
      return (arr as unknown[]).filter(isCategoryLike).map((x) => {
        const obj = x as Record<string, unknown>;
        return { id: String(obj['id']), Name: String(obj['Name']) } as Category;
      });
    } catch {
      return [];
    }
  }
}
