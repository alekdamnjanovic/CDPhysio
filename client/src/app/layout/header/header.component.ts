import { Component, HostListener, OnDestroy, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <div class="scroll-progress" aria-hidden="true"></div>
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <a class="logo" href="/" (click)="onLogoClick($event)" aria-label="CD Physio — back to top">
          <img src="CD_Logo_PNG.png" alt="CD Physio">
        </a>
        <div class="nav-links">
          <a href="#about" [class.active]="activeSection === 'about'">About</a>
          <a href="#education" [class.active]="activeSection === 'education'">Education</a>
          <a href="#credentials" [class.active]="activeSection === 'credentials'">Credentials</a>
          <a href="#gallery" [class.active]="activeSection === 'gallery'">Gallery</a>
          <a href="#reviews" [class.active]="activeSection === 'reviews'">Reviews</a>
          <a href="#contact" [class.active]="activeSection === 'contact'">Contact</a>
          <a href="https://cdphysio.janeapp.com/#/staff_member/1" class="btn cta" target="_blank">Book Now</a>
        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  isScrolled = false;
  activeSection = '';

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private progressEl?: HTMLElement;
  private rafId = 0;
  private sectionObserver?: IntersectionObserver;
  private readonly sectionIds = ['about', 'education', 'credentials', 'gallery', 'reviews', 'contact'];

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.progressEl = document.querySelector('.scroll-progress') as HTMLElement;
    this.update();
    this.initScrollSpy();
  }

  private initScrollSpy() {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    this.sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        this.sectionObserver?.observe(el);
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.rafId) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.update();
    });
  }

  private update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

    if (this.progressEl) {
      this.progressEl.style.transform = `scaleX(${progress.toFixed(3)})`;
    }
    this.isScrolled = window.scrollY > 40;
  }

  onLogoClick(event: Event) {
    event.preventDefault();
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.router.url === '/' || this.router.url === '') {
      scrollTop();
    } else {
      this.router.navigateByUrl('/').finally(scrollTop);
    }
  }

  ngOnDestroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.sectionObserver?.disconnect();
  }
}
