import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-all-events',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ButtonModule, 
    InputTextModule,
    DropdownModule,
    DialogModule
  ],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css'
})
export class AllEventsComponent {
  searchTerm: string = '';
  filterBy: string = '';
  
  // Modal properties
  displayEventModal: boolean = false;
  selectedEvent: any = null;
  
  filterOptions = [
    { label: 'Date (Newest)', value: 'date-newest' },
    { label: 'Date (Oldest)', value: 'date-oldest' },
    { label: 'Location', value: 'location' },
    { label: 'Event Type', value: 'type' }
  ];

  // Updated events data with capacity information
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
      date: 'May 6',
      time: '6:30 PM',
      location: 'Innovation Center',
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

  // Method to filter events based on search term
  get filteredEvents() {
    if (!this.searchTerm) {
      return this.events;
    }
    return this.events.filter(event => 
      event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Method to open the modal with event details
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