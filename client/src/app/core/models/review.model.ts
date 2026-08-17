export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  service?: string;
  submittedAt: string;
}

export interface AdminReview {
  id: number;
  name: string;
  rating: number;
  text: string;
  service?: string;
  status: ReviewStatus;
  flaggedReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface SubmitReviewPayload {
  name: string;
  rating: number;
  text: string;
  service?: string;
  honeypot?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export interface AdminReviewsResponse {
  reviews: AdminReview[];
}

export interface ActionResponse {
  message: string;
  reviewId?: number;
}
