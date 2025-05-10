import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Community } from '../../../models/community.model';
import { CommunityDto, CommunityService } from '../../../services/community/community.service';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../../footer/footer.component";
@Component({
  selector: 'app-communites',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './communites.component.html',
  styleUrl: './communites.component.css'
})
export class CommunitesComponent  implements OnInit {
  communities: CommunityDto[] = [];



  constructor(private communityService: CommunityService, private router: Router
      
  ) { }

  ngOnInit(): void {
    
    this.loadCommunities();
  }

  
  loadCommunities(): void {
    this.communityService.getAllCommunities().subscribe({
      next: (communities) => {
        this.communities = communities;
      },
      error: (err) => {
        console.error('Failed to load communities', err);
      }
    });
  }

  // This function will check if the user is a member of the community
  handelIsMember(community: CommunityDto): void {
    if (community.isMember) {
      // Navigate to community details
      this.router.navigate(['/community', community.publicCommunityId]);
    } else {
      // Join community then navigate to details
      this.communityService.joinCommunity(community.publicCommunityId).subscribe({
        next: () => {
          this.loadCommunities();
          this.router.navigate(['/community', community.publicCommunityId]);
        },
        error: (err) => {
          console.error('Failed to join community', err);
        }
      });
  
  
}
  }
}












  