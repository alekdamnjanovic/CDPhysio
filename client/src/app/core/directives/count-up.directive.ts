import { Directive, ElementRef, inject, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  @Input() appCountUp = 0;
  @Input() appCountUpSuffix = '';

  private element = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private rafId = 0;

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined' || this.prefersReducedMotion()) {
      this.render(this.appCountUp);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.animate();
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.6 },
    );

    this.observer.observe(this.element.nativeElement);
  }

  private animate() {
    const target = this.appCountUp;
    const duration = 1400;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.render(Math.round(eased * target));

      if (progress < 1) {
        this.rafId = requestAnimationFrame(step);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  private render(value: number) {
    this.element.nativeElement.textContent = value + this.appCountUpSuffix;
  }

  private prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
