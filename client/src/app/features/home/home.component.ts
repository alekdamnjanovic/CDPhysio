import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section.component';
import { StatsBandComponent } from './components/stats-band.component';
import { ProfileSectionComponent } from './components/profile-section.component';
import { EducationSectionComponent } from './components/education-section.component';
import { CredentialsSectionComponent } from './components/credentials-section.component';
import { GallerySectionComponent } from './components/gallery-section.component';
import { ReviewsSectionComponent } from './components/reviews-section.component';
import { BookingBandComponent } from './components/booking-band.component';
import { ContactSectionComponent } from './components/contact-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    StatsBandComponent,
    ProfileSectionComponent,
    EducationSectionComponent,
    CredentialsSectionComponent,
    GallerySectionComponent,
    ReviewsSectionComponent,
    BookingBandComponent,
    ContactSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html'
})
export class HomeComponent {}
