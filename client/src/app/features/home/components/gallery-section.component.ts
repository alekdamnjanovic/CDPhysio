import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import {
  ELITE_HIGHLIGHT,
  TRAINING_GALLERY_ITEMS,
  CLIENT_GALLERY_ITEMS,
  CLINIC_GALLERY_ITEMS
} from '../../../core/constants/gallery.constants';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [RevealDirective, NgFor, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="gallery" class="gallery-section section reveal" appReveal>
      <div class="section-head">
        <span class="eyebrow">Moments & Community</span>
        <h2>Inside CD Physio</h2>
        <p>A look at the community, training, client stories, and clinic environment.</p>
      </div>

      <!-- 1. Special Highlight (Novak Djokovic - Humble thank you) -->
      <div class="elite-spotlight reveal" appReveal>
        <div class="spotlight-media">
          <div class="spotlight-img-wrap">
            <picture>
              <source srcset="gallery/highlights/Selfie_Novak.webp" type="image/webp" />
              <img
                src="gallery/highlights/Selfie_Novak.jpg"
                [alt]="eliteHighlight.imageAlt"
                loading="lazy"
                class="spotlight-img"
              />
            </picture>
            <div class="spotlight-badge">
              <span>{{ eliteHighlight.badge }}</span>
            </div>
          </div>
        </div>

        <div class="spotlight-content">
          <span class="spotlight-subtitle">{{ eliteHighlight.subtitle }}</span>
          <h3>{{ eliteHighlight.title }}</h3>

          <blockquote class="spotlight-quote">
            <svg class="quote-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p>{{ eliteHighlight.thankYouNote }}</p>
          </blockquote>
        </div>
      </div>

      <!-- 2. Training & Movement Section -->
      <div class="gallery-subsection reveal" appReveal>
        <div class="subsection-head">
          <span class="subsection-eyebrow">Active Rehab</span>
          <h3>Training & Movement</h3>
          <p>Targeted exercise therapy, athletic conditioning, and functional movement retraining.</p>
        </div>

        <div class="cards-grid training-grid reveal-stagger">
          <figure *ngFor="let item of trainingList" class="photo-card">
            <div class="photo-img-wrap">
              <img [src]="item.src" [alt]="item.alt" loading="lazy" />
              <div class="photo-overlay">
                <span class="photo-tag">{{ item.label }}</span>
              </div>
            </div>
            <figcaption class="photo-caption">
              <h4>{{ item.label }}</h4>
              <p *ngIf="item.description">{{ item.description }}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      <!-- 3. Meeting Great Clients Section -->
      <div class="gallery-subsection reveal" appReveal>
        <div class="subsection-head">
          <span class="subsection-eyebrow">Community</span>
          <h3>Meeting Great Clients</h3>
          <p>Every recovery journey is personal — dedicated one-on-one care tailored to your goals.</p>
        </div>

        <div class="cards-grid clients-grid reveal-stagger">
          <figure *ngFor="let item of clientList" class="photo-card">
            <div class="photo-img-wrap">
              <img [src]="item.src" [alt]="item.alt" loading="lazy" />
              <div class="photo-overlay">
                <span class="photo-tag">{{ item.label }}</span>
              </div>
            </div>
            <figcaption class="photo-caption">
              <h4>{{ item.label }}</h4>
              <p *ngIf="item.description">{{ item.description }}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      <!-- 4. The Clinic Space & Facilities -->
      <div class="gallery-subsection clinic-facility-section reveal" appReveal>
        <div class="subsection-head">
          <span class="subsection-eyebrow">Our Space</span>
          <h3>The Clinic Environment</h3>
          <p>Inside HBIQ Sports in Vernon, BC — equipped for private manual therapy and active rehab.</p>
        </div>

        <div class="gallery-wrap">
          <button class="gallery-arrow prev" type="button" aria-label="Previous photos" (click)="scrollGallery(-1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="gallery-track" #galleryTrack>
            <figure *ngFor="let item of clinicList" class="gallery-card">
              <img [src]="item.src" [alt]="item.alt" loading="lazy" />
              <figcaption>{{ item.label }}</figcaption>
            </figure>
          </div>
          <button class="gallery-arrow next" type="button" aria-label="Next photos" (click)="scrollGallery(1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `
})
export class GallerySectionComponent {
  @ViewChild('galleryTrack') private galleryTrack?: ElementRef<HTMLElement>;

  protected readonly eliteHighlight = ELITE_HIGHLIGHT;
  protected readonly trainingList = TRAINING_GALLERY_ITEMS;
  protected readonly clientList = CLIENT_GALLERY_ITEMS;
  protected readonly clinicList = CLINIC_GALLERY_ITEMS;

  scrollGallery(direction: number) {
    const track = this.galleryTrack?.nativeElement;
    if (!track) return;
    const card = track.querySelector('.gallery-card') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }
}
