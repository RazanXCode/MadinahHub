import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
// Event read model matching backend EventReadDto
export interface Event {
  publicEventId: string;
  title: string;
  description: string;
  location: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
  status: string;
  eventType: string;
  imageUrl: string;
  createdBy: number;
  communityId: number;
}

// Create event model matching backend EventCreateDto
export interface EventCreate {
  title: string;
  description: string;
  location: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
  status: number;
  eventType: number;
  imageUrl?: string;
  createdBy: number;
  communityId: number;
}

// Update event model matching backend EventUpdateDto
export interface EventUpdate {
  title: string;
  description: string;
  location: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
  status: number;
  eventType: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:5063/api/Event';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Get all events
   */
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  /**
   * Get a specific event by ID
   */
  getEventById(publicEventId: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${publicEventId}`);
  }

  /**
   * Create a new event
   */
  createEvent(event: EventCreate): Observable<Event> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const eventForApi = {
          ...event,
          startDate: this.formatDateForApi(event.startDate),
          endDate: this.formatDateForApi(event.endDate)
        };

        return this.http.post<Event>(this.apiUrl, eventForApi, { headers }).pipe(
          catchError(error => {
            // Check for 500 error with serialization issues
            if (error.status === 500 && error.error?.includes('publicEventId')) {
              // Extract just the ID using regex
              const match = /publicEventId":"([^"]+)/.exec(error.error);
              if (match) {
                // Return constructed event
                return of({ ...eventForApi, publicEventId: match[1] } as unknown as Event);
              }
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Update an existing event
   */
  updateEvent(publicEventId: string, event: EventUpdate): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${publicEventId}`, event);
  }

  /**
   * Delete an event
   */
  deleteEvent(publicEventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicEventId}`);
  }
  
  /**
   * Format date string to API compatible format
   */
  formatDateForApi(date: Date): string {
    return date.toISOString();
  }
  
}