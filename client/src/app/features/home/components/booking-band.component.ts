import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-booking-band',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="booking-wrapper">
      <section class="booking-band reveal" appReveal aria-label="Book an appointment">
        <div class="booking-inner">
          <span class="eyebrow">Booking & Pricing</span>
          <h2>Ready to get back to doing what you love?</h2>
          <p>All appointments, pricing, and payments are handled securely through the CD Physio JaneApp portal.</p>
          <a [href]="clinic.janeAppBookingUrl" target="_blank" rel="noopener" class="btn cta btn-pulse">Book on JaneApp</a>
        </div>
      </section>
    </div>
  `
})
export class BookingBandComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
