import { Component, input, inject, computed } from '@angular/core';
import { SearchService } from '../services/search.service';
import { NavigationEnd, Router } from '@angular/router';
import { signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public readonly title = input.required<string>();
  private readonly searchSvc = inject(SearchService);
  private readonly router = inject(Router);
  private readonly currentUrl = signal<string>(this.router.url);
  // update currentUrl on navigation end
  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.currentUrl.set(this.router.url);
      }
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
}
