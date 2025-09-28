import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // 1. IMPORT RouterModule
import { Review, ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule 
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  

  allReviews: Review[] = [];
  filteredReviews: Review[] = [];
  uniqueListings: string[] = [];
  selectedListing: string = '';
  sortKey: keyof Review = 'submittedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.reviewService.getReviews().subscribe(data => {
      this.allReviews = data;
      this.uniqueListings = [...new Set(data.map(review => review.listingName))];
      this.refreshDisplayedReviews();
    });
  }

  refreshDisplayedReviews(): void {
    let processedReviews = [...this.allReviews];
    processedReviews.sort((a, b) => {
      const valA = a[this.sortKey];
      const valB = b[this.sortKey];
      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
    if (this.selectedListing) {
      processedReviews = processedReviews.filter(review => review.listingName === this.selectedListing);
    }
    this.filteredReviews = processedReviews;
  }

  setSortKey(key: keyof Review): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'desc';
    }
    this.refreshDisplayedReviews();
  }

  resetFilters(): void {
    this.selectedListing = '';
    this.refreshDisplayedReviews();
  }
  encodeURIComponent(value: string): string {
  return encodeURIComponent(value);
}
  toggleApproval(review: Review): void {
    const newStatus = !review.isApproved;
    this.reviewService.updateApprovalStatus(review.id, newStatus).subscribe(updatedReview => {
      const index = this.allReviews.findIndex(r => r.id === review.id);
      if (index !== -1) {
        this.allReviews[index] = updatedReview;
      }
      this.refreshDisplayedReviews();
      console.log(`Statut de l'avis ${review.id} mis à jour !`);
    });
  }
}
