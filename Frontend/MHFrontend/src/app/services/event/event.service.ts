import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

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
    return this.http.post<Event>(this.apiUrl, event);
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