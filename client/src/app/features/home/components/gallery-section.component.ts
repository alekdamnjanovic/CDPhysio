import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import {
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
        <p>A look at the training, community, client stories, and clinic environment.</p>
      </div>

      <!-- 1. Training & Movement Section -->
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
            </div>
            <figcaption class="photo-caption">
              <h4>{{ item.label }}</h4>
              <p *ngIf="item.description">{{ item.description }}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      <!-- 2. Meeting Great Clients & Community Section -->
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
            </div>
            <figcaption class="photo-caption">
              <h4>{{ item.label }}</h4>
              <p *ngIf="item.description">{{ item.description }}</p>
            </figcaption>
          </figure>
        </div>
      </div>

      <!-- 3. The Clinic Space & Facilities -->
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
