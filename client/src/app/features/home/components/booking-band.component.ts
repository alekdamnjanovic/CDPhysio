import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-booking-band',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-band.component.html',
})
export class BookingBandComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
