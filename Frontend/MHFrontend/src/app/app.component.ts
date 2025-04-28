import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/admin-dashboard/dashboard/dashboard.component';
import { LandingPageComponent } from "./user-pages/landing-page/landing-page.component";
import { NavbarComponent } from "./user-pages/navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DashboardComponent, LandingPageComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MHFrontend';
}
