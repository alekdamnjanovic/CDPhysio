import { GalleryItem } from '../models/gallery.model';

export const GALLERY_ITEMS: readonly GalleryItem[] = [
  { src: 'gallery/clinic.svg', alt: 'CD Physio clinic space', label: 'The Clinic' },
  { src: 'gallery/treatment.svg', alt: 'CD Physio treatment room', label: 'Treatment Room' },
  { src: 'gallery/rehab.svg', alt: 'Rehabilitation and performance work', label: 'Rehab & Performance' },
  { src: 'gallery/sports.svg', alt: 'Sports recovery at CD Physio', label: 'Sports & Recovery' },
  { src: 'gallery/mobility.svg', alt: 'Mobility and movement training', label: 'Mobility & Movement' },
  { src: 'gallery/community.svg', alt: 'Team and community at CD Physio', label: 'Team & Community' }
] as const;
