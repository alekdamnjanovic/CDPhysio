import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../../core/directives/parallax.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RevealDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero-wrapper">
      <div class="hero-particles" aria-hidden="true">
        <span class="particle p1"></span>
        <span class="particle p2"></span>
        <span class="particle p3"></span>
        <span class="particle p4"></span>
        <span class="particle p5"></span>
        <span class="particle p6"></span>
        <span class="particle p7"></span>
        <span class="particle p8"></span>
      </div>

      <div class="hero-orb orb-1" aria-hidden="true"></div>
      <div class="hero-orb orb-2" aria-hidden="true"></div>

      <section class="hero reveal" appReveal>
        <div class="hero-content">
          <span class="tagline">{{ clinic.tagline }}</span>
          <h1>{{ clinic.heroHeading }}</h1>
          <p>{{ clinic.heroDescription }}</p>
          <div class="hero-actions">
            <a href="#about" class="btn secondary">Meet the Practitioner</a>
            <a [href]="clinic.janeAppBookingUrl" target="_blank" rel="noopener" class="btn cta">Book Now</a>
          </div>
        </div>

        <div class="hero-visual" appParallax>
          <div class="visual-card">
            <img src="CD_Logo_PNG.png" alt="CD Physio logo" />
          </div>
          <div class="visual-accent a1" aria-hidden="true"></div>
          <div class="visual-accent a2" aria-hidden="true"></div>
        </div>
      </section>
    </div>
  `
})
export class HeroSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
