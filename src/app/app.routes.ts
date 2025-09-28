import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { ShowcaseComponent } from './pages/showcase/showcase.component';

export const routes: Routes = [
  
  
  { path: 'dashboard', component: DashboardComponent },
  { path: 'showcase', component: ShowcaseComponent },
  { path: 'property/:listingName', component: PropertyDetailComponent },

  
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  
  { path: '**', redirectTo: '/dashboard' }
];
