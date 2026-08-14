import { Directive, ElementRef, inject, Input, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  @Input() depth = 0.15;

  private element = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private rafId = 0;
  private reducedMotion = false;
  private update = () => {};

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      return;
    }

    const el = this.element.nativeElement;

    this.update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }
      el.style.transform = `translate3d(0, ${(-window.scrollY * this.depth).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (this.rafId) {
        return;
      }
      this.rafId = requestAnimationFrame(() => {
        this.rafId = 0;
        this.update();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    this.rafId = requestAnimationFrame(this.update);

    this.destroy = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
    };
  }

  private destroy = () => {};

  ngOnDestroy() {
    this.destroy();
  }
}
