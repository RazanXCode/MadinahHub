import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Community } from '../../../models/community.model';

@Component({
  selector: 'app-communites',
  imports: [CommonModule],
  templateUrl: './communites.component.html',
  styleUrl: './communites.component.css'
})
export class CommunitesComponent  implements OnInit {
  communities: Community[] = [];

  ngOnInit(): void {
   
    this.communities = [
        {
          id: '1',
          name: 'Angular Enthusiasts',
          description: 'For developers passionate about Angular framework',
          imageUrl: 'https://cdn.worldvectorlogo.com/logos/angular-icon-1.svg',
          membersCount: 1250,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          name: 'Nature Photographers',
          description: 'Share and discuss beautiful nature photography',
          imageUrl: '',
          membersCount: 842,
          createdAt: new Date('2023-02-01'),
        },
        {
          id: '3',
          name: 'Healthy Cooking',
          description: 'Recipe sharing and cooking tips for a healthy lifestyle',
          imageUrl: '',
          membersCount: 1567,
          createdAt: new Date('2023-03-01'),
        },
        {
          id: '4',
          name: 'Startup Founders',
          description: 'Network with fellow entrepreneurs',
          imageUrl: '',
          membersCount: 723,
          createdAt: new Date('2023-04-01'),
        },
        
    ];
      
    //TODO: joinCommunity
  }
}