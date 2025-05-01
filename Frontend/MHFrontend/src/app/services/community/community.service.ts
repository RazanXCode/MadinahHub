import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}

export interface CommunityEventDto {
  publicEventId: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  status: number;
  imageUrl?: string;
}

export interface CommunityNameDto {
  communityId: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = `http://localhost:5021/communities`;

  constructor(private http: HttpClient) { }

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
    return this.http.get<CommunityDto[]>(`${this.apiUrl}/getAllCommunities`);
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
  joinCommunity(publicCommunityId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/joinCommunity/${publicCommunityId}`, {});
  }

  // Leave a community
  leaveCommunity(publicCommunityId: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/leaveCommunity/${publicCommunityId}`, {});
  }

  // Get events for a specific community
  getCommunityEvents(publicCommunityId: string): Observable<CommunityEventDto[]> {
    return this.http.get<CommunityEventDto[]>(`${this.apiUrl}/events/${publicCommunityId}`);
  }
}