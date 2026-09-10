import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../../core/directives/parallax.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RevealDirective, ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
