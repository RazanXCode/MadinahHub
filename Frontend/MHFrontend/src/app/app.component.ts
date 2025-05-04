import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';
import { AuthService } from './services/auth.service';
import { LandingPageComponent } from './components/user-pages/landing-page/landing-page.component';
import { NavbarComponent } from './components/user-pages/navbar/navbar.component';
import { VisitorDashboardComponent } from './components/user-pages/visitor-dashboard/visitor-dashboard.component';
import { AllEventsComponent } from './components/user-pages/all-events/all-events.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    DashboardComponent,
    LandingPageComponent,
    NavbarComponent,
    VisitorDashboardComponent,
    AllEventsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

}
