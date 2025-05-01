import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog'; // Import DialogModule

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
    DialogModule // Add DialogModule to imports
  ],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css'
})
export class AllEventsComponent {
  searchTerm: string = '';
  filterBy: string = '';
  
  // Add properties for handling the modal
  displayEventModal: boolean = false;
  selectedEvent: any = null;
  
  filterOptions = [
    { label: 'Date (Newest)', value: 'date-newest' },
    { label: 'Date (Oldest)', value: 'date-oldest' },
    { label: 'Location', value: 'location' },
    { label: 'Event Type', value: 'type' }
  ];

  // Events data with additional details for the modal
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
      duration: '2 hours',
      requirements: 'Basic programming knowledge, laptop with Node.js installed'
    },
    {
      id: 2,
      title: 'IoT Bootcamp: Raspberry Pi Edition',
      date: 'May 2',
      time: '5:00 PM',
      location: 'TechLab Hub',
      imageUrl: '../../../../assets/image.png',
      description: 'Get started with IoT development using Raspberry Pi. This bootcamp will cover the basics of setting up your Pi, connecting sensors, and building simple IoT projects.',
      organizer: 'IoT Enthusiasts',
      attendees: 30,
      duration: '3 hours',
      requirements: 'Raspberry Pi (provided), basic Linux knowledge'
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
      duration: '2.5 hours',
      requirements: 'Laptop with Git installed'
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
      duration: '4 hours',
      requirements: 'JavaScript knowledge, MetaMask wallet'
    },
    {
      id: 5,
      title: 'Hackathon Prep: Git, CI/CD, and DevOps',
      date: 'May 6',
      time: '6:30 PM',
      location: 'Innovation Center',
      imageUrl: '../../../../assets/image.png',
      description: 'Prepare for upcoming hackathons by mastering essential DevOps tools. Learn Git workflow, continuous integration/continuous deployment, and best practices for collaborative development.',
      organizer: 'DevOps Masters',
      attendees: 60,
      duration: '2.5 hours',
      requirements: 'Laptop with Git installed'
    },
    {
      id: 6,
      title: 'Hackathon Prep: Git, CI/CD, and DevOps',
      date: 'May 6',
      time: '6:30 PM',
      location: 'Innovation Center',
      imageUrl: '../../../../assets/image.png',
      description: 'Prepare for upcoming hackathons by mastering essential DevOps tools. Learn Git workflow, continuous integration/continuous deployment, and best practices for collaborative development.',
      organizer: 'DevOps Masters',
      attendees: 60,
      duration: '2.5 hours',
      requirements: 'Laptop with Git installed'
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
}