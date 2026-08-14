import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../core/directives/parallax.directive';

interface GalleryItem {
  src: string;
  alt: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RevealDirective, ParallaxDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  @ViewChild('galleryTrack') private galleryTrack?: ElementRef<HTMLElement>;

  readonly galleryItems: GalleryItem[] = [
    { src: 'gallery/clinic.svg', alt: 'CD Physio clinic space', label: 'The Clinic' },
    { src: 'gallery/treatment.svg', alt: 'CD Physio treatment room', label: 'Treatment Room' },
    { src: 'gallery/rehab.svg', alt: 'Rehabilitation and performance work', label: 'Rehab & Performance' },
    { src: 'gallery/sports.svg', alt: 'Sports recovery at CD Physio', label: 'Sports & Recovery' },
    { src: 'gallery/mobility.svg', alt: 'Mobility and movement training', label: 'Mobility & Movement' },
    { src: 'gallery/community.svg', alt: 'Team and community at CD Physio', label: 'Team & Community' }
  ];

  scrollGallery(direction: number) {
    const track = this.galleryTrack?.nativeElement;
    if (!track) {
      return;
    }
    const card = track.querySelector('.gallery-card') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }
}
