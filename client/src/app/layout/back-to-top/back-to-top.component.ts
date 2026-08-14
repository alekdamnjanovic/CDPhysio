import { Component, HostListener, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  template: `
    <button
      class="back-to-top"
      [class.visible]="isVisible"
      type="button"
      aria-label="Back to top"
      (click)="scrollToTop()"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </button>
  `
})
export class BackToTopComponent implements OnDestroy {
  isVisible = false;

  private platformId = inject(PLATFORM_ID);
  private rafId = 0;

  @HostListener('window:scroll')
  onScroll() {
    if (this.rafId) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      if (isPlatformBrowser(this.platformId)) {
        this.isVisible = window.scrollY > 480;
      }
    });
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}