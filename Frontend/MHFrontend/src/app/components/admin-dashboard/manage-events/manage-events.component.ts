import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventFormComponent } from '../event-form/event-form.component'; 

interface Event {
  id: number;
  title: string;
  description: string;
  type: 'public' | 'private';
  startDate: Date;
  endDate: Date;
  isOnline: boolean;
  location: string;
  coverImage: string;
  createdAt: Date;
}

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, FormsModule, EventFormComponent],
  templateUrl: './manage-events.component.html',
  styleUrl: './manage-events.component.css'
})
export class ManageEventsComponent implements OnInit {
  // Form properties
  showEventForm = false;
  selectedEvent: Event | null = null;
  isEditMode = false;

  visibleCount = 6;
  loadMoreIncrement = 6;

  // Filter properties
  searchTerm = '';
  filterType = '';
  filterLocation = '';
  sortBy = 'date';

  // Event data
  events: Event[] = [];
  filteredEvents: Event[] = [];
  displayedEvents: Event[] = [];

  ngOnInit(): void {
    this.generateMockEvents();
    this.filterEvents();
  }

  generateMockEvents(): void {
    const types: ('public' | 'private')[] = ['public', 'private'];
    
    const eventTitles = [
      'Healthcare Innovation Summit', 'Medical Ethics Workshop', 
      'Patient Care Symposium', 'Wellness & Prevention Conference', 
      'Medical Technology Expo', 'Healthcare Policy Forum',
      'Mental Health Awareness Workshop', 'Emergency Response Training'
    ];
    
    const now = new Date();
    
    for (let i = 0; i < eventTitles.length; i++) {
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const startDate = new Date();
      startDate.setDate(now.getDate() + daysOffset);
      startDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2); 
      
      const isOnline = i % 2 === 0; 
      
      this.events.push({
        id: i + 1,
        title: eventTitles[i],
        description: `Event description for ${eventTitles[i]}`,
        type: types[i % types.length],
        startDate: startDate,
        endDate: endDate,
        isOnline: isOnline,
        location: isOnline ? 'Online' : 'Medical Center',
        coverImage: 'https://placehold.co/800x300?text=Event+Image', // placeholder
        createdAt: new Date(startDate.getTime() - 1000*60*60*24*7) 
      });
    }
  }

  filterEvents(): void {
    let filtered = [...this.events];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (this.filterType) {
      filtered = filtered.filter(event => event.type === this.filterType);
    }
    
    // Apply location filter
    if (this.filterLocation) {
      if (this.filterLocation === 'online') {
        filtered = filtered.filter(event => event.isOnline);
      } else if (this.filterLocation === 'in-person') {
        filtered = filtered.filter(event => !event.isOnline);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const now = new Date();
      
      switch (this.sortBy) {
        case 'date':
          return a.startDate.getTime() - b.startDate.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
    
    this.filteredEvents = filtered;
    this.updateDisplayedEvents();
  }

  updateDisplayedEvents(): void {
    this.displayedEvents = this.filteredEvents.slice(0, this.visibleCount);
  }

  loadMore(): void {
    this.visibleCount = Math.min(
      this.visibleCount + this.loadMoreIncrement,
      this.filteredEvents.length
    );
    this.updateDisplayedEvents();
  }

  getEventStatus(event: Event): string {
    const now = new Date();
    if (event.startDate > now) {
      return 'upcoming';
    } else if (event.endDate < now) {
      return 'completed';
    } else {
      return 'ongoing';
    }
  }

  createEvent(): void {
    this.isEditMode = false;
    this.selectedEvent = null;
    this.showEventForm = true;
  }

  editEvent(event: Event): void {
    this.isEditMode = true;
    this.selectedEvent = { ...event }; 
    this.showEventForm = true;
  }

  handleEventFormClose(): void {
    this.showEventForm = false;
  }

  handleEventFormSubmit(eventData: any): void {
    if (this.isEditMode && this.selectedEvent) {
      // Update existing event
      const index = this.events.findIndex(e => e.id === this.selectedEvent!.id);
      if (index !== -1) {
        this.events[index] = {
          ...this.events[index],
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          isOnline: eventData.isOnline,
          location: eventData.location,
        };
      }
    } else {
      // Add new event
      const newEvent = {
        id: this.events.length + 1,
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        isOnline: eventData.isOnline,
        location: eventData.location,
        coverImage: 'https://placehold.co/800x300?text=Event+Image', // placeholder
        createdAt: new Date()
      };
      this.events.push(newEvent as Event);
    }
    
    this.filterEvents();
    this.showEventForm = false;
  }
}