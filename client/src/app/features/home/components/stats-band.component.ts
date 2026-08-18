import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CountUpDirective } from '../../../core/directives/count-up.directive';

@Component({
  selector: 'app-stats-band',
  standalone: true,
  imports: [RevealDirective, CountUpDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-wrapper">
      <section class="stats-band reveal" appReveal aria-label="Highlights">
        <div class="stats-grid reveal-stagger">
          <div class="stat">
            <span class="stat-value" [appCountUp]="2">0</span>
            <span class="stat-label">University Degrees</span>
          </div>
          <div class="stat">
            <span class="stat-value" [appCountUp]="16" appCountUpSuffix="+">0</span>
            <span class="stat-label">Specialized Certifications</span>
          </div>
          <div class="stat">
            <span class="stat-value" [appCountUp]="30" appCountUpSuffix="+">0</span>
            <span class="stat-label">Years With Elite Athletes</span>
          </div>
          <div class="stat">
            <span class="stat-value">BC</span>
            <span class="stat-label">Registered Physiotherapy</span>
          </div>
        </div>
      </section>
    </div>
  `
})
export class StatsBandComponent {}
