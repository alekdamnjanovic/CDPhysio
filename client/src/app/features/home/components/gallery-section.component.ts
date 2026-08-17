import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { GALLERY_ITEMS } from '../../../core/constants/gallery.constants';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="gallery" class="gallery-section section reveal" appReveal>
      <div class="section-head">
        <span class="eyebrow">Gallery</span>
        <h2>Inside CD Physio</h2>
        <p>A look at the space, the work, and the community behind the care.</p>
      </div>
      <div class="gallery-wrap">
        <button class="gallery-arrow prev" type="button" aria-label="Previous photos" (click)="scrollGallery(-1)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="gallery-track" #galleryTrack>
          @for (item of galleryList; track item.label) {
            <figure class="gallery-card">
              <img [src]="item.src" [alt]="item.alt" loading="lazy" />
              <figcaption>{{ item.label }}</figcaption>
            </figure>
          }
        </div>
        <button class="gallery-arrow next" type="button" aria-label="Next photos" (click)="scrollGallery(1)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  `
})
export class GallerySectionComponent {
  @ViewChild('galleryTrack') private galleryTrack?: ElementRef<HTMLElement>;
  protected readonly galleryList = GALLERY_ITEMS;

  scrollGallery(direction: number) {
    const track = this.galleryTrack?.nativeElement;
    if (!track) return;
    const card = track.querySelector('.gallery-card') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }
}
