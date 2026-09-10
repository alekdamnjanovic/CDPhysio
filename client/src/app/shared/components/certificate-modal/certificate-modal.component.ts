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
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateDoc } from '../../../core/models/content.model';

@Component({
  selector: 'app-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificate-modal.component.html',
  styleUrl: './certificate-modal.component.scss',
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
      return [
        {
          title: this.title,
          pdfUrl: pdf,
          imageUrl: img,
          defaultRotation: this.defaultRotation,
        },
      ];
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
    this.rotation.update((r) => (r + 90) % 360);
  }

  zoomIn() {
    this.zoom.update((z) => Math.min(3.0, +(z + 0.25).toFixed(2)));
  }

  zoomOut() {
    this.zoom.update((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
  }

  resetZoom() {
    this.zoom.set(1.0);
  }

  toggleZoom() {
    this.zoom.update((z) => (z === 1.0 ? 1.6 : 1.0));
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
