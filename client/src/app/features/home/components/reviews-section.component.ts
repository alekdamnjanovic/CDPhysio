import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { ReviewsService } from '../../../core/services/reviews.service';
import type { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="reviews" class="reviews-section section reveal" appReveal>
      <div class="section-head">
        <span class="eyebrow">Reviews</span>
        <h2>What Clients Say</h2>
        <p>Real experiences from athletes and clients who've trained and recovered with Carole.</p>
      </div>

      <div class="reviews-toolbar reveal-stagger">
        @if (!loadingReviews() && reviews().length > 0) {
          <div class="reviews-summary">
            <span class="summary-rating">{{ averageRating().toFixed(1) }}</span>
            <div class="summary-stars" aria-hidden="true">
              @for (i of stars; track i) {
                <span class="star" [class.filled]="averageRating() >= i - 0.25">★</span>
              }
            </div>
            <span class="summary-count">Based on {{ reviews().length }} review{{ reviews().length === 1 ? '' : 's' }}</span>
          </div>
        }

        <div class="reviews-filters" role="group" aria-label="Filter reviews by rating">
          <button
            type="button"
            class="filter-chip"
            [class.active]="ratingFilter() === 0"
            (click)="setFilter(0)"
          >All</button>
          @for (value of [5, 4, 3]; track value) {
            <button
              type="button"
              class="filter-chip"
              [class.active]="ratingFilter() === value"
              (click)="setFilter(value)"
            >{{ value }}★</button>
          }
          <button type="button" class="filter-chip write-chip" (click)="toggleForm()">
            {{ showForm() ? 'Close Form' : 'Write a Review' }}
          </button>
        </div>
      </div>

      @if (showForm()) {
        <div class="review-form">
          <h3>Share Your Experience</h3>
          <p>Your review will appear once approved. It helps others feel confident in their care.</p>

          @if (formSuccess()) {
            <div class="form-success" role="status">
              <p>Thank you! Your review has been submitted and will appear once approved.</p>
            </div>
          }
          @if (formError()) {
            <div class="form-error" role="alert">
              <p>{{ formError() }}</p>
            </div>
          }

          @if (!formSuccess()) {
            <form (ngSubmit)="submitReview()" novalidate>
              <div class="form-row">
                <label for="review-name">Your Name</label>
                <input id="review-name" type="text" [(ngModel)]="formName" name="reviewName" placeholder="First name is fine" maxlength="100" required />
              </div>

              <div class="form-row">
                <span class="field-label">Rating</span>
                <div class="star-picker" role="radiogroup" aria-label="Select rating">
                  @for (value of stars; track value) {
                    <button
                      type="button"
                      class="star-pick"
                      [class.selected]="formRating === value"
                      (click)="pickRating(value)"
                      [attr.aria-label]="value + ' out of 5 stars'"
                    >★</button>
                  }
                </div>
              </div>

              <div class="form-row">
                <label for="review-text">Your Review</label>
                <textarea id="review-text" [(ngModel)]="formText" name="reviewText" rows="4" placeholder="How was your experience with Carole?" maxlength="600" required></textarea>
                <span class="char-count" [class.near-limit]="formText.length > 500">{{ formText.length }} / 600</span>
              </div>

              <div class="honeypot" aria-hidden="true">
                <label>Leave this field empty</label>
                <input type="text" name="website" [(ngModel)]="formHoneypot" tabindex="-1" autocomplete="off" />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn cta" [disabled]="formSubmitting()">
                  {{ formSubmitting() ? 'Submitting…' : 'Submit Review' }}
                </button>
              </div>
            </form>
          }
        </div>
      }

      @if (reviewsError()) {
        <p class="reviews-error">{{ reviewsError() }}</p>
      }

      <div class="reviews-grid reveal-stagger">
        @for (review of filteredReviews(); track review.id) {
          <article class="review-card">
            <div class="review-card-top">
              <div class="review-stars" [attr.aria-label]="review.rating + ' out of 5 stars'">
                @for (i of stars; track i) {
                  <span class="star" [class.filled]="review.rating >= i">★</span>
                }
              </div>
              <span class="review-rating">{{ review.rating }}.0</span>
            </div>
            <div class="review-body">
              <p class="review-text" [class.clamped]="isLong(review.text) && !isExpanded(review.id)">"{{ review.text }}"</p>
              @if (isLong(review.text)) {
                <button
                  type="button"
                  class="review-expand-btn"
                  (click)="toggleExpand(review.id)"
                  [class.expanded]="isExpanded(review.id)"
                  [attr.aria-expanded]="isExpanded(review.id)"
                >
                  {{ isExpanded(review.id) ? 'Show less' : 'Read more' }}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              }
            </div>
            <div class="review-meta">
              <span class="review-name">{{ review.name }}</span>
              @if (review.service) {
                <span class="review-service">{{ review.service }}</span>
              }
              <time class="review-date">{{ review.submittedAt | date: 'MMM yyyy' }}</time>
            </div>
          </article>
        }

        @if (!loadingReviews() && filteredReviews().length === 0) {
          <p class="reviews-empty">
            {{ reviews().length === 0 ? 'No reviews yet — be the first to share your experience!' : 'No reviews match this filter yet.' }}
          </p>
        }
      </div>

      @if (loadingReviews()) {
        <div class="reviews-loading">
          <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
      }
    </section>
  `
})
export class ReviewsSectionComponent implements OnInit {
  private readonly reviewsService = inject(ReviewsService);
  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected readonly reviews = signal<Review[]>([]);
  protected readonly loadingReviews = signal(true);
  protected readonly reviewsError = signal('');
  protected readonly ratingFilter = signal<number>(0);
  protected readonly expandedReviews = signal<Set<number>>(new Set());

  protected readonly showForm = signal(false);
  protected formName = '';
  protected formRating = 0;
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
    return this.reviews().filter(r => r.rating === filter);
  });

  protected isLong(text?: string): boolean {
    return (text?.length ?? 0) > 180;
  }

  protected isExpanded(id: number): boolean {
    return this.expandedReviews().has(id);
  }

  protected toggleExpand(id: number): void {
    this.expandedReviews.update(set => {
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
      complete: () => this.loadingReviews.set(false)
    });
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
    if (this.formText.trim().length > 600) {
      this.formError.set('Please keep your review under 600 characters.');
      return;
    }

    this.formSubmitting.set(true);
    this.formError.set('');
    this.formSuccess.set(false);

    this.reviewsService.submit({
      name: this.formName.trim(),
      rating: this.formRating,
      text: this.formText.trim(),
      honeypot: this.formHoneypot
    }).subscribe({
      next: () => {
        this.formSuccess.set(true);
        this.formName = '';
        this.formRating = 0;
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
}
