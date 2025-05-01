import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventFormComponent } from '../event-form/event-form.component'; 
import { EventService, Event, EventCreate, EventUpdate } from '../../../services/event/event.service';

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
  pendingDeleteEvent: Event | null = null;
  // Filter properties
  searchTerm = '';
  filterType = '';
  filterLocation = '';
  sortBy = 'date';

  // Event data
  events: Event[] = [];
  filteredEvents: Event[] = [];
  displayedEvents: Event[] = [];

  // UI state
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private eventService: EventService) {}
  ngOnInit(): void {
    this.loadEvents();
  }
  loadEvents(): void {
    this.isLoading = true;
    this.error = null;
    
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data.map(event => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate)
        }));
        this.isLoading = false;
        this.filterEvents();
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again.';
        this.isLoading = false;
      }
    });
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
      filtered = filtered.filter(event => event.eventType.toLowerCase() === this.filterType);
    }
    // Apply location filter
    if (this.filterLocation) {
      if (this.filterLocation === 'online') {
        filtered = filtered.filter(event => event.location.toLowerCase().includes('online'));
      } else if (this.filterLocation === 'in-person') {
        filtered = filtered.filter(event => !event.location.toLowerCase().includes('online'));
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
  getEventStatus(event: any): string {
    return (event.status || '').toLowerCase() || 'unknown';
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
      const updateData: EventUpdate = {
        ...eventData
      };
      this.eventService.updateEvent(this.selectedEvent.publicEventId, updateData).subscribe({
        next: () => {
          // Success 
          this.loadEvents();
          this.showEventForm = false;
          this.successMessage = 'Event updated successfully!';
          setTimeout(() => this.successMessage = null, 5000); 
        },
        error: (err) => {
          console.error('Error updating event:', err);
          this.error = 'Failed to update event. Please try again.';
          setTimeout(() => this.error = null, 5000); 
        }
      });
    } else {
    // Add new event
    const createData: EventCreate = {
      ...eventData,
      eventType: eventData.eventType === 'public' ? 0 : 1,
      createdBy: 1, // Hardcoded user ID
      communityId: 2  // Hardcoded community ID
    };
      this.eventService.createEvent(createData).subscribe({
        next: (createdEvent) => {
          this.loadEvents();
          this.showEventForm = false;
          this.successMessage = 'New event created successfully!';
          setTimeout(() => this.successMessage = null, 5000);
        },
        error: (err) => {
          console.error('Error creating event:', err);
          this.error = 'Failed to create event. Please try again.';
          setTimeout(() => this.error = null, 5000);
        }
      });
    }
  }
  // Show confirmation before deleting
  confirmDeleteEvent(event: Event): void {
    this.pendingDeleteEvent = event;
  }
  // Delete event
  deleteEvent(): void {
    if (!this.pendingDeleteEvent) return;
    
    const event = this.pendingDeleteEvent;
    this.eventService.deleteEvent(event.publicEventId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.publicEventId !== event.publicEventId);
        this.filterEvents();
        this.successMessage = `"${event.title}" has been deleted successfully.`;
        setTimeout(() => this.successMessage = null, 5000);
        this.pendingDeleteEvent = null;
      },
      error: (err) => {
        console.error('Error deleting event:', err);
        this.error = 'Failed to delete event. Please try again.';
        setTimeout(() => this.error = null, 5000);
        this.pendingDeleteEvent = null;
      }
    });
  }
  cancelDelete(): void {
    this.pendingDeleteEvent = null;
  }
}