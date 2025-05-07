import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; 
import { UserService } from '../../../services/users/users.service';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',

})
export class LandingPageComponent {
  constructor(private router: Router, private authService: AuthService, private userService: UserService ) {}

  onGetStarted(): void {
    if (this.authService.currentUserValue) {
      this.authService.loginToBackend().subscribe({
        next: (userProfile) => {
          const publicUserId = userProfile.userIdPublic || (userProfile as any).publicUserId;
          
          if (!publicUserId) {
            this.router.navigate(['/dashboard']);
            return;
          }
          
          this.userService.getUser(publicUserId).subscribe({
            next: (user) => {
              if (user.role === 'Admin') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            },
            error: () => this.router.navigate(['/dashboard'])
          });
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
  onExploreCommunities(): void {
    if (this.authService.currentUserValue) {
      this.authService.loginToBackend().subscribe({
        next: (userProfile) => {
          const publicUserId = userProfile.userIdPublic || (userProfile as any).publicUserId;
          
          if (!publicUserId) {
            this.router.navigate(['/dashboard']);
            return;
          }
          
          this.userService.getUser(publicUserId).subscribe({
            next: (user) => {
              if (user.role === 'Admin') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            },
            error: () => this.router.navigate(['/dashboard'])
          });
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

}
