import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="footer-container">
        <div class="footer-brand">
          <div class="logo">
            <img src="logo.png" alt="CD Physio Logo">
            CD Physio
          </div>
          <p>Vernon's premium destination for physical rehabilitation and athletic longevity.</p>
        </div>
        <div class="footer-legal">
          <p>&copy; 2026 CD Physio. All rights reserved.</p>
          <p><small>Payment, booking details, and official legislation policies are securely hosted via our <a href="https://cdphysio.janeapp.com/#/staff_member/1" target="_blank">JaneApp Portal</a>.</small></p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
