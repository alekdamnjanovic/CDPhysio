import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
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
            <!-- Zoom Controls -->
            <div class="zoom-controls" role="group" aria-label="Zoom controls">
              <button
                type="button"
                class="btn-zoom"
                (click)="zoomOut()"
                [disabled]="zoom() <= 0.75"
                title="Zoom Out (-)"
                aria-label="Zoom out"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              <button
                type="button"
                class="btn-zoom-level"
                (click)="resetZoom()"
                title="Reset zoom to 100% (0)"
                aria-label="Reset zoom"
              >
                {{ zoomPercent() }}%
              </button>

              <button
                type="button"
                class="btn-zoom"
                (click)="zoomIn()"
                [disabled]="zoom() >= 3"
                title="Zoom In (+)"
                aria-label="Zoom in"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <!-- Rotate Button -->
            <button
              type="button"
              class="btn-rotate"
              (click)="rotate()"
              title="Rotate 90° (R)"
              aria-label="Rotate diploma image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
              <span>Rotate</span>
            </button>

            @if (currentDoc().pdfUrl) {
              <a
                [href]="currentDoc().pdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-open-external"
                title="Download original vector PDF diploma"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download PDF</span>
              </a>
            }

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
              @for (doc of allDocs(); track doc.pdfUrl || doc.imageUrl; let i = $index) {
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

        <!-- Viewer Body (High-Res Web Image Viewer with instant load, smooth rotation, and zoom inspection) -->
        <div
          class="modal-viewer"
          [class.is-zoomed]="zoom() > 1"
          (wheel)="onWheelZoom($event)"
        >
          <div
            class="cert-image-wrap"
            (dblclick)="toggleZoom()"
            title="Double-click to toggle 1.5x zoom"
          >
            @if (currentDoc().imageUrl) {
              <img
                [src]="currentDoc().imageUrl"
                [alt]="title + ' Official Diploma'"
                class="diploma-image"
                [style.transform]="'rotate(' + rotation() + 'deg) scale(' + zoom() + ')'"
                loading="eager"
              />
            } @else if (currentDoc().pdfUrl) {
              <div class="fallback-viewer">
                <p>Official Diploma Document</p>
                <a [href]="currentDoc().pdfUrl" target="_blank" class="btn-download-direct">
                  Open Official PDF
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './certificate-modal.component.scss'
})
export class CertificateModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input() fileUrl?: string;
  @Input() imageUrl?: string;
  @Input() defaultRotation = 0;
  @Input() documents?: readonly CertificateDoc[];
  @Output() close = new EventEmitter<void>();

  protected readonly activeIndex = signal(0);
  protected readonly rotation = signal(0);
  protected readonly zoom = signal(1.0);

  protected readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));

  protected readonly allDocs = computed<readonly CertificateDoc[]>(() => {
    if (this.documents && this.documents.length > 0) {
      return this.documents;
    }
    const pdf = this.fileUrl || '';
    const img = this.imageUrl || (pdf ? pdf.replace(/\.pdf$/i, '.webp') : '');
    if (pdf || img) {
      return [{
        title: this.title,
        pdfUrl: pdf,
        imageUrl: img,
        defaultRotation: this.defaultRotation
      }];
    }
    return [];
  });

  protected readonly currentDoc = computed<CertificateDoc>(() => {
    const docs = this.allDocs();
    const idx = Math.min(Math.max(0, this.activeIndex()), docs.length - 1);
    return docs[idx] || { title: this.title, pdfUrl: '', imageUrl: '' };
  });

  ngOnInit() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    const initDoc = this.allDocs()[0];
    this.rotation.set(initDoc?.defaultRotation ?? this.defaultRotation ?? 0);
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

  @HostListener('window:keydown.arrowleft')
  onArrowLeft() {
    this.prevDoc();
  }

  @HostListener('window:keydown.arrowright')
  onArrowRight() {
    this.nextDoc();
  }

  @HostListener('window:keydown.r')
  onRotateKey() {
    this.rotate();
  }

  @HostListener('window:keydown.+')
  @HostListener('window:keydown.=')
  onZoomInKey() {
    this.zoomIn();
  }

  @HostListener('window:keydown.-')
  @HostListener('window:keydown._')
  onZoomOutKey() {
    this.zoomOut();
  }

  @HostListener('window:keydown.0')
  onResetZoomKey() {
    this.resetZoom();
  }

  rotate() {
    this.rotation.update(r => (r + 90) % 360);
  }

  zoomIn() {
    this.zoom.update(z => Math.min(3.0, +(z + 0.25).toFixed(2)));
  }

  zoomOut() {
    this.zoom.update(z => Math.max(0.75, +(z - 0.25).toFixed(2)));
  }

  resetZoom() {
    this.zoom.set(1.0);
  }

  toggleZoom() {
    this.zoom.update(z => (z === 1.0 ? 1.6 : 1.0));
  }

  onWheelZoom(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
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
    const doc = this.allDocs()[index];
    this.rotation.set(doc?.defaultRotation ?? this.defaultRotation ?? 0);
    this.resetZoom();
  }

  closeModal() {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.close.emit();
  }
}
