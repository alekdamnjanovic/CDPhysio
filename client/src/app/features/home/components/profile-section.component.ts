import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { CLINIC_CONFIG } from '../../../core/constants/clinic.constants';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about" class="profile section reveal" appReveal>
      <div class="profile-inner">
        <div class="profile-grid">
          <div class="avatar-wrap">
            <div class="avatar">
              <img src="profile/Profile.jpg" alt="Carole Damnjanovic, Registered Physiotherapist" />
            </div>
          </div>
          <div class="profile-text">
            <span class="eyebrow">About</span>
            <h2>{{ clinic.practitionerName }}</h2>
            <p class="subtitle">{{ clinic.practitionerCredentials }}</p>
            <p class="tagline-text">{{ clinic.practitionerTagline }}</p>
            <p>With a global population of more than 8 billion people, no two individuals are exactly alike. I believe the same should be true of the way we approach treatment. Every client is unique, and my goal is to understand the individual behind the injury, pain, or performance challenge and develop an approach that is tailored to their specific needs and goals.</p>
            <p>With more than 30 years of experience as a physiotherapist and kinesiologist, I have developed a broad and diverse skill set through extensive education, specialized training, and years of hands-on clinical experience.</p>
            <p>I have a particular passion for working with athletes of all levels—from those looking to return to their sport after an injury to those striving to improve performance and stay at the top of their game.</p>
            <p>My approach combines my background in physiotherapy and kinesiology with additional osteopathic-based education completed through a Doctor of Osteopathy program in Europe. This unique blend of knowledge allows me to draw from a variety of assessment and treatment techniques and adapt them to each individual.</p>
            <p>My manual therapy techniques are supported by research, complemented by specialized certifications, and continually refined through ongoing professional education. I believe in looking beyond the symptoms to better understand how the body moves and functions as a whole.</p>
            <p>My goal is simple: to provide personalized, evidence-informed care that helps you move better, perform better, and achieve your goals.</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProfileSectionComponent {
  protected readonly clinic = CLINIC_CONFIG;
}
