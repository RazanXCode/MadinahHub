import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, catchError, of, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export interface User {
  publicUserId: string;
  userName: string;
  address: string;
  phoneNumber: string;
  role: string;
  createdAt: Date | string;
}

export interface UserDto {
  publicUserId: string;
  userName: string;
  address: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface UserCommunityDto {
  publicCommunityId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  imageUrl: string;
  joinDate: string;
}

export interface UserEventDto {
  publicEventId: string;
  title: string;
  description: string;
  location: string;
  capacity: number;
  startDate: string;
  endDate: string;
  status: string;
  eventType: string;
  createdAt: string;
  imageUrl: string;
  communityName: string;
}

export interface UserTicketDto {
  publicTicketId: string;
  qrCode: string;
  createdAt: string;
  status: string;
  eventTitle: string;
  communityName: string;
  publicBookingId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5063/api/User';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Helper method to get authenticated headers
  private getAuthHeaders(): Observable<HttpHeaders> {
    // Try to use the token from localStorage first for better performance
    const token = localStorage.getItem('jwt_token');
    if (token) {
      return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
    }

    // If no token in localStorage, get it from the AuthService
    return this.authService.getAuthHeaders();
  }

  // Get all users
  getUsers(): Observable<UserDto[]> {
    console.log('Fetching all users');

    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserDto[]>(this.apiUrl, { headers });
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  // Get specific user by public ID
  getUser(publicUserId: string): Observable<UserDto> {
    console.log('Fetching user with ID:', publicUserId);

    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserDto>(`${this.apiUrl}/${publicUserId}`, { headers });
      }),
      catchError(error => {
        console.error(`Error fetching user ${publicUserId}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Get communities the user is joining
  getUserCommunities(publicUserId: string): Observable<UserCommunityDto[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserCommunityDto[]>(`${this.apiUrl}/${publicUserId}/communities`, { headers });
      }),
      catchError(error => {
        console.error(`Error fetching communities for user ${publicUserId}:`, error);
        return of([]);
      })
    );
  }

  // Get events that the user booked
  getUserBookedEvents(publicUserId: string): Observable<UserEventDto[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserEventDto[]>(`${this.apiUrl}/${publicUserId}/booked-events`, { headers });
      }),
      catchError(error => {
        console.error(`Error fetching booked events for user ${publicUserId}:`, error);
        return of([]);
      })
    );
  }

  // Get tickets the user has
  getUserTickets(publicUserId: string): Observable<UserTicketDto[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<UserTicketDto[]>(`${this.apiUrl}/${publicUserId}/tickets`, { headers });
      }),
      catchError(error => {
        console.error(`Error fetching tickets for user ${publicUserId}:`, error);
        return of([]);
      })
    );
  }

  // Delete a user
  deleteUser(publicUserId: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.delete(`${this.apiUrl}/${publicUserId}`, { headers });
      }),
      catchError(error => {
        console.error(`Error deleting user ${publicUserId}:`, error);
        return throwError(() => error);
      })
    );
  }
}