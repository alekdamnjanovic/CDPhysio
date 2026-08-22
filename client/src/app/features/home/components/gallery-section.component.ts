import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import {
  TRAINING_GALLERY_ITEMS,
  CLIENT_GALLERY_ITEMS
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
        <p>A look at the training, athletic conditioning, and great client stories.</p>
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
    </section>
  `
})
export class GallerySectionComponent {
  protected readonly trainingList = TRAINING_GALLERY_ITEMS;
  protected readonly clientList = CLIENT_GALLERY_ITEMS;
}
