import { Component, ViewChild, ElementRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { ParallaxDirective } from '../../core/directives/parallax.directive';
import { CountUpDirective } from '../../core/directives/count-up.directive';
import { ReviewsService, Review } from '../../core/services/reviews.service';

interface GalleryItem {
  src: string;
  alt: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealDirective, ParallaxDirective, CountUpDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  @ViewChild('galleryTrack') private galleryTrack?: ElementRef<HTMLElement>;

  private reviewsService = inject(ReviewsService);

  protected readonly galleryItems: GalleryItem[] = [
    { src: 'gallery/clinic.svg', alt: 'CD Physio clinic space', label: 'The Clinic' },
    { src: 'gallery/treatment.svg', alt: 'CD Physio treatment room', label: 'Treatment Room' },
    { src: 'gallery/rehab.svg', alt: 'Rehabilitation and performance work', label: 'Rehab & Performance' },
    { src: 'gallery/sports.svg', alt: 'Sports recovery at CD Physio', label: 'Sports & Recovery' },
    { src: 'gallery/mobility.svg', alt: 'Mobility and movement training', label: 'Mobility & Movement' },
    { src: 'gallery/community.svg', alt: 'Team and community at CD Physio', label: 'Team & Community' }
  ];

  protected readonly serviceOptions = [
    'Physiotherapy',
    'Sports Recovery',
    'Manual Therapy',
    'Initial Assessment',
    'Performance Training',
    'Other'
  ];

  protected reviews = signal<Review[]>([]);
  protected loadingReviews = signal(true);
  protected reviewsError = signal('');

  protected ratingFilter = signal<number>(0);
  protected showForm = signal(false);
  protected formName = '';
  protected formRating = 0;
  protected formService = '';
  protected formText = '';
  protected formHoneypot = '';
  protected formSubmitting = signal(false);
  protected formError = signal('');
  protected formSuccess = signal(false);

  protected readonly stars = [1, 2, 3, 4, 5];

  ngOnInit() {
    this.loadReviews();
  }

  protected loadReviews() {
    this.loadingReviews.set(true);
    this.reviewsError.set('');
    this.reviewsService.getApproved().subscribe({
      next: (res) => this.reviews.set(res.reviews),
      error: () => {
        this.reviews.set([]);
        this.reviewsError.set('Reviews could not be loaded right now.');
      },
      complete: () => this.loadingReviews.set(false)
    });
  }

  protected get averageRating(): number {
    const all = this.reviews();
    if (!all.length) return 0;
    return all.reduce((sum, r) => sum + r.rating, 0) / all.length;
  }

  protected get filteredReviews(): Review[] {
    const filter = this.ratingFilter();
    if (filter === 0) {
      return this.reviews();
    }
    return this.reviews().filter(r => r.rating === filter);
  }

  protected setFilter(filter: number) {
    this.ratingFilter.set(filter);
  }

  protected toggleForm() {
    this.showForm.update(v => !v);
    this.formError.set('');
    this.formSuccess.set(false);
  }

  protected pickRating(value: number) {
    this.formRating = value;
  }

  protected submitReview() {
    if (this.formSubmitting()) return;

    if (this.formName.trim().length < 2) {
      this.formError.set('Please enter your name.');
      return;
    }
    if (this.formRating < 1) {
      this.formError.set('Please select a star rating.');
      return;
    }
    if (this.formText.trim().length < 10) {
      this.formError.set('Please write at least a few sentences (10+ characters).');
      return;
    }

    this.formSubmitting.set(true);
    this.formError.set('');
    this.formSuccess.set(false);

    this.reviewsService.submit({
      name: this.formName.trim(),
      rating: this.formRating,
      text: this.formText.trim(),
      service: this.formService || undefined,
      honeypot: this.formHoneypot
    }).subscribe({
      next: () => {
        this.formSuccess.set(true);
        this.formName = '';
        this.formRating = 0;
        this.formService = '';
        this.formText = '';
        this.formHoneypot = '';
        this.formSubmitting.set(false);
      },
      error: (err) => {
        this.formSubmitting.set(false);
        this.formError.set(err?.error?.error || 'Something went wrong. Please try again.');
      }
    });
  }

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
