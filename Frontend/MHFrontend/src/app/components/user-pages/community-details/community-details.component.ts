import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommunityService } from '../../../services/community/community.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { catchError, finalize, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from "../navbar/navbar.component";
import { Event } from '../../../services/event/event.service';
import { forkJoin } from 'rxjs';
import { BookingsService } from '../../../services/booking/booking.service';
import { CommunityChatComponent } from '../community-chat/community-chat.component';
import { FooterComponent } from '../../footer/footer.component';
import { FirebaseMessagingService } from '../../../services/firebase-messaging/firebase-messaging.service';

@Component({
  selector: 'app-community-details',
  standalone: true,
  imports: [
    CommonModule, 
    DialogModule, 
    ButtonModule, 
    ToastModule, 
    NavbarComponent, 
    RouterModule,
    CommunityChatComponent,
    FooterComponent
  ], 
  templateUrl: './community-details.component.html',
  styleUrl: './community-details.component.css',
  providers: [MessageService]
})
export class CommunityDetailsComponent implements OnInit {
  community: any;
  events: Event[] = [];
  selectedEvent: Event | null = null;
  displayEventModal: boolean = false;
  bookingInProgress: boolean = false;
  isLoading = true;
  error: string | null = null;
  showChat = false;

  constructor(
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private router: Router,
    private bookingsService: BookingsService,
    private messageService: MessageService,
    private fcmService: FirebaseMessagingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCommunity(id);
    } else {
      this.error = 'Invalid community ID';
      this.isLoading = false;
    }
    // Initialize Firebase Cloud Messaging
    this.fcmService.requestPermission();
    this.fcmService.receiveMessage();
  }

  private loadCommunity(id: string): void {
    forkJoin([
      this.communityService.getCommunity(id),
    ]).subscribe({
      next: ([community]) => {
        this.community = community;
        this.loadCommunityEvents(id);
      },
      error: (err) => {
        console.error('Failed to load community or bookings', err);
        this.error = 'Failed to load community details';
        this.isLoading = false;
      }
    });
  }
    
  private loadCommunityEvents(communityId: string): void {
    this.communityService.getCommunityEvents(communityId).subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load community events', err);
        this.error = 'Failed to load community events';
        this.isLoading = false;
      }
    });
  }

  onLeaveCommunity(): void {
    if (!this.community?.publicCommunityId) {
      this.error = 'Invalid community ID';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid community ID',
        life: 3000
      });
      return;
    }
  
    this.communityService.leaveCommunity(this.community.publicCommunityId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Left Community',
          detail: 'You have successfully left the community.',
          life: 3000
        });
  
        // Delay navigation to allow user to see the message
        setTimeout(() => {
          this.router.navigate(['/communities']);
        }, 3000);
      },
    });
  }
    
  // Show event details in modal
  showEventDetails(event: Event) {
    this.selectedEvent = event;
    this.displayEventModal = true;
  }

  // Toggle chat visibility
  toggleChat() {
    this.showChat = !this.showChat;
  }

  // Book event method
  bookEvent(event: Event): void {
    if (!event) return;
    
    this.bookingInProgress = true;
    
    this.bookingsService.bookEvent(event.publicEventId)
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
          //reload events after booking
          this.loadCommunityEvents(this.community.publicCommunityId);
        }
      });
      
  }
}