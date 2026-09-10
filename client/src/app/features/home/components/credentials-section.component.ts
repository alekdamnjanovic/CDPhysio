import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CREDENTIAL_ITEMS, ATHLETIC_ITEMS } from '../../../core/constants/content.constants';
import { CredentialItem } from '../../../core/models/content.model';
import { CertificateModalService } from '../../../core/services/certificate-modal.service';

@Component({
  selector: 'app-credentials-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credentials-section.component.html',
})
export class CredentialsSectionComponent {
  private readonly certModalService = inject(CertificateModalService);

  protected readonly credentialsList = CREDENTIAL_ITEMS;
  protected readonly athleticList = ATHLETIC_ITEMS;

  openCertificate(item: CredentialItem) {
    if (item.certificates && item.certificates.length > 0) {
      this.certModalService.open(
        item.title,
        undefined,
        undefined,
        item.certificates,
        item.defaultRotation,
      );
    } else if (item.certificateUrl) {
      this.certModalService.open(
        item.title,
        item.certificateUrl,
        item.certificateImage,
        undefined,
        item.defaultRotation,
      );
    }
  }
}
