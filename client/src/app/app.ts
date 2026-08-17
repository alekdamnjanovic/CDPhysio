import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ChatAssistantComponent } from './features/chat/chat-assistant.component';
import { BackToTopComponent } from './layout/back-to-top/back-to-top.component';
import { CertificateModalComponent } from './shared/components/certificate-modal/certificate-modal.component';
import { CertificateModalService } from './core/services/certificate-modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ChatAssistantComponent,
    BackToTopComponent,
    CertificateModalComponent
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-chat-assistant></app-chat-assistant>
    <app-back-to-top></app-back-to-top>

    @if (certModalService.activeModal(); as modal) {
      <app-certificate-modal
        [title]="modal.title"
        [fileUrl]="modal.url"
        [imageUrl]="modal.imageUrl"
        [defaultRotation]="modal.defaultRotation || 0"
        [documents]="modal.documents"
        (close)="certModalService.close()"
      ></app-certificate-modal>
    }
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly certModalService = inject(CertificateModalService);
}