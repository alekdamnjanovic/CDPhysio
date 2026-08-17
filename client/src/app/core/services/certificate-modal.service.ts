import { Injectable, signal } from '@angular/core';
import { CertificateDoc } from '../models/content.model';

export interface ModalCertificateData {
  title: string;
  url?: string;
  imageUrl?: string;
  documents?: readonly CertificateDoc[];
}

@Injectable({
  providedIn: 'root'
})
export class CertificateModalService {
  readonly activeModal = signal<ModalCertificateData | null>(null);

  open(title: string, url?: string, imageUrl?: string, documents?: readonly CertificateDoc[]) {
    this.activeModal.set({ title, url, imageUrl, documents });
  }

  close() {
    this.activeModal.set(null);
  }
}
