import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  // raw term updates immediately on input
  readonly term = signal<string>('');
  // debounced term used by consumers to avoid filtering too often
  readonly debouncedTerm = signal<string>('');

  private readonly debounceMs = 300;

  // keep a debounced mirror of `term`
  private readonly debounceEffect = effect((onCleanup) => {
    const value = this.term();
    const handle = setTimeout(
      () => this.debouncedTerm.set(value),
      this.debounceMs
    );
    onCleanup(() => clearTimeout(handle));
  });

  setTerm(value: string): void {
    this.term.set(value);
  }
}
