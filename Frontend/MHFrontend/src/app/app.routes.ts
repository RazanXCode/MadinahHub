import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AllEventsComponent } from './components/user-pages/all-events/all-events.component';
import { VisitorDashboardComponent } from './components/user-pages/visitor-dashboard/visitor-dashboard.component';
import { LandingPageComponent } from './components/user-pages/landing-page/landing-page.component';
import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: '**', redirectTo: 'login' },
  { path: 'events', component: AllEventsComponent },
  { path: 'dashboard', component: VisitorDashboardComponent },
  { path: 'landing', component: LandingPageComponent },
  { path: 'admin', component: DashboardComponent },
];