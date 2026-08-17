import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
              title="Open full PDF file in a new tab"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Download PDF</span>
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

        <!-- Viewer Body (HTML5 Canvas Rendering) -->
        <div class="modal-viewer">
          @if (isLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Rendering official diploma…</span>
            </div>
          }

          @if (hasError()) {
            <div class="error-state">
              <p>Unable to preview document inline.</p>
              <a [href]="currentDoc().url" target="_blank" class="btn-fallback">
                Open PDF Document
              </a>
            </div>
          }

          <div class="canvas-scroll-wrap" [class.hidden]="isLoading() || hasError()">
            <canvas #pdfCanvas class="pdf-canvas"></canvas>
          </div>

          @if (totalPages() > 1) {
            <div class="page-controls">
              <button
                type="button"
                [disabled]="currentPage() <= 1"
                (click)="prevPage()"
                class="page-btn"
              >
                ‹ Prev
              </button>
              <span class="page-info">Page {{ currentPage() }} of {{ totalPages() }}</span>
              <button
                type="button"
                [disabled]="currentPage() >= totalPages()"
                (click)="nextPage()"
                class="page-btn"
              >
                Next ›
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './certificate-modal.component.scss'
})
export class CertificateModalComponent implements OnInit, AfterViewInit, OnChanges {
  @Input({ required: true }) title!: string;
  @Input() fileUrl?: string;
  @Input() documents?: readonly CertificateDoc[];
  @Output() close = new EventEmitter<void>();

  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;

  protected readonly activeIndex = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);

  private currentPdfDoc: any = null;

  private async loadCurrentPdf() {
    const doc = this.currentDoc();
    if (!doc || !doc.url || typeof window === 'undefined') return;

    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      const absoluteUrl = doc.url.startsWith('/') ? doc.url : `/${doc.url}`;

      const loadingTask = pdfjsLib.getDocument({
        url: absoluteUrl
      });

      const pdf = await loadingTask.promise;
      this.currentPdfDoc = pdf;
      this.totalPages.set(pdf.numPages);
      this.currentPage.set(1);

      await this.renderPage(pdf, 1);
    } catch (err) {
      console.error('Error rendering PDF with PDF.js:', err);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async renderPage(pdf: any, pageNum: number) {
    if (!this.pdfCanvas) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = this.pdfCanvas.nativeElement;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Render at crisp high resolution (1.75x or devicePixelRatio)
      const scale = Math.max(window.devicePixelRatio || 1, 1.75);
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport
      };

      await page.render(renderContext).promise;
    } catch (renderErr) {
      console.error('Page render error:', renderErr);
      this.hasError.set(true);
    }
  }

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

  ngOnInit() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit() {
    this.loadCurrentPdf();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['fileUrl'] || changes['documents'] || changes['title']) && this.pdfCanvas) {
      this.loadCurrentPdf();
    }
  }

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
      this.setDoc(this.activeIndex() - 1);
    }
  }

  nextDoc() {
    if (this.activeIndex() < this.allDocs().length - 1) {
      this.setDoc(this.activeIndex() + 1);
    }
  }

  setDoc(index: number) {
    this.activeIndex.set(index);
    this.loadCurrentPdf();
  }

  async prevPage() {
    if (this.currentPage() > 1 && this.currentPdfDoc) {
      this.currentPage.update(p => p - 1);
      await this.renderPage(this.currentPdfDoc, this.currentPage());
    }
  }

  async nextPage() {
    if (this.currentPage() < this.totalPages() && this.currentPdfDoc) {
      this.currentPage.update(p => p + 1);
      await this.renderPage(this.currentPdfDoc, this.currentPage());
    }
  }

  closeModal() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.close.emit();
  }
}
