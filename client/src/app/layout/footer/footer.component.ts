import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="footer-container">
        <div class="footer-brand">
          <div class="logo">
            <img src="CD_Logo_PNG.png" alt="CD Physio Logo">
            CD Physio
          </div>
          <p>Vernon's premium destination for physical rehabilitation, athletic performance, and lasting recovery.</p>
          <div class="footer-social">
            <a href="https://www.instagram.com/cdphysio.performance" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://cdphysio.janeapp.com/#/staff_member/1" target="_blank" rel="noopener" aria-label="Book on JaneApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </a>
          </div>
        </div>
        <div class="footer-links">
          <h4>Navigate</h4>
          <a href="#about">About</a>
          <a href="#education">Education</a>
          <a href="#credentials">Credentials</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
      <div class="footer-legal">
        <p>&copy; 2026 CD Physio. All rights reserved.</p>
        <p><small>Payments &amp; booking via <a href="https://cdphysio.janeapp.com/#/staff_member/1" target="_blank">JaneApp</a>.</small></p>
        <p class="footer-admin"><a routerLink="/admin">Admin</a></p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
