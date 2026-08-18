import { GalleryItem, GalleryHighlight } from '../models/gallery.model';

export const ELITE_HIGHLIGHT: GalleryHighlight = {
  imageSrc: 'gallery/Selfie_Novak.webp',
  imageAlt: 'Carole Damnjanovic with tennis champion Novak Djokovic',
  badge: 'World-Class Athletics',
  title: 'Working with Champions',
  subtitle: 'With Novak Djokovic',
  description: 'Bringing decades of sports physiotherapy, biomechanics, and manual therapy to elite competitors at the highest levels of global sport.',
  thankYouNote: 'A special thank you to Novak Djokovic for the incredible trust and opportunity to support one of the greatest athletes in sporting history.'
};

export const CLIENT_GALLERY_ITEMS: readonly GalleryItem[] = [
  {
    src: 'gallery/Selfie_With_Client.webp',
    alt: 'Carole Damnjanovic with a happy client at CD Physio',
    label: 'Meeting Great Clients',
    description: 'Every recovery journey is personal. Dedicated one-on-one care to get you back to the activities you love.'
  },
  {
    src: 'gallery/Hockey_Players.webp',
    alt: 'Female hockey athlete clients at CD Physio',
    label: 'Athletic Recovery & Community',
    description: 'Supporting dedicated local athletes and competitors to stay resilient, pain-free, and performing at their best.'
  }
] as const;

export const CLINIC_GALLERY_ITEMS: readonly GalleryItem[] = [
  { src: 'gallery/clinic.svg', alt: 'CD Physio clinic space', label: 'The Clinic Space' },
  { src: 'gallery/treatment.svg', alt: 'CD Physio treatment room', label: 'Private Treatment Room' },
  { src: 'gallery/rehab.svg', alt: 'Rehabilitation and performance area', label: 'Rehab & Performance' },
  { src: 'gallery/mobility.svg', alt: 'Mobility and movement training equipment', label: 'Mobility & Training' }
] as const;
