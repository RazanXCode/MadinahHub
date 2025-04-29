import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule],
  templateUrl: './visitor-dashboard.component.html',
  styleUrl: './visitor-dashboard.component.css'
})
export class VisitorDashboardComponent {
  communities = [
    {
      id: 1,
      name: 'Tech Innovators',
      description: 'A hub for coders, builders & tech enthusiasts, stay tuned for events related to coding and computers',
      members: 123
    },
    {
      id: 2,
      name: 'Tech Innovators',
      description: 'A hub for coders, builders & tech enthusiasts, stay tuned for events related to coding and computers',
      members: 123
    },
    {
      id: 3,
      name: 'Tech Innovators',
      description: 'A hub for coders, builders & tech enthusiasts, stay tuned for events related to coding and computers',
      members: 123
    },
    {
      id: 4,
      name: 'Tech Innovators',
      description: 'A hub for coders, builders & tech enthusiasts, stay tuned for events related to coding and computers',
      members: 123
    }
  ];
   // Upcoming events data
  events = [
    {
      id: 1,
      title: 'Build Your Own AI Assistant',
      date: 'Apr 28',
      time: '7:00 PM',
      location: 'Online (Zoom)'
    },
    {
      id: 2,
      title: 'IoT Bootcamp: Raspberry Pi Edition',
      date: 'May 2',
      time: '5:00 PM',
      location: 'TechLab Hub'
    },
    {
      id: 3,
      title: 'Hackathon Prep: Git, CI/CD, and DevOps',
      date: 'May 6',
      time: '6:30 PM',
      location: 'Innovation Center'
    },
    {
      id: 4,
      title: 'Web3 Development Workshop',
      date: 'May 10',
      time: '4:00 PM',
      location: 'Digital Commons'
    }
  ];
  
  // Responsive options for both carousels
  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];
}