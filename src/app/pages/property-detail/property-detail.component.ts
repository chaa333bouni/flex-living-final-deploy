import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Importer les interfaces nécessaires depuis le service
import { Review, ReviewService, GoogleReview } from '../../services/review.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.css']
})
export class PropertyDetailComponent implements OnInit {
  listingName: string | null = null;
  
  // Données et états pour les avis Hostaway
  publicReviews: Review[] = [];
  isLoadingHostaway: boolean = true;
  
  // Données et états pour les avis Google (simulés)
  googleReviews: GoogleReview[] = [];
  isLoadingGoogle: boolean = true;

  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const encodedListingName = params['listingName'];
      if (encodedListingName) {
        this.listingName = decodeURIComponent(encodedListingName);

        this.loadHostawayReviews();
        this.loadGoogleReviews();
      } else {
        this.isLoadingHostaway = false;
        this.isLoadingGoogle = false;
        this.errorMessage = 'Nom de propriété manquant dans l\'URL.';
      }
    });
  }

  /**
   * Charging reviews approved from the backend (Hostaway).
   */
  private loadHostawayReviews(): void {
    if (!this.listingName) return;

    this.isLoadingHostaway = true;
    this.reviewService.getPublicReviewsForListing(this.listingName).subscribe({
      next: (reviews) => {
        this.publicReviews = reviews;
        this.isLoadingHostaway = false;
      },
      error: (error) => {
        console.error('Error while charging review hostway:', error);
        this.errorMessage = 'Error while charging review hostway.';
        this.isLoadingHostaway = false;
      }
    });
  }

  /**
   * Charging google review simulated data from the backend.
   */
  private loadGoogleReviews(): void {
    if (!this.listingName) return;

    this.isLoadingGoogle = true;
    this.reviewService.getGoogleReviews(this.listingName).subscribe({
      next: (reviews) => {
        this.googleReviews = reviews;
        this.isLoadingGoogle = false;
      },
      error: (error) => {
        

        console.warn('Erreur lors du chargement des avis Google (simulés):', error);
        this.isLoadingGoogle = false;
      }
    });
  }
}
