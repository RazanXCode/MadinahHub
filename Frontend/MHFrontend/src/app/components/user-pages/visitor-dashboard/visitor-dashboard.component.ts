import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommunityService } from '../../../services/community/community.service';
import { EventService } from '../../../services/event/event.service';
import {
  UserService,
  UserCommunityDto,
  UserEventDto,
} from '../../../services/users/users.service';
import {
  BookingsService,
  BookingDto,
} from '../../../services/booking/booking.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseMessagingService } from '../../../services/firebase-messaging/firebase-messaging.service';
import { FooterComponent } from '../../footer/footer.component';

// Interface for displaying events in the UI
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
  status: string;
  publicBookingId?: string;
}

// Interface for displaying communities in the UI
interface CommunityDisplay {
  id: string;
  name: string;
  description: string;
  members: number;
  imageUrl?: string;
  joinDate: string;
}

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CarouselModule,
    ButtonModule,
    DialogModule,
    NavbarComponent,
    ToastModule,
    FooterComponent,
  ],
  templateUrl: './visitor-dashboard.component.html',
  styleUrl: './visitor-dashboard.component.css',
  providers: [MessageService],
})
export class VisitorDashboardComponent implements OnInit {
  // Modal properties
  displayEventModal: boolean = false;
  selectedEvent: EventDisplay | null = null;

  // Data arrays
  communities: CommunityDisplay[] = [];
  events: EventDisplay[] = [];
  userBookings: BookingDto[] = [];

  // Loading states
  loadingCommunities: boolean = false;
  loadingEvents: boolean = false;
  loadingBookings: boolean = false;
  cancellingBooking: boolean = false;

  // Error states
  communityError: string | null = null;
  eventError: string | null = null;
  bookingError: string | null = null;

  // User properties
  userName: string = '';
  publicUserId: string = '';

  // Enhanced responsive options for better mobile experience
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '1200px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '992px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  constructor(
    private communityService: CommunityService,
    private eventService: EventService,
    private userService: UserService,
    private bookingsService: BookingsService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private fcmService: FirebaseMessagingService
  ) {}

