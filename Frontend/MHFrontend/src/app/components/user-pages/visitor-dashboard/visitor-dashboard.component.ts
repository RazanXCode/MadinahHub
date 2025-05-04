import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommunityService, CommunityDto } from '../../../services/community/community.service';
import { EventService, Event as AppEvent } from '../../../services/event/event.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
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
}

// Interface for displaying communities in the UI
interface CommunityDisplay {
  id: string;
  name: string;
  description: string;
  members: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, DialogModule, NavbarComponent], 
  templateUrl: './visitor-dashboard.component.html',
  styleUrl: './visitor-dashboard.component.css'
})
export class VisitorDashboardComponent implements OnInit {
  // Modal properties
  displayEventModal: boolean = false;
  selectedEvent: any = null;
  
  // Data arrays
  communities: CommunityDisplay[] = [];
  events: EventDisplay[] = [];
  
  // Loading states
  loadingCommunities: boolean = false;
  loadingEvents: boolean = false;
  
  // Error states
  communityError: string | null = null;
  eventError: string | null = null;
  
  // User properties
  userName: string = '';

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
  
  constructor(
    private communityService: CommunityService,
    private eventService: EventService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadCommunities();
    this.loadEvents();

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.username || (profile as any).userName || 'User';
      }
    });
  }
  
  loadCommunities(): void {
    this.loadingCommunities = true;
    this.communityError = null;
    
    this.communityService.getAllCommunities()
      .pipe(
        catchError(error => {
          this.communityError = 'Failed to load communities. Please try again later.';
          console.error('Error loading communities:', error);
          return of([]);
        }),
        finalize(() => this.loadingCommunities = false)
      )
      .subscribe(communities => {
        this.communities = communities.map(community => this.mapCommunityToDisplay(community));
      });
  }
  
  loadEvents(): void {
    this.loadingEvents = true;
    this.eventError = null;
    
    this.eventService.getEvents()
      .pipe(
        catchError(error => {
          this.eventError = 'Failed to load events. Please try again later.';
          console.error('Error loading events:', error);
          return of([]);
        }),
        finalize(() => this.loadingEvents = false)
      )
      .subscribe(events => {
        this.events = events.map(event => this.mapEventToDisplay(event));
      });
  }
  
  mapCommunityToDisplay(community: CommunityDto): CommunityDisplay {
    return {
      id: community.publicCommunityId,
      name: community.name,
      description: community.description,
      members: community.memberCount,
      imageUrl: community.imageUrl || '../../../../assets/landing3.png'
    };
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
      organizer: 'Community Organizer', // Default value if not available
      attendees: Math.floor(event.capacity * 0.7), // Simulated attendees count
      capacity: event.capacity,
      duration: duration,
      isPrivate: event.eventType === 'Private' // Assuming 'Private' is the value for private events
    };
  }
  
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