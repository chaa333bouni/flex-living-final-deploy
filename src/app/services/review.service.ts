import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Interface pour un avis Hostaway
export interface Review {
  id: number;
  listingName: string;
  guestName: string;
  channel: string;
  publicReview: string;
  submittedAt: string;
  overallRating: number;
  categories: any;
  isApproved: boolean;
  [key: string]: any;
}

// Interface pour la page vitrine
export interface ShowcaseProperty {
  listingName: string;
  imageUrl: string;
}

// Interface pour la réponse API Google
export interface GoogleApiResponse {
  result: {
    reviews: GoogleReview[];
  };
  status: string;
}

// Interface pour un avis Google
export interface GoogleReview {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

@Injectable({
  providedIn: 'root'
} )
export class ReviewService {
  // L'URL de base pour toutes les appels API.
  private apiUrl = '/api';

  constructor(private http: HttpClient ) { }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews` );
  }

  updateApprovalStatus(id: number, isApproved: boolean): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews/${id}/approve`, { isApproved } );
  }

  getPublicReviewsForListing(listingName: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/public`, {
      params: { listingName: listingName }
    } );
  }

  getShowcaseProperties(): Observable<ShowcaseProperty[]> {
    return this.http.get<ShowcaseProperty[]>(`${this.apiUrl}/showcase-properties` );
  }

  getGoogleReviews(listingName: string): Observable<GoogleReview[]> {
    return this.http.get<GoogleApiResponse>(`${this.apiUrl}/google-reviews/${listingName}` ).pipe(
      map(response => {
        if (response && response.status === 'OK' && response.result && response.result.reviews) {
          return response.result.reviews;
        }
        return [];
      })
    );
  }
}
