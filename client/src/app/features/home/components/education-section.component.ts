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
  templateUrl: './education-section.component.html',
})
export class EducationSectionComponent {
  private readonly certModalService = inject(CertificateModalService);

  protected readonly educationList = EDUCATION_ITEMS;

  openDegree(item: EducationItem) {
    if (item.certificates && item.certificates.length > 0) {
      this.certModalService.open(
        item.school + ' — ' + item.degree,
        undefined,
        undefined,
        item.certificates,
        item.defaultRotation,
      );
    } else if (item.certificateUrl) {
      this.certModalService.open(
        item.school + ' — ' + item.degree,
        item.certificateUrl,
        item.certificateImage,
        undefined,
        item.defaultRotation,
      );
    }
  }
}
