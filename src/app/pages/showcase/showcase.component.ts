import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShowcaseProperty, ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.css']
})
export class ShowcaseComponent implements OnInit {
  properties: ShowcaseProperty[] = [];
  isLoading = true;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewService.getShowcaseProperties().subscribe(data => {
      this.properties = data;
      this.isLoading = false;
    });
  }
}
