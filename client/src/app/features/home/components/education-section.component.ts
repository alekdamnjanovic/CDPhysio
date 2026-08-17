import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { EDUCATION_ITEMS } from '../../../core/constants/content.constants';
import { EducationItem } from '../../../core/models/content.model';
import { CertificateModalService } from '../../../core/services/certificate-modal.service';

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
          <div
            class="education-card"
            [class.has-certificate]="!!item.certificateUrl || (!!item.certificates && item.certificates.length > 0)"
            (click)="openDegree(item)"
            [attr.role]="(item.certificateUrl || (item.certificates && item.certificates.length > 0)) ? 'button' : null"
            [attr.tabindex]="(item.certificateUrl || (item.certificates && item.certificates.length > 0)) ? 0 : null"
            [attr.aria-label]="(item.certificateUrl || (item.certificates && item.certificates.length > 0)) ? 'View degree for ' + item.school : null"
            (keydown.enter)="openDegree(item)"
            (keydown.space)="openDegree(item); $event.preventDefault()"
          >
            <div class="edu-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10L12 5 2 10l10 5 10-5z"></path>
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"></path>
              </svg>
            </div>
            <div class="edu-content">
              @if (item.certificates && item.certificates.length > 1) {
                <div class="edu-badge-row">
                  <span class="edu-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="8" r="6"></circle>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                    </svg>
                    {{ item.certificates.length }} Degrees
                  </span>
                </div>
              } @else if (item.certificateUrl || (item.certificates && item.certificates.length === 1)) {
                <div class="edu-badge-row">
                  <span class="edu-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="8" r="6"></circle>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                    </svg>
                    Official Degree
                  </span>
                </div>
              }

              <h3>{{ item.school }}</h3>
              <p class="edu-degree">{{ item.degree }}</p>
              <p class="edu-detail">{{ item.detail }}</p>

              @if (item.certificateUrl || (item.certificates && item.certificates.length > 0)) {
                <div class="edu-action">
                  <span class="action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View Official Degree
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class EducationSectionComponent {
  private readonly certModalService = inject(CertificateModalService);

  protected readonly educationList = EDUCATION_ITEMS;

  openDegree(item: EducationItem) {
    if (item.certificates && item.certificates.length > 0) {
      this.certModalService.open(item.school + ' — ' + item.degree, undefined, undefined, item.certificates, item.defaultRotation);
    } else if (item.certificateUrl) {
      this.certModalService.open(item.school + ' — ' + item.degree, item.certificateUrl, item.certificateImage, undefined, item.defaultRotation);
    }
  }
}
