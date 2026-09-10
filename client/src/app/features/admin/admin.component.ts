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
  templateUrl: './admin.component.html',
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
              : 'Could not reach the server. Please try again.',
        );
      },
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
      },
    });
  }

  private loadCounts() {
    this.reviewsService.listAdmin('Pending', this.authKey).subscribe({
      next: (r) => this.counts.update((c) => ({ ...c, pending: r.reviews.length })),
      error: () => this.counts.update((c) => ({ ...c, pending: 0 })),
    });
    this.reviewsService.listAdmin('Approved', this.authKey).subscribe({
      next: (r) => this.counts.update((c) => ({ ...c, approved: r.reviews.length })),
      error: () => this.counts.update((c) => ({ ...c, approved: 0 })),
    });
    this.reviewsService.listAdmin('Rejected', this.authKey).subscribe({
      next: (r) => this.counts.update((c) => ({ ...c, rejected: r.reviews.length })),
      error: () => this.counts.update((c) => ({ ...c, rejected: 0 })),
    });
  }

  protected approve(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Approved', this.authKey).subscribe({
      next: () => {
        this.flashToast('Review approved.');
        this.refresh();
      },
      error: () => this.flashToast('Could not approve the review. Please try again.'),
    });
  }

  protected reject(review: AdminReview) {
    this.reviewsService.updateStatus(review.id, 'Rejected', this.authKey).subscribe({
      next: () => {
        this.flashToast('Review rejected.');
        this.refresh();
      },
      error: () => this.flashToast('Could not reject the review. Please try again.'),
    });
  }

  protected remove(review: AdminReview) {
    const confirmed = window.confirm(
      `Delete the review from "${review.name}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    this.reviewsService.deleteReview(review.id, this.authKey).subscribe({
      next: () => {
        this.flashToast('Review deleted.');
        this.refresh();
      },
      error: () => this.flashToast('Could not delete the review. Please try again.'),
    });
  }

  private flashToast(message: string) {
    this.toast.set(message);
    window.setTimeout(() => this.toast.set(''), 2600);
  }
}
