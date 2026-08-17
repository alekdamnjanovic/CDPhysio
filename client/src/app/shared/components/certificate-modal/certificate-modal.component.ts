import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CertificateDoc } from '../../../core/models/content.model';

@Component({
  selector: 'app-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="closeModal()" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <header class="modal-header">
          <div class="header-left">
            <div class="cert-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
            <div class="title-group">
              <h3>{{ title }}</h3>
              <span class="subtitle">
                @if (allDocs().length > 1) {
                  Diploma {{ activeIndex() + 1 }} of {{ allDocs().length }}: {{ currentDoc().title }}
                } @else {
                  Official Certification & Verification
                }
              </span>
            </div>
          </div>

          <div class="header-actions">
            <a
              [href]="currentDoc().url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-open-external"
              title="Open full PDF in a new tab"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Open PDF</span>
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

        <!-- Multi-PDF Navigation Tabs (when multiple diplomas exist) -->
        @if (allDocs().length > 1) {
          <div class="doc-tabs-bar">
            <button
              type="button"
              class="nav-arrow"
              [disabled]="activeIndex() === 0"
              (click)="prevDoc()"
              aria-label="Previous diploma"
            >
              ‹
            </button>
            <div class="tab-list">
              @for (doc of allDocs(); track doc.url; let i = $index) {
                <button
                  type="button"
                  class="doc-tab"
                  [class.active]="activeIndex() === i"
                  (click)="setDoc(i)"
                >
                  <span class="tab-num">{{ i + 1 }}</span>
                  <span class="tab-text">{{ doc.title }}</span>
                </button>
              }
            </div>
            <button
              type="button"
              class="nav-arrow"
              [disabled]="activeIndex() === allDocs().length - 1"
              (click)="nextDoc()"
              aria-label="Next diploma"
            >
              ›
            </button>
          </div>
        }

        <!-- Viewer Body -->
        <div class="modal-viewer">
          <object
            [data]="currentSafeUrl()"
            type="application/pdf"
            class="pdf-embed"
          >
            <iframe
              [src]="currentSafeUrl()"
              class="pdf-iframe"
              title="Certificate PDF Viewer"
            >
              <div class="pdf-fallback-card">
                <p>Your browser doesn't support inline PDF preview.</p>
                <a [href]="currentDoc().url" target="_blank" class="btn-download-direct">
                  Click here to view / download PDF
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  `,
  styleUrl: './certificate-modal.component.scss'
})
export class CertificateModalComponent {
  @Input({ required: true }) title!: string;
  @Input() fileUrl?: string;
  @Input() documents?: readonly CertificateDoc[];
  @Output() close = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly activeIndex = signal(0);

  protected readonly allDocs = computed<readonly CertificateDoc[]>(() => {
    if (this.documents && this.documents.length > 0) {
      return this.documents;
    }
    if (this.fileUrl) {
      return [{ title: this.title, url: this.fileUrl }];
    }
    return [];
  });

  protected readonly currentDoc = computed<CertificateDoc>(() => {
    const docs = this.allDocs();
    const idx = Math.min(Math.max(0, this.activeIndex()), docs.length - 1);
    return docs[idx] || { title: this.title, url: '' };
  });

  protected readonly currentSafeUrl = computed<SafeResourceUrl>(() => {
    const url = this.currentDoc().url;
    if (!url) return '';
    // Use #toolbar=0 to make viewer clean on desktop
    const cleanUrl = url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&scrollbar=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(cleanUrl);
  });

  @HostListener('window:keydown.escape')
  onEsc() {
    this.closeModal();
  }

  @HostListener('window:keydown.arrowleft')
  onArrowLeft() {
    this.prevDoc();
  }

  @HostListener('window:keydown.arrowright')
  onArrowRight() {
    this.nextDoc();
  }

  prevDoc() {
    if (this.activeIndex() > 0) {
      this.activeIndex.update(i => i - 1);
    }
  }

  nextDoc() {
    if (this.activeIndex() < this.allDocs().length - 1) {
      this.activeIndex.update(i => i + 1);
    }
  }

  setDoc(index: number) {
    this.activeIndex.set(index);
  }

  closeModal() {
    this.close.emit();
  }
}
