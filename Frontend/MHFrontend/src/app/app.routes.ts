import { Routes } from '@angular/router';
import { AllEventsComponent } from './components/user-pages/all-events/all-events.component';
import { VisitorDashboardComponent } from './components/user-pages/visitor-dashboard/visitor-dashboard.component';
import { LandingPageComponent } from './components/user-pages/landing-page/landing-page.component';
import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: 'events', component: AllEventsComponent },
  { path: 'dashboard', component: VisitorDashboardComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'admin', component: DashboardComponent },
];