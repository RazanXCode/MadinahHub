import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg bottom-1">
      <div class=" mx-auto px-4 sm:px-6 lg:px-8 p-2">
        <div class="flex justify-between h-16">
          <!-- Brand -->
          <div class="flex items-center">
            <img src="../../../../assets/navbarlogo.png" alt="Medinah Hub" class="h-20">

            
          </div>

          <!-- Desktop Links -->
          <div class="hidden md:flex space-x-6 items-center">
          <a routerLink="/home" class="px-3 py-2 rounded-lg text-xl text-primary hover:bg-primary hover:text-white hover:opacity-80 transition">
          Home
            </a>
            <a routerLink="/Communities" class="px-3 py-2 rounded-lg text-xl text-secondary hover:bg-primary hover:text-white hover:opacity-80 transition">
              Communities
            </a>
            <a routerLink="/Events" class="px-3 py-2 rounded-lg text-xl text-secondary hover:bg-primary hover:text-white hover:opacity-80 transition">
              Events
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden">
            <button
              (click)="toggleMenu()"
              aria-label="Toggle navigation menu"
              [attr.aria-expanded]="menuOpen"
              class="p-2 focus:outline-none"
            >
              <svg *ngIf="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary hover:text-secondary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
              </svg>
              <svg *ngIf="menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary hover:text-secondary transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="menuOpen" class="md:hidden bg-white shadow-lg">
        <a
          routerLink="/home"
          (click)="toggleMenu()"
          class="block px-4 py-2 text-primary hover:bg-primary hover:text-white hover:opacity-80 transition"
        >
          Home
        </a>
        <a
          routerLink="/about"
          (click)="toggleMenu()"
          class="block px-4 py-2 text-secondary hover:bg-primary hover:text-white hover:opacity-80 transition"
        >
        Communities
        </a>
        <a
          routerLink="/contact"
          (click)="toggleMenu()"
          class="block px-4 py-2 text-secondary hover:bg-primary hover:text-white hover:opacity-80 transition"
        >
          Events
        </a>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
