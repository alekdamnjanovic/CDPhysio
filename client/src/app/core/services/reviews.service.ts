import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';

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

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private http = inject(HttpClient);
  private baseUrl = environment.reviewsApiUrl;

  getApproved(): Observable<{ reviews: Review[] }> {
    return this.http.get<{ reviews: Review[] }>(this.baseUrl);
  }

  submit(payload: SubmitReviewPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.baseUrl, payload);
  }

  listAdmin(status?: ReviewStatus): Observable<{ reviews: AdminReview[] }> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<{ reviews: AdminReview[] }>(`${this.baseUrl}/admin${params}`, this.adminHeaders());
  }

  updateStatus(id: number, status: Exclude<ReviewStatus, 'Pending'>): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/admin/${id}`, { status }, this.adminHeaders());
  }

  deleteReview(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/admin/${id}`, this.adminHeaders());
  }

  private adminHeaders() {
    const key = sessionStorage.getItem('reviews_admin_key') ?? '';
    return {
      headers: new HttpHeaders({ 'X-Admin-Key': key })
    };
  }
}