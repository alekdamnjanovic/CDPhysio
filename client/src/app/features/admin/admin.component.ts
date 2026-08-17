import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewsService } from '../../core/services/reviews.service';
import type { AdminReview, ReviewStatus } from '../../core/models/review.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './admin.component.scss',
  template: `
    <main class="admin-main">
      <section class="admin-panel">
        <div class="admin-head">
          <span class="eyebrow">Admin</span>
          <h2>Review Moderation</h2>
          <p>Approve, reject, or delete reviews submitted through the site.</p>
          <a class="admin-back" routerLink="/">← Back to site</a>
        </div>

        @if (toast()) {
          <div class="admin-toast" role="status">{{ toast() }}</div>
        }

        @if (!isAuthed()) {
          <div class="admin-key">
            <form (ngSubmit)="unlock()">
              <label for="admin-key-input">Admin Key</label>
              <div class="key-field">
                <svg class="key-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                <input
                  id="admin-key-input"
                  type="password"
                  [(ngModel)]="keyInput"
                  name="adminKey"
                  placeholder="Enter your admin key"
                  autocomplete="off"
                  [attr.aria-invalid]="authError() ? 'true' : null"
                />
              </div>
              <button type="submit" class="btn cta" [disabled]="loading()">{{ loading() ? 'Checking…' : 'Unlock' }}</button>
            </form>
            @if (authError()) {
              <p class="admin-error" role="alert">{{ authError() }}</p>
            }
          </div>
        }

        @if (isAuthed()) {
          <div class="admin-tabs" role="tablist">
            <button
              type="button"
              class="admin-tab"
              [class.active]="activeTab() === 'Pending'"
              (click)="selectTab('Pending')"
            >Pending ({{ counts().pending }})</button>
            <button
              type="button"
              class="admin-tab"
              [class.active]="activeTab() === 'Approved'"
              (click)="selectTab('Approved')"
            >Approved ({{ counts().approved }})</button>
            <button
              type="button"
              class="admin-tab"
              [class.active]="activeTab() === 'Rejected'"
              (click)="selectTab('Rejected')"
            >Rejected ({{ counts().rejected }})</button>
          </div>

          @if (loading()) {
            <p class="admin-loading">Loading…</p>
          }
          @if (loadError()) {
            <p class="admin-error tab-error" role="alert">{{ loadError() }}</p>
          }
          @if (!loading() && !loadError() && reviews().length === 0) {
            <p class="admin-empty">No reviews in this tab yet.</p>
          }

          @for (review of reviews(); track review.id) {
            <div class="admin-card">
              <div class="admin-card-head">
                <span class="admin-name">{{ review.name }}</span>
                <span class="admin-stars" [attr.aria-label]="review.rating + ' out of 5 stars'">
                  @for (i of [1,2,3,4,5]; track i) {
                    <span class="star" [class.filled]="review.rating >= i">★</span>
                  }
                </span>
                <span class="admin-badge" [class.flagged]="review.flaggedReason">{{ review.status }}</span>
              </div>
              <p class="admin-text">{{ review.text }}</p>
              @if (review.flaggedReason) {
                <p class="admin-flag">AI flag: {{ review.flaggedReason }}</p>
              }
              <div class="admin-meta">
                @if (review.service) {
                  <span class="admin-service">{{ review.service }}</span>
                }
                <time>{{ review.submittedAt | date: 'MMM d, yyyy h:mm a' }}</time>
              </div>
              <div class="admin-actions">
                @if (review.status !== 'Approved') {
                  <button
                    type="button"
                    class="btn small approve"
                    (click)="approve(review)"
                    aria-label="Approve review"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve
                  </button>
                }
                @if (review.status !== 'Rejected') {
                  <button
                    type="button"
                    class="btn small reject"
                    (click)="reject(review)"
                    aria-label="Reject review"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject
                  </button>
                }
                <button type="button" class="btn small danger" (click)="remove(review)" aria-label="Delete review">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          }

          <div class="admin-footer-actions">
            <button type="button" class="btn small" (click)="refresh()">Refresh</button>
            <button type="button" class="btn small" (click)="lock()">Lock</button>
          </div>
        }
      </section>
    </main>
  `
})
export class AdminComponent implements OnInit {
  private readonly reviewsService = inject(ReviewsService);
  private authKey = '';

  protected keyInput = '';
  protected readonly authError = signal('');
  protected readonly isAuthed = signal(false);
  protected readonly activeTab = signal<ReviewStatus>('Pending');
  protected readonly reviews = signal<AdminReview[]>([]);
  protected readonly loading = signal(false);
  protected readonly counts = signal({ pending: 0, approved: 0, rejected: 0 });
  protected readonly toast = signal('');
  protected readonly loadError = signal('');

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    if (this.isAuthed()) {
      this.refresh();
    }
  }

  protected unlock() {
    const key = this.keyInput.trim();
    if (!key) {
      this.authError.set('Please enter the admin key.');
      return;
    }
    this.authError.set('');
    this.loading.set(true);
    this.reviewsService.listAdmin('Pending', key).subscribe({
      next: () => {
        this.authKey = key;
        this.isAuthed.set(true);
        this.loading.set(false);
        this.refresh();
      },
      error: (err) => {
        this.loading.set(false);
        this.authError.set(
          err.status === 401
            ? 'Invalid admin key. Please check the key and try again.'
            : err.status === 429
              ? 'Too many failed attempts. Please wait a few minutes.'
              : 'Could not reach the server. Please try again.'
        );
      }
    });
  }

  protected lock() {
    this.authKey = '';
    this.isAuthed.set(false);
    this.activeTab.set('Pending');
    this.reviews.set([]);
    this.keyInput = '';
    this.loadError.set('');
  }

  protected selectTab(tab: ReviewStatus) {
    this.activeTab.set(tab);
    this.loadTab(tab);
  }

  protected refresh() {
    this.loadCounts();
    this.loadTab(this.activeTab());
  }

  private loadTab(tab: ReviewStatus) {
    this.loading.set(true);
    this.loadError.set('');
    this.reviewsService.listAdmin(tab, this.authKey).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.loadError.set('Your session has expired. Please unlock again.');
          this.lock();
        } else {
          this.loadError.set('Could not load reviews. Please try again.');
        }
      }
    });
  }

  private loadCounts() {
    this.reviewsService.listAdmin('Pending', this.authKey).subscribe({
      next: (r) => this.counts.update(c => ({ ...c, pending: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, pending: 0 }))
    });
    this.reviewsService.listAdmin('Approved', this.authKey).subscribe({
      next: (r) => this.counts.update(c => ({ ...c, approved: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, approved: 0 }))
    });
    this.reviewsService.listAdmin('Rejected', this.authKey).subscribe({
      next: (r) => this.counts.update(c => ({ ...c, rejected: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, rejected: 0 }))
    });
  }

  protected approve(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Approved', this.authKey).subscribe({
      next: () => {
        this.flashToast('Review approved.');
        this.refresh();
      },
      error: () => this.flashToast('Could not approve the review. Please try again.')
    });
  }

  protected reject(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Rejected', this.authKey).subscribe({
      next: () => {
        this.flashToast('Review rejected.');
        this.refresh();
      },
      error: () => this.flashToast('Could not reject the review. Please try again.')
    });
  }

  protected remove(review: AdminReview) {
    const confirmed = window.confirm(`Delete the review from "${review.name}"? This cannot be undone.`);
    if (!confirmed) return;

    this.reviewsService.deleteReview(review.id, this.authKey).subscribe({
      next: () => {
        this.flashToast('Review deleted.');
        this.refresh();
      },
      error: () => this.flashToast('Could not delete the review. Please try again.')
    });
  }

  private flashToast(message: string) {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(''), 2600);
  }
}
