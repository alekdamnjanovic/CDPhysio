import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
