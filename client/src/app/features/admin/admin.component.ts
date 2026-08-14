import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewsService, AdminReview, ReviewStatus } from '../../core/services/reviews.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

        <div class="admin-toast" *ngIf="toast()" role="status">{{ toast() }}</div>

        <div class="admin-key" *ngIf="!isAuthed()">
          <form (ngSubmit)="unlock()">
            <label for="admin-key-input">Admin Key</label>
            <div class="key-field">
              <svg class="key-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              <input
                id="admin-key-input"
                type="password"
                [(ngModel)]="keyInput"
                name="adminKey"
                placeholder="Enter your admin key"
                autocomplete="off"
                [attr.aria-invalid]="authError ? 'true' : null"
              />
            </div>
            <button type="submit" class="btn cta" [disabled]="loading()">{{ loading() ? 'Checking…' : 'Unlock' }}</button>
          </form>
          <p class="admin-error" *ngIf="authError" role="alert">{{ authError }}</p>
        </div>

        <ng-container *ngIf="isAuthed()">
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

          <p class="admin-loading" *ngIf="loading()">Loading…</p>
          <p class="admin-error tab-error" *ngIf="loadError()" role="alert">{{ loadError() }}</p>
          <p class="admin-empty" *ngIf="!loading() && !loadError() && reviews().length === 0">
            No reviews in this tab yet.
          </p>

          <div class="admin-card" *ngFor="let review of reviews()">
            <div class="admin-card-head">
              <span class="admin-name">{{ review.name }}</span>
              <span class="admin-stars" aria-label="{{ review.rating }} out of 5 stars">
                <span *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="review.rating >= i">★</span>
              </span>
              <span class="admin-badge" [class.flagged]="review.flaggedReason">{{ review.status }}</span>
            </div>
            <p class="admin-text">{{ review.text }}</p>
            <p class="admin-flag" *ngIf="review.flaggedReason">AI flag: {{ review.flaggedReason }}</p>
            <div class="admin-meta">
              <span *ngIf="review.service" class="admin-service">{{ review.service }}</span>
              <time>{{ review.submittedAt | date: 'MMM d, yyyy h:mm a' }}</time>
            </div>
            <div class="admin-actions">
              <button
                *ngIf="review.status !== 'Approved'"
                type="button"
                class="btn small approve"
                (click)="approve(review)"
              >Approve</button>
              <button
                *ngIf="review.status !== 'Rejected'"
                type="button"
                class="btn small reject"
                (click)="reject(review)"
              >Reject</button>
              <button type="button" class="btn small danger" (click)="remove(review)">Delete</button>
            </div>
          </div>

          <div class="admin-footer-actions">
            <button type="button" class="btn small" (click)="refresh()">Refresh</button>
            <button type="button" class="btn small" (click)="lock()">Lock</button>
          </div>
        </ng-container>
      </section>
    </main>
  `
})
export class AdminComponent implements OnInit {
  private reviewsService = inject(ReviewsService);

  protected keyInput = '';
  protected authError = '';
  protected activeTab = signal<ReviewStatus>('Pending');
  protected reviews = signal<AdminReview[]>([]);
  protected loading = signal(false);
  protected counts = signal({ pending: 0, approved: 0, rejected: 0 });
  protected toast = signal('');
  protected loadError = signal('');

  ngOnInit() {
    if (this.isAuthed()) {
      this.refresh();
    }
  }

  protected isAuthed(): boolean {
    return !!sessionStorage.getItem('reviews_admin_key');
  }

  protected unlock() {
    const key = this.keyInput.trim();
    if (!key) {
      this.authError = 'Please enter the admin key.';
      return;
    }
    this.authError = '';
    this.loading.set(true);
    this.reviewsService.listAdmin('Pending', key).subscribe({
      next: () => {
        sessionStorage.setItem('reviews_admin_key', key);
        this.loading.set(false);
        this.refresh();
      },
      error: (err) => {
        this.loading.set(false);
        this.authError = err.status === 401
          ? 'Invalid admin key. Please check the key and try again.'
          : err.status === 429
            ? 'Too many failed attempts. Please wait a few minutes.'
            : 'Could not reach the server. Please try again.';
      }
    });
  }

  protected lock() {
    sessionStorage.removeItem('reviews_admin_key');
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
    this.reviewsService.listAdmin(tab).subscribe({
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
    this.reviewsService.listAdmin('Pending').subscribe({
      next: (r) => this.counts.update(c => ({ ...c, pending: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, pending: 0 }))
    });
    this.reviewsService.listAdmin('Approved').subscribe({
      next: (r) => this.counts.update(c => ({ ...c, approved: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, approved: 0 }))
    });
    this.reviewsService.listAdmin('Rejected').subscribe({
      next: (r) => this.counts.update(c => ({ ...c, rejected: r.reviews.length })),
      error: () => this.counts.update(c => ({ ...c, rejected: 0 }))
    });
  }

  protected approve(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Approved').subscribe({
      next: () => {
        this.flashToast('Review approved.');
        this.refresh();
      },
      error: () => this.flashToast('Could not approve the review. Please try again.')
    });
  }

  protected reject(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Rejected').subscribe({
      next: () => {
        this.flashToast('Review rejected.');
        this.refresh();
      },
      error: () => this.flashToast('Could not reject the review. Please try again.')
    });
  }

  protected remove(review: AdminReview) {
    const confirmed = window.confirm(`Delete the review from "${review.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    this.reviewsService.deleteReview(review.id).subscribe({
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