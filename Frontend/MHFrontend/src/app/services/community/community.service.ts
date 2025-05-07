import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../auth.service';
import { Event } from '../event/event.service';


// DTOs
export interface CreateCommunityDto {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface CommunityDto {
  publicCommunityId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  imageUrl?: string;
  isMember: boolean; 
}

export interface CommunityEventDto {
  publicEventId: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  status: string;
  imageUrl?: string;
  capacity?: number;
  EventType: string;
  isPrivate: boolean;
}


export interface CommunityNameDto {
  communityId: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = `https://localhost:44367/communities`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Create a new community
  createCommunity(community: CreateCommunityDto): Observable<CommunityDto> {
    return this.http.post<CommunityDto>(`${this.apiUrl}/createCommunity`, community);
  }

  // Get a community by ID
  getCommunity(publicCommunityId: string): Observable<CommunityDto> {
    return this.http.get<CommunityDto>(`${this.apiUrl}/getCommunity/${publicCommunityId}`);
  }

  // Get all communities
  

  getAllCommunities(): Observable<CommunityDto[]> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<CommunityDto[]>(`${this.apiUrl}/getAllCommunities`, { headers });
      })
    );
  }

  // Get community names
  getCommunityNames(): Observable<CommunityNameDto[]> {
    return this.http.get<CommunityNameDto[]>(`${this.apiUrl}/GetCommunitiesNames`);
  }
  // Update a community
  updateCommunity(publicCommunityId: string, community: CreateCommunityDto): Observable<string> {
    return this.http.put(`${this.apiUrl}/updateCommunity/${publicCommunityId}`, community, {
      responseType: 'text'
    });
  }

  // Delete a community
  deleteCommunity(publicCommunityId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/deleteCommunity/${publicCommunityId}`, {
      responseType: 'text'
    });
  }
  // Join a community
  joinCommunity(publicCommunityId: string) {
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) => {
        const headers = new HttpHeaders().set(
          'Authorization', `Bearer ${token}`
        );
        return this.http.post(
          `${this.apiUrl}/joinCommunity/${publicCommunityId}`,
          {},
          { headers }
        );
      })
    );
  }


 
  // Leave a community
  leaveCommunity(publicCommunityId: string): Observable<string> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<string>(
          `${this.apiUrl}/leaveCommunity/${publicCommunityId}`,
          {},
          { headers }
        );
      })
    );
  }
  

  // Get events for a specific community
  getCommunityEvents(publicCommunityId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/${publicCommunityId}`);
  }
}