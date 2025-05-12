import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/users/users.service';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',

})
export class LandingPageComponent {
  slides = [
    {
      image: '../../../../assets/landing1.png',
      alt: 'Madinah community gathering',
      caption: 'Connect with vibrant communities in Madinah'
    },
    {
      image: '../../../../assets/landing2.png',
      alt: 'Historic Madinah',
      caption: 'Explore the rich heritage of Madinah'
    },
    {
      image: '../../../../assets/landing3.png',
      alt: 'Madinah events',
      caption: 'Participate in cultural events that bring the city to life'
    }
  ];
  currentSlide = 0;
  slideInterval: any;
  activeSection: string = 'hero';
  mobileMenuOpen: boolean = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService) { }

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
  ngOnInit(): void {
    this.startSlideShow();
    this.checkActiveSection();

  }

  ngOnDestroy(): void {
    this.stopSlideShow();
  }

  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  stopSlideShow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

@HostListener('window:scroll', ['$event'])
checkActiveSection() {
    const sections = [
      { id: 'hero', element: document.getElementById('hero') },
      { id: 'about', element: document.getElementById('about') },
      { id: 'communities', element: document.getElementById('communities') },
      { id: 'events', element: document.getElementById('events') }
    ];
    
    // Find which section is currently most visible in the viewport
    const currentPosition = window.scrollY + window.innerHeight / 3;
    
    for (const section of sections) {
      if (!section.element) continue;
      
      const sectionTop = section.element.offsetTop;
      const sectionBottom = sectionTop + section.element.offsetHeight;
      
      if (currentPosition >= sectionTop && currentPosition <= sectionBottom) {
        this.activeSection = section.id;
        break;
      }
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      // Smooth scroll
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
