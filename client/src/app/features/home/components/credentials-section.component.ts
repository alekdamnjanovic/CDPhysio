import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CREDENTIAL_ITEMS, ATHLETIC_ITEMS } from '../../../core/constants/content.constants';
import { CredentialItem } from '../../../core/models/content.model';
import { CertificateModalComponent } from '../../../shared/components/certificate-modal/certificate-modal.component';

@Component({
  selector: 'app-credentials-section',
  standalone: true,
  imports: [RevealDirective, CertificateModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="credentials" class="section section-alt reveal" appReveal>
      <div class="section-head">
        <span class="eyebrow">Credentials</span>
        <h2>Certifications & Advanced Training</h2>
        <p>Continuous learning in manual therapy, movement science, and performance.</p>
      </div>

      <div class="credential-grid reveal-stagger">
        @for (item of credentialsList; track item.title) {
          <div
            class="credential-card"
            [class.has-certificate]="!!item.certificateUrl"
            (click)="openCertificate(item)"
            [attr.role]="item.certificateUrl ? 'button' : null"
            [attr.tabindex]="item.certificateUrl ? 0 : null"
            [attr.aria-label]="item.certificateUrl ? 'View certificate for ' + item.title : null"
            (keydown.enter)="openCertificate(item)"
            (keydown.space)="openCertificate(item); $event.preventDefault()"
          >
            @if (item.certificateUrl) {
              <div class="cert-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="8" r="6"></circle>
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
                <span>Diploma Available</span>
              </div>
            }

            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>

            @if (item.certificateUrl) {
              <div class="cert-action">
                <span class="action-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  View Official Certificate
                </span>
              </div>
            } @else if (item.url) {
              <a [href]="item.url" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
                {{ item.urlLabel || item.url }}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            }
          </div>
        }
      </div>

      <div class="subhead">
        <h3>Athletics & Coaching</h3>
      </div>

      <div class="athletics-grid reveal-stagger">
        @for (item of athleticList; track item.title) {
          <div class="athletic-card">
            @if (item.iconType === 'csia') {
              <svg class="athletic-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            } @else if (item.iconType === 'nccp') {
              <svg class="athletic-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            } @else {
              <svg class="athletic-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            }
            <h3>{{ item.title }}</h3>
            <p>{{ item.role }}</p>
          </div>
        }
      </div>

      @if (activeCertificate(); as cert) {
        <app-certificate-modal
          [title]="cert.title"
          [fileUrl]="cert.url"
          (close)="closeCertificate()"
        ></app-certificate-modal>
      }
    </section>
  `
})
export class CredentialsSectionComponent {
  protected readonly credentialsList = CREDENTIAL_ITEMS;
  protected readonly athleticList = ATHLETIC_ITEMS;
  protected readonly activeCertificate = signal<{ title: string; url: string } | null>(null);

  openCertificate(item: CredentialItem) {
    if (item.certificateUrl) {
      this.activeCertificate.set({
        title: item.title,
        url: item.certificateUrl
      });
    }
  }

  closeCertificate() {
    this.activeCertificate.set(null);
  }
}
