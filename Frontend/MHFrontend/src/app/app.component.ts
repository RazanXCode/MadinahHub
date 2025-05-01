// src/app/app.component.ts
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
  // Bring in both routing & dashboard + common directives
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
  template: `
    <nav>
      <div>
        <ul>
          <!-- If not logged in, show nothing (or maybe a login link) -->
          <ng-container *ngIf="(authService.currentUser$ | async) === null; else loggedIn">
            <!-- e.g. <li><a routerLink="/login">Login</a></li> -->
          </ng-container>

          <!-- Once logged in, show logout -->
          <ng-template #loggedIn>
            <li>
              <a href="#" (click)="logout($event)">Logout</a>
            </li>
          </ng-template>
        </ul>
      </div>
    </nav>

    <!-- This is where your routed views (including DashboardComponent) appear -->
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout().subscribe();
  }
}
