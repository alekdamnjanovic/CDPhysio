import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsService, AdminReview, ReviewStatus } from '../../core/services/reviews.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './admin.component.scss',
  template: `
    <main class="admin-main">
      <section class="admin-panel">
        <div class="admin-head">
          <span class="eyebrow">Admin</span>
          <h2>Review Moderation</h2>
          <p>Approve, reject, or delete reviews submitted through the site.</p>
        </div>

        <div class="admin-key" *ngIf="!isAuthed()">
          <form (ngSubmit)="unlock()">
            <label for="admin-key-input">Admin Key</label>
            <input id="admin-key-input" type="password" [(ngModel)]="keyInput" name="adminKey" placeholder="Enter your admin key" autocomplete="off" />
            <button type="submit" class="btn cta">Unlock</button>
          </form>
          <p class="admin-error" *ngIf="authError">{{ authError }}</p>
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
          <p class="admin-empty" *ngIf="!loading() && reviews().length === 0">No reviews in this tab.</p>

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

  ngOnInit() {
    if (this.isAuthed()) {
      this.refresh();
    }
  }

  protected isAuthed(): boolean {
    return !!sessionStorage.getItem('reviews_admin_key');
  }

  protected unlock() {
    if (!this.keyInput.trim()) {
      this.authError = 'Please enter the admin key.';
      return;
    }
    sessionStorage.setItem('reviews_admin_key', this.keyInput.trim());
    this.authError = '';
    this.refresh();
  }

  protected lock() {
    sessionStorage.removeItem('reviews_admin_key');
    this.activeTab.set('Pending');
    this.reviews.set([]);
    this.keyInput = '';
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
    this.reviewsService.listAdmin(tab).subscribe({
      next: (res) => this.reviews.set(res.reviews),
      error: () => {
        this.loading.set(false);
        if (this.isAuthed()) {
          this.lock();
        }
      },
      complete: () => this.loading.set(false)
    });
  }

  private loadCounts() {
    this.reviewsService.listAdmin('Pending').subscribe(r => {
      this.counts.update(c => ({ ...c, pending: r.reviews.length }));
    });
    this.reviewsService.listAdmin('Approved').subscribe(r => {
      this.counts.update(c => ({ ...c, approved: r.reviews.length }));
    });
    this.reviewsService.listAdmin('Rejected').subscribe(r => {
      this.counts.update(c => ({ ...c, rejected: r.reviews.length }));
    });
  }

  protected approve(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Approved').subscribe(() => this.refresh());
  }

  protected reject(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Rejected').subscribe(() => this.refresh());
  }

  protected remove(review: AdminReview) {
    this.reviewsService.deleteReview(review.id).subscribe(() => this.refresh());
  }
}