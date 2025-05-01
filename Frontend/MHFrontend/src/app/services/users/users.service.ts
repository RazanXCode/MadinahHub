import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  publicUserId: string;
  userName: string;
  address: string;
  phoneNumber: string;
  role: string;
  createdAt: Date;
}

export interface UserCommunity {
  publicCommunityId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  imageUrl: string;
  joinDate: Date;
}

export interface UserEvent {
  publicEventId: string;
  title: string;
  description: string;
  location: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
  status: string;
  eventType: string;
  createdAt: Date;
  imageUrl: string;
  communityName: string;
}

export interface UserTicket {
  publicTicketId: string;
  qrCode: string;
  createdAt: Date;
  status: string;
  eventTitle: string;
  communityName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5021/api/user';

  constructor(private http: HttpClient) {}

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Get a specific user by ID
  getUser(publicUserId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${publicUserId}`);
  }

  // Get communities the user is joining
  getUserCommunities(publicUserId: string): Observable<UserCommunity[]> {
    return this.http.get<UserCommunity[]>(`${this.apiUrl}/${publicUserId}/communities`);
  }

  // Get events that the user booked
  getUserBookedEvents(publicUserId: string): Observable<UserEvent[]> {
    return this.http.get<UserEvent[]>(`${this.apiUrl}/${publicUserId}/booked-events`);
  }

  // Get tickets the user has
  getUserTickets(publicUserId: string): Observable<UserTicket[]> {
    return this.http.get<UserTicket[]>(`${this.apiUrl}/${publicUserId}/tickets`);
  }
}