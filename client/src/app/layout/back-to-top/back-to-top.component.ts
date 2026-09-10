import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './back-to-top.component.html',
})
export class BackToTopComponent implements OnDestroy {
  protected readonly isVisible = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private rafId = 0;

  @HostListener('window:scroll')
  onScroll() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      if (isPlatformBrowser(this.platformId)) {
        this.isVisible.set(window.scrollY > 480);
      }
    });
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
