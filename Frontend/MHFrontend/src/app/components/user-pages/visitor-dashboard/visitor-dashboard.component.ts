import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, DialogModule, NavbarComponent, NavbarComponent], 
  templateUrl: './visitor-dashboard.component.html',
  styleUrl: './visitor-dashboard.component.css'
})
export class VisitorDashboardComponent {
  // Modal properties
  displayEventModal: boolean = false;
  selectedEvent: any = null;
  
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
   // Updated events data with additional properties
  events = [
    {
      id: 1,
      title: 'Build Your Own AI Assistant',
      date: 'Apr 28',
      time: '7:00 PM',
      location: 'Online (Zoom)',
      imageUrl: '../../../../assets/image.png',
      description: 'Learn how to build your own AI assistant using modern tools and frameworks. This hands-on workshop will guide you through the process of creating an intelligent assistant that can understand and respond to user requests.',
      organizer: 'Tech Innovators Community',
      attendees: 45,
      capacity: 60,
      duration: '2 hours',
      requirements: 'Basic programming knowledge, laptop with Node.js installed',
      isPrivate: true
    },
    {
      id: 2,
      title: 'IoT Bootcamp: Raspberry Pi Edition',
      date: 'May 2',
      time: '5:00 PM',
      location: 'TechLab Hub',
      imageUrl: '../../../../assets/image.png',
      description: 'Dive into the world of AI and voice recognition! In this hands-on workshop, you\'ll learn how to build a basic voice assistant using Python, open-source libraries, and real-time speech recognition APIs. Suitable for beginners and pros alike.',
      organizer: 'IoT Enthusiasts',
      attendees: 38,
      capacity: 50,
      duration: '3 hours',
      requirements: 'Raspberry Pi (provided), basic Linux knowledge',
      isPrivate: true
    },
    {
      id: 3,
      title: 'Hackathon Prep: Git, CI/CD, and DevOps',
      date: 'May 6',
      time: '6:30 PM',
      location: 'Innovation Center',
      imageUrl: '../../../../assets/image.png',
      description: 'Prepare for upcoming hackathons by mastering essential DevOps tools. Learn Git workflow, continuous integration/continuous deployment, and best practices for collaborative development.',
      organizer: 'DevOps Masters',
      attendees: 60,
      capacity: 80,
      duration: '2.5 hours',
      requirements: 'Laptop with Git installed',
      isPrivate: false
    },
    {
      id: 4,
      title: 'Web3 Development Workshop',
      date: 'May 10',
      time: '4:00 PM',
      location: 'Digital Commons',
      imageUrl: '../../../../assets/image.png',
      description: 'Dive into Web3 development with this comprehensive workshop. Learn about blockchain basics, smart contracts, and building decentralized applications.',
      organizer: 'Blockchain Guild',
      attendees: 40,
      capacity: 60,
      duration: '4 hours',
      requirements: 'JavaScript knowledge, MetaMask wallet',
      isPrivate: false
    }
  ];
  
  // Enhanced responsive options for better mobile experience
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '992px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1
    }
  ];
  
  showEventDetails(event: any) {
    this.selectedEvent = event;
    this.displayEventModal = true;
  }
  
  // Helper method to get spots left text
  getSpotsLeft(event: any): string {
    const spotsLeft = event.capacity - event.attendees;
    return `${spotsLeft} / ${event.capacity}`;
  }
}