import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { EDUCATION_ITEMS } from '../../../core/constants/content.constants';

@Component({
  selector: 'app-education-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="education" class="section reveal" appReveal>
      <div class="section-head">
        <span class="eyebrow">Education</span>
        <h2>Formal Training</h2>
        <p>The foundation behind decades of clinical practice.</p>
      </div>
      <div class="education-grid reveal-stagger">
        @for (item of educationList; track item.school) {
          <div class="education-card">
            <div class="edu-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10L12 5 2 10l10 5 10-5z"></path>
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"></path>
              </svg>
            </div>
            <div>
              <h3>{{ item.school }}</h3>
              <p class="edu-degree">{{ item.degree }}</p>
              <p class="edu-detail">{{ item.detail }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class EducationSectionComponent {
  protected readonly educationList = EDUCATION_ITEMS;
}
