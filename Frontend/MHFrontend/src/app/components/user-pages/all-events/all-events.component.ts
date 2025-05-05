import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NavbarComponent } from '../navbar/navbar.component';
import { EventService, Event as AppEvent } from '../../../services/event/event.service';
import { BookingsService } from '../../../services/booking/booking.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Interface for event display format
interface EventDisplay {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  description: string;
  organizer: string;
  attendees: number;
  capacity: number;
  duration: string;
  requirements?: string;
  isPrivate: boolean;
}

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
    DialogModule,
    ToastModule,
    NavbarComponent
  ],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css',
  providers: [MessageService]
})
export class AllEventsComponent implements OnInit {
  // Search and filter
  searchTerm: string = '';
  filterBy: string = '';
  
  // Modal properties
  displayEventModal: boolean = false;
  selectedEvent: EventDisplay | null = null;
  
  // Data arrays
  events: EventDisplay[] = [];
  
  // Loading and error states
  loading: boolean = false;
  error: string | null = null;
  bookingInProgress: boolean = false;
  
  filterOptions = [
    { label: 'Date (Newest)', value: 'date-newest' },
    { label: 'Date (Oldest)', value: 'date-oldest' },
    { label: 'Location', value: 'location' },
    { label: 'Event Type', value: 'type' }
  ];

  constructor(
    private eventService: EventService,
    private bookingsService: BookingsService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this.loadEvents();
  }
  
  loadEvents(): void {
    this.loading = true;
    this.error = null;
    
    this.eventService.getEvents()
      .pipe(
        catchError(error => {
          this.error = 'Failed to load events. Please try again later.';
          console.error('Error loading events:', error);
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(events => {
        this.events = events.map(event => this.mapEventToDisplay(event));
        this.applyFilter(); // Apply any selected filter
      });
  }
  
  mapEventToDisplay(event: AppEvent): EventDisplay {
    // Format date and time from the API date
    const startDate = new Date(event.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    // Calculate duration if endDate is available
    let duration = '2 hours'; // Default
    if (event.endDate) {
      const endDate = new Date(event.endDate);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
      duration = `${durationHours} hours`;
    }
    
    // Calculate estimated attendees (for demo purposes)
    // In a real app, you'd get this from an API endpoint
    const estimatedAttendees = Math.floor(event.capacity * 0.7);
    
    return {
      id: event.publicEventId,
      title: event.title,
      date: formattedDate,
      time: formattedTime,
      location: event.location,
      imageUrl: event.imageUrl || '../../../../assets/image.png',
      description: event.description,
      organizer: 'Event Organizer', // Default value if not available
      attendees: estimatedAttendees,
      capacity: event.capacity,
      duration: duration,
      requirements: 'No special requirements', // Default value if not available
      isPrivate: event.eventType === 'Private' // Assuming 'Private' is the value for private events
    };
  }

  // Method to filter events based on search term
  get filteredEvents() {
    if (this.loading) {
      return [];
    }
    
    let filtered = this.events;
    
    // Apply search term filter
    if (this.searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Apply dropdown filter
    if (this.filterBy) {
      filtered = this.applyDropdownFilter(filtered);
    }
    
    return filtered;
  }
  
  // Apply selected filter from dropdown
  applyDropdownFilter(events: EventDisplay[]): EventDisplay[] {
    switch(this.filterBy) {
      case 'date-newest':
        return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-oldest':
        return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'location':
        return [...events].sort((a, b) => a.location.localeCompare(b.location));
      case 'type':
        return [...events].sort((a, b) => {
          if (a.isPrivate === b.isPrivate) return 0;
          return a.isPrivate ? -1 : 1;
        });
      default:
        return events;
    }
  }
  
  // Apply current filter
  applyFilter(): void {
    // This method is intentionally empty as filtering is done in the getter
    // It's called after loading data to ensure filters are applied
  }

  // Method to open the modal with event details
  showEventDetails(event: EventDisplay) {
    this.selectedEvent = event;
    this.displayEventModal = true;
  }
  
  // Helper method to get spots left text
  getSpotsLeft(event: EventDisplay): string {
    const spotsLeft = event.capacity - event.attendees;
    return `${spotsLeft} / ${event.capacity}`;
  }
  
  // Retry loading events
  retryLoading(): void {
    this.loadEvents();
  }

  // Book event method
  bookEvent(event: EventDisplay): void {
    if (!event) return;
    
    this.bookingInProgress = true;
    
    this.bookingsService.bookEvent(event.id)
      .pipe(
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Booking Failed',
            detail: 'There was a problem booking this event. Please try again later.'
          });
          console.error('Error booking event:', error);
          return of(null);
        }),
        finalize(() => {
          this.bookingInProgress = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Booking Successful',
            detail: `You have successfully booked ${event.title}!`
          });
          
          // Close the modal after successful booking
          this.displayEventModal = false;
          
          // Optionally refresh the events list
          this.loadEvents();
        }
      });
  }
}