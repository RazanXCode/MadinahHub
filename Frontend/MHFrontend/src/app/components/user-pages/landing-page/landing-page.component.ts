import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',

})
export class LandingPageComponent {
  constructor(private router: Router) {}

  onGetStarted(): void {
    this.router.navigate(['/login']); 
  }
  onExploreCommunities(): void {
    this.router.navigate(['/dashboard']); 
  }

}
