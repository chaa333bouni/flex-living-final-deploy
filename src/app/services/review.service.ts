import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // IMPORTANT : Assurez-vous que 'map' est importé depuis 'rxjs'

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
  [key: string]: any; // Pour la fonction de tri
}

// Interface pour la page vitrine des propriétés
export interface ShowcaseProperty {
  listingName: string;
  imageUrl: string;
}

// Interface pour la réponse complète de l'API Google (simulée )
export interface GoogleApiResponse {
  result: {
    reviews: GoogleReview[];
  };
  status: string;
}

// Interface pour un seul avis Google
export interface GoogleReview {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
// Changez ceci :
// private apiUrl = 'http://localhost:3001/api';

// En ceci :
private apiUrl = '/api';

  constructor(private http: HttpClient ) { }

  // for dashboard manager
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
 
  // =================================================================
  // New method for simulated google reviews
  // =================================================================
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
