import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// DTOs
export interface BookingDto {
  publicBookingId: string;
  bookingDate: Date;
  status: string;
  eventTitle: string;
  communityName: string;
  publicEventId: string;
}

export interface BookingCreateResponse {
  publicBookingId: string;
  bookingDate: Date;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private apiUrl = 'http://localhost:5063/Booking';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Book an event
   * @param publicEventId The public ID of the event to book
   */
  bookEvent(publicEventId: string): Observable<BookingCreateResponse> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<BookingCreateResponse>(
          `${this.apiUrl}/BookEvent/${publicEventId}`, 
          {}, 
          { headers }
        );
      })
    );
  }

  /**
   * Cancel a booking
   * @param publicBookingId The public ID of the booking to cancel
   */
  cancelBooking(publicBookingId: string): Observable<string> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(
          `${this.apiUrl}/CancelBooking/${publicBookingId}`, 
          {}, 
          { 
            headers,
            responseType: 'text' 
          }
        );
      })
    );
  }

  /**
   * Get current user's bookings
   */
  getUserBookings(): Observable<BookingDto[]> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<BookingDto[]>(
          `${this.apiUrl}/GetUserBookings`, 
          { headers }
        );
      })
    );
  }
}