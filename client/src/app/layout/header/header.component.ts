import {
  Component,
  HostListener,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CLINIC_CONFIG } from '../../core/constants/clinic.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-progress" aria-hidden="true"></div>
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="nav-container">
        <a class="logo" href="/" (click)="onLogoClick($event)" aria-label="CD Physio — back to top">
          <img src="brand/CD_Logo_PNG.png" alt="CD Physio emblem" class="logo-emblem" />
          <div class="logo-brand">
            <span class="brand-name">CD PHYSIO</span>
            <span class="brand-tag">SPORTS & RECOVERY</span>
          </div>
        </a>

        <div class="nav-links">
          <a href="#about" [class.active]="activeSection() === 'about'">About</a>
          <a href="#education" [class.active]="activeSection() === 'education'">Education</a>
          <a href="#credentials" [class.active]="activeSection() === 'credentials'">Credentials</a>
          <a href="#gallery" [class.active]="activeSection() === 'gallery'">Gallery</a>
          <a href="#reviews" [class.active]="activeSection() === 'reviews'">Reviews</a>
          <a href="#contact" [class.active]="activeSection() === 'contact'">Contact</a>
          <a [href]="clinic.janeAppBookingUrl" class="btn cta" target="_blank" rel="noopener">Book Now</a>
        </div>

        <button
          class="nav-hamburger"
          [class.open]="menuOpen()"
          (click)="toggleMenu()"
          aria-label="Toggle navigation menu"
          [attr.aria-expanded]="menuOpen()"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div class="nav-drawer" [class.open]="menuOpen()">
        <a href="#about" (click)="closeMenu()">About</a>
        <a href="#education" (click)="closeMenu()">Education</a>
        <a href="#credentials" (click)="closeMenu()">Credentials</a>
        <a href="#gallery" (click)="closeMenu()">Gallery</a>
        <a href="#reviews" (click)="closeMenu()">Reviews</a>
        <a href="#contact" (click)="closeMenu()">Contact</a>
        <a [href]="clinic.janeAppBookingUrl" class="btn cta" target="_blank" rel="noopener" (click)="closeMenu()">Book Now</a>
      </div>
    </nav>
  `
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  protected readonly clinic = CLINIC_CONFIG;
  protected readonly isScrolled = signal(false);
  protected readonly activeSection = signal('');
  protected readonly menuOpen = signal(false);

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private progressEl?: HTMLElement;
  private rafId = 0;
  private sectionObserver?: IntersectionObserver;
  private readonly sectionIds = ['about', 'education', 'credentials', 'gallery', 'reviews', 'contact'];

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.progressEl = document.querySelector('.scroll-progress') as HTMLElement;
    this.update();
    this.initScrollSpy();
  }

  private initScrollSpy() {
    if (typeof IntersectionObserver === 'undefined') return;
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    this.sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver?.observe(el);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.update();
    });
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.menuOpen()) this.closeMenu();
  }

  private update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (this.progressEl) {
      this.progressEl.style.transform = `scaleX(${progress.toFixed(3)})`;
    }
    this.isScrolled.set(window.scrollY > 40);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    }
  }

  closeMenu() {
    this.menuOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  onLogoClick(event: Event) {
    event.preventDefault();
    this.closeMenu();
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.router.url === '/' || this.router.url === '') {
      scrollTop();
    } else {
      this.router.navigateByUrl('/').finally(scrollTop);
    }
  }

  ngOnDestroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.sectionObserver?.disconnect();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
