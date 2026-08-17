import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';
import type {
  Review,
  AdminReview,
  ReviewStatus,
  SubmitReviewPayload,
  ReviewsResponse,
  AdminReviewsResponse,
  ActionResponse
} from '../models/review.model';

export type { Review, AdminReview, ReviewStatus, SubmitReviewPayload, ReviewsResponse, AdminReviewsResponse, ActionResponse };

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.reviewsApiUrl;

  getApproved(): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(this.baseUrl);
  }

  submit(payload: SubmitReviewPayload): Observable<ActionResponse> {
    return this.http.post<ActionResponse>(this.baseUrl, payload);
  }

  listAdmin(status?: ReviewStatus, key?: string): Observable<AdminReviewsResponse> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<AdminReviewsResponse>(`${this.baseUrl}/admin${params}`, this.adminHeaders(key));
  }

  updateStatus(id: number, status: Exclude<ReviewStatus, 'Pending'>, key?: string): Observable<ActionResponse> {
    return this.http.patch<ActionResponse>(`${this.baseUrl}/admin/${id}`, { status }, this.adminHeaders(key));
  }

  deleteReview(id: number, key?: string): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.baseUrl}/admin/${id}`, this.adminHeaders(key));
  }

  private adminHeaders(key?: string): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({ 'X-Admin-Key': key ?? '' })
    };
  }
}
