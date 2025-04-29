// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav>
      <div>
        <a href="#">MH Application</a>
        <div>
          <ul>
            <ng-container *ngIf="(authService.currentUser$ | async) === null; else loggedIn">
              <li>
                <a routerLink="/login" routerLinkActive="active">Login</a>
              </li>
              <li>
                <a routerLink="/register" routerLinkActive="active">Register</a>
              </li>
            </ng-container>
            <ng-template #loggedIn>
              <li>
                <a href="#" (click)="logout($event)">Logout</a>
              </li>
            </ng-template>
          </ul>
        </div>
      </div>
    </nav>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}
  
  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout().subscribe();
  }
}