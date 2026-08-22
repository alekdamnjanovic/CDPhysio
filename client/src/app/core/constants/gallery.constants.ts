import { GalleryItem } from '../models/gallery.model';

export const TRAINING_GALLERY_ITEMS: readonly GalleryItem[] = [
  {
    src: 'gallery/training/Austin_Training.webp',
    alt: 'Athletic training and movement coaching session',
    label: 'Movement & Performance',
    description: 'Targeted athletic conditioning, functional movement patterns, and movement retraining.'
  },
  {
    src: 'gallery/training/Training_Guy_Trapbar.webp',
    alt: 'Trap bar deadlift and strength training session',
    label: 'Strength & Conditioning',
    description: 'Targeted strength training and load management to build functional power, durability, and resilience.'
  },
  {
    src: 'gallery/training/Training_Girl_Squating_v2.webp',
    alt: 'Squat mechanics and functional movement coaching',
    label: 'Active Rehabilitation',
    description: 'Evidence-based exercise therapy focused on neuromuscular control, movement mechanics, and joint stability.'
  }
] as const;

export const CLIENT_GALLERY_ITEMS: readonly GalleryItem[] = [
  {
    src: 'gallery/clients/Selfie_With_Client.webp',
    alt: 'Carole with a client at CD Physio',
    label: 'Meeting Great Clients',
    description: 'Dedicated one-on-one care tailored to each individual’s personal goals and recovery.'
  },
  {
    src: 'gallery/clients/Selfie_Novak.webp',
    alt: 'Carole with Novak Djokovic',
    label: 'With Novak Djokovic',
    description: 'A wonderful memory and sincere thank you to Novak Djokovic for the warmth and kindness.'
  },
  {
    src: 'gallery/clients/Hockey_Players.webp',
    alt: 'Athletes at CD Physio',
    label: 'Athletic Recovery & Community',
    description: 'Supporting dedicated local athletes and active clients in returning to the sports they love.'
  }
] as const;
