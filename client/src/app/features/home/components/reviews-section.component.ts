import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { ReviewsService } from '../../../core/services/reviews.service';
import { SERVICE_OPTIONS } from '../../../core/constants/content.constants';
import type { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews-section.component.html',
})
export class ReviewsSectionComponent implements OnInit {
  private readonly reviewsService = inject(ReviewsService);
  protected readonly serviceOptions = SERVICE_OPTIONS;
  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected readonly reviews = signal<Review[]>([]);
  protected readonly loadingReviews = signal(true);
  protected readonly reviewsError = signal('');
  protected readonly ratingFilter = signal<number>(0);
  protected readonly expandedReviews = signal<Set<number>>(new Set());

  protected readonly showForm = signal(false);
  protected formName = '';
  protected formRating = 0;
  protected formService = '';
  protected formText = '';
  protected formHoneypot = '';
  protected readonly formSubmitting = signal(false);
  protected readonly formError = signal('');
  protected readonly formSuccess = signal(false);

  protected readonly averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  });

  protected readonly filteredReviews = computed(() => {
    const filter = this.ratingFilter();
    if (filter === 0) return this.reviews();
    return this.reviews().filter((r) => r.rating === filter);
  });

  protected isLong(text?: string): boolean {
    return (text?.length ?? 0) > 180;
  }

  protected isExpanded(id: number): boolean {
    return this.expandedReviews().has(id);
  }

  protected toggleExpand(id: number): void {
    this.expandedReviews.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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
      complete: () => this.loadingReviews.set(false),
    });
  }

  protected setFilter(filter: number) {
    this.ratingFilter.set(filter);
  }

  protected toggleForm() {
    this.showForm.update((v) => !v);
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
    if (this.formText.trim().length > 600) {
      this.formError.set('Please keep your review under 600 characters.');
      return;
    }

    this.formSubmitting.set(true);
    this.formError.set('');
    this.formSuccess.set(false);

    this.reviewsService
      .submit({
        name: this.formName.trim(),
        rating: this.formRating,
        text: this.formText.trim(),
        service: this.formService || undefined,
        honeypot: this.formHoneypot,
      })
      .subscribe({
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
        },
      });
  }
}