  ngOnInit(): void {
    // Get user profile info first, then load user-specific data
    this.authService.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userName = profile.username || (profile as any).userName || 'User';
        this.publicUserId = (profile as any).publicUserId || '';

        // Load user communities, events, and bookings once we have the user ID
        if (this.publicUserId) {
          this.loadUserCommunities();
          this.loadUserBookedEvents();
          this.loadUserBookings();
        }
      }
    });
    // Initialize Firebase Cloud Messaging
    this.fcmService.requestPermission();
    this.fcmService.receiveMessage();
  }

  loadUserCommunities(): void {
    this.loadingCommunities = true;
    this.communityError = null;

    this.userService
      .getUserCommunities(this.publicUserId)
      .pipe(
        catchError((error) => {
          this.communityError =
            'Failed to load your communities. Please try again later.';
          console.error('Error loading user communities:', error);
          return of([]);
        }),
        finalize(() => (this.loadingCommunities = false))
      )
      .subscribe((communities) => {
        this.communities = communities.map((community) =>
          this.mapUserCommunityToDisplay(community)
        );
      });
  }

  loadUserBookedEvents(): void {
    this.loadingEvents = true;
    this.eventError = null;

    this.userService
      .getUserBookedEvents(this.publicUserId)
      .pipe(
        catchError((error) => {
          this.eventError =
            'Failed to load your booked events. Please try again later.';
          console.error('Error loading user booked events:', error);
          return of([]);
        }),
        finalize(() => (this.loadingEvents = false))
      )
      .subscribe((events) => {
        this.events = events.map((event) => this.mapUserEventToDisplay(event));

        // Associate bookings with events once both are loaded
        if (this.userBookings.length > 0) {
          this.associateBookingsWithEvents();
        }
      });
  }

  loadUserBookings(): void {
    this.loadingBookings = true;
    this.bookingError = null;

    this.bookingsService
      .getUserBookings()
      .pipe(
        catchError((error) => {
          this.bookingError = 'Failed to load your bookings.';
          console.error('Error loading user bookings:', error);
          return of([]);
        }),
        finalize(() => (this.loadingBookings = false))
      )
      .subscribe((bookings) => {
        this.userBookings = bookings;
        console.log('User bookings loaded:', this.userBookings);

        // Associate bookings with events if events are already loaded
        if (this.events.length > 0) {
          this.associateBookingsWithEvents();
        }
      });
  }

  navigateToCommunity(communityId: string): void {
    this.router.navigate(['/community', communityId]);
  }
  // associateBookingsWithEvents method with this:
  associateBookingsWithEvents(): void {
    if (!this.events.length || !this.userBookings.length) return;

    // Create a booking lookup map by event ID
    const bookingsByEventId = new Map<string, BookingDto>();
    this.userBookings.forEach((booking) => {
      // Only include confirmed bookings (not cancelled ones)
      if (booking.publicEventId && booking.status === 'Confirmed') {
        bookingsByEventId.set(booking.publicEventId, booking);
      }
    });

    // Filter events to only those with confirmed bookings
    this.events = this.events
      .filter((event) => bookingsByEventId.has(event.id))
      .map((event) => {
        const booking = bookingsByEventId.get(event.id);
        return {
          ...event,
          publicBookingId: booking?.publicBookingId,
        };
      });

    console.log('Events with confirmed bookings:', this.events);
  }

  mapUserCommunityToDisplay(community: UserCommunityDto): CommunityDisplay {
    // Format join date
    const joinDate = new Date(community.joinDate);
    const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return {
      id: community.publicCommunityId,
      name: community.name,
      description: community.description,
      members: community.memberCount,
      imageUrl: community.imageUrl || '../../../../assets/landing3.png',
      joinDate: formattedJoinDate,
    };
  }

  mapUserEventToDisplay(event: UserEventDto): EventDisplay {
    // Format date and time from the API date
    const startDate = new Date(event.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Calculate duration if endDate is available
    let duration = '2 hours'; // Default
    if (event.endDate) {
      const endDate = new Date(event.endDate);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours =
        Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
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
      organizer: event.communityName || 'Community Organizer',
      attendees: Math.floor(event.capacity * 0.7), // Simulated attendees count
      capacity: event.capacity,
      duration: duration,
      isPrivate: event.eventType === 'Private',
      status: event.status,
      // publicBookingId will be set in associateBookingsWithEvents
    };
  }

  showEventDetails(event: EventDisplay) {
    this.selectedEvent = event;
    this.displayEventModal = true;
  }



  // Cancel a booking using the actual publicBookingId
  cancelBooking(event: EventDisplay): void {
    if (!event.publicBookingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Booking ID not found for this event. Please try refreshing the page.',
      });
      return;
    }

    this.cancellingBooking = true;
    console.log(`Cancelling booking with ID: ${event.publicBookingId}`);

    this.bookingsService
      .cancelBooking(event.publicBookingId)
      .pipe(
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to cancel booking. Please try again later.',
          });
          console.error('Error cancelling booking:', error);
          return of(null);
        }),
        finalize(() => {
          this.cancellingBooking = false;
        })
      )
      .subscribe((response) => {
        if (response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Booking cancelled successfully.',
          });

          // Firebase Messaging notification
          this.fcmService.showLocalNotification({
            title: 'Booking Cancelled',
            body: `Your booking for "${this.selectedEvent?.title}" has been cancelled`,
            icon: this.selectedEvent?.imageUrl || '../../../../assets/images/logo.png'
          });
          // Close the modal
          this.displayEventModal = false;

          // Reload the user's booked events and bookings to refresh the list
          this.loadUserBookedEvents();
          this.loadUserBookings();
        }
      });
  }
}
