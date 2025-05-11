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
import { FirebaseMessagingService } from '../../../services/firebase-messaging/firebase-messaging.service';
import { FooterComponent } from '../../footer/footer.component';
// Simplified interface for event display format
interface EventDisplay {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  description: string;
  attendees: number;
  capacity: number;
  duration: string;
  requirements?: string;
  isPrivate: boolean;
  status: string;
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
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css',
  providers: [MessageService]
})
export class AllEventsComponent implements OnInit {
  // Search and filter properties
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
    private messageService: MessageService,
    private fcmService: FirebaseMessagingService
  ) {}
  
  ngOnInit(): void {
    this.loadEvents();
  // Initialize Firebase Cloud Messaging
  this.fcmService.requestPermission();
  this.fcmService.receiveMessage();
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
    
    return {
      id: event.publicEventId,
      title: event.title,
      date: formattedDate,
      time: formattedTime,
      location: event.location,
      imageUrl: event.imageUrl || '../../../../assets/image.png',
      description: event.description,
      status: event.status,
      attendees: Math.floor(event.capacity * 0.7), // Estimated for display
      capacity: event.capacity,
      duration: duration,
      requirements: 'No special requirements',
      isPrivate: event.eventType === 'Private'
    };
  }

  // Getter for filtered events - applied on the fly
  get filteredEvents() {
    if (this.loading) return [];
    
    let filtered = this.events;
    
    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }
    
    // Apply dropdown filter
    if (this.filterBy) {
      switch(this.filterBy) {
        case 'date-newest':
          filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        case 'date-oldest':
          filtered = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'location':
          filtered = [...filtered].sort((a, b) => a.location.localeCompare(b.location));
          break;
        case 'type':
          filtered = [...filtered].sort((a, b) => {
            if (a.isPrivate === b.isPrivate) return 0;
            return a.isPrivate ? -1 : 1;
          });
          break;
      }
    }
    
    return filtered;
  }

  // Show event details in modal
  showEventDetails(event: EventDisplay) {
    this.selectedEvent = event;
    this.displayEventModal = true;
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
          let errorMessage = 'Unable to book this event.';
          
          if (error.status === 400) {
            if (error.error === 'Event is not available for booking') {
              errorMessage = 'This event is not available for booking. It may be full, already started, or canceled.';
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Booking Failed',
            detail: errorMessage
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
          
          // Firebase Messaging notification
          this.fcmService.showLocalNotification({
            title: 'Event Booked',
            body: `You have successfully booked "${event.title}"`,
            icon: event.imageUrl || '../../../../assets/images/logo.png'
          });
          this.displayEventModal = false;
          this.loadEvents();
        }
      });
  }
}