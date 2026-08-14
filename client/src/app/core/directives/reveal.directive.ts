import { Directive, ElementRef, inject, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private element = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    const el = this.element.nativeElement;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('reveal-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('reveal-visible', entry.isIntersecting);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
    );

    this.observer.observe(el);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
