import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; 

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',

})
export class LandingPageComponent {
  constructor(private router: Router, private authService: AuthService ) {}

  onGetStarted(): void {
    if (this.authService.currentUserValue) {
      // If the user is logged in, navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // If the user is not logged in, navigate to the login page
      this.router.navigate(['/login']);
    }
  }
  onExploreCommunities(): void {
    if (this.authService.currentUserValue) {
      // If the user is logged in, navigate to the dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // If the user is not logged in, navigate to the login page
      this.router.navigate(['/login']);
    }
  }

}
