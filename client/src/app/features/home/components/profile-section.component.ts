import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-section.component.html',
})
export class ProfileSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
