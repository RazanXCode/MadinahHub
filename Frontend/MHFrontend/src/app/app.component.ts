import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';
import { LandingPageComponent } from './components/user-pages/landing-page/landing-page.component';
import { NavbarComponent } from './components/user-pages/navbar/navbar.component';
import { VisitorDashboardComponent } from './components/user-pages/visitor-dashboard/visitor-dashboard.component';
import { AllEventsComponent } from "./components/user-pages/all-events/all-events.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DashboardComponent, LandingPageComponent, NavbarComponent, VisitorDashboardComponent, AllEventsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MHFrontend';
}
