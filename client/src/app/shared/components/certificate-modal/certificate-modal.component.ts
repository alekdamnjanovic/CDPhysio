import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="closeModal()" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="modal-info">
            <div class="cert-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <div>
              <h3>{{ title }}</h3>
              <span class="cert-subtitle">Official Credential Diploma & Verification</span>
            </div>
          </div>

          <div class="modal-actions">
            <a
              [href]="rawUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-open-tab"
              title="Open document in a new browser tab or download"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Full Screen / Download</span>
            </a>
            <button
              type="button"
              class="btn-close"
              (click)="closeModal()"
              aria-label="Close certificate modal"
              title="Close (Esc)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <div class="modal-body">
          <iframe
            [src]="safeUrl"
            title="{{ title }} Diploma"
            width="100%"
            height="100%"
            frameborder="0"
          ></iframe>
        </div>
      </div>
    </div>
  `,
  styleUrl: './certificate-modal.component.scss'
})
export class CertificateModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) fileUrl!: string;
  @Output() close = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  get rawUrl(): string {
    return this.fileUrl;
  }

  get safeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
  }

  ngOnInit() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:keydown.escape')
  onEsc() {
    this.closeModal();
  }

  closeModal() {
    this.close.emit();
  }
}
