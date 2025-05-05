import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityEventDto, CommunityService } from '../../../services/community/community.service';
import { CommonModule } from '@angular/common';
import { Community } from '../../../models/community.model';

@Component({
  selector: 'app-community-details',
  imports: [CommonModule],
  templateUrl: './community-details.component.html',
  styleUrl: './community-details.component.css'
})
export class CommunityDetailsComponent implements OnInit {
  community: any;
  events: CommunityEventDto[] = [];
  isLoading = true;
  error: string | null = null;


    constructor(
      private route: ActivatedRoute,
      private communityService: CommunityService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadCommunity(id);
      } else {
        this.error = 'Invalid community ID';
        this.isLoading = false;
      }
    }
    private loadCommunity(id: string): void {
      this.communityService.getCommunity(id).subscribe({
        next: (data) => {
          this.community = data;
          this.loadCommunityEvents(id);
        },
        error: (err) => {
          console.error('Failed to load community', err);
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
        return;
      }
    
      this.communityService.leaveCommunity(this.community.publicCommunityId).subscribe({
        next: (response) => {
          console.log('Left community successfully:', response);
          this.router.navigate(['/communities']); 
        },
        error: (err) => {
          console.error('Failed to leave community', err);
          this.error = 'Failed to leave community';
        }
      });
    }
    
    }
  
