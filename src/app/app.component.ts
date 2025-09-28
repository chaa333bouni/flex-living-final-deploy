
import { Component } from '@angular/core';

import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterModule,   
    RouterOutlet,   
    CommonModule    
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isOnDashboard: boolean = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnDashboard = event.urlAfterRedirects.startsWith('/dashboard');
    });
  }
}
