import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityFormComponent } from '../community-form/community-form.component'; 

interface Community {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private';  
  memberCount: number;
  createdAt: Date;
  coverImage: string;
}

@Component({
  selector: 'app-manage-communities',
  standalone: true,
  imports: [CommonModule, FormsModule, CommunityFormComponent],
  templateUrl: './manage-communities.component.html',
  styleUrl: './manage-communities.component.css'
})
export class ManageCommunitiesComponent implements OnInit {
  // UI state
  showCommunityForm = false;
  selectedCommunity: Community | null = null;
  isEditMode = false;
  
  visibleCount = 8; 
  loadMoreIncrement = 8;
  
  startIndex = 0;
  endIndex = 0;

  // Filter 
  searchTerm = '';
  filterType = '';
  sortBy = 'name';
  
  // Data
  communities: Community[] = [];
  filteredCommunities: Community[] = [];
  paginatedCommunities: Community[] = [];
  
  ngOnInit(): void {
    this.generateMockCommunities();
    this.filterCommunities();
  }

  generateMockCommunities(): void {
    const types: ('public' | 'private')[] = ['public', 'private'];
    
    const communityNames = [
      'Health & Wellness', 'Medical Professionals', 
      'Patient Support', 'Fitness Group', 
      'Nutrition Experts', 'Mental Health Awareness',
      'Cardiology Network', 'Pediatric Care', 
      'Women\'s Health', 'Senior Living', 
      'Diabetes Management', 'Cancer Support'
    ];
    
    for (let i = 0; i < communityNames.length; i++) {
      this.communities.push({
        id: i + 1,
        name: communityNames[i],
        description: `Community for ${communityNames[i].toLowerCase()}`,
        type: types[i % 2], 
        memberCount: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        coverImage: 'https://placehold.co/800x200?text=Community+Image'
      });
    }
  }

  // filtering
  filterCommunities(): void {
    let filtered = [...this.communities];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.description.toLowerCase().includes(term)
      );
    }
    
    // Type filter
    if (this.filterType) {
      filtered = filtered.filter(c => c.type === this.filterType);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return b.memberCount - a.memberCount;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'activity':
          return b.createdAt.getTime() - a.createdAt.getTime(); 
        default:
          return 0;
      }
    });
    
    this.filteredCommunities = filtered;
    
    // Reset visible count on filter change
    this.visibleCount = Math.min(8, this.filteredCommunities.length);
    
    this.updatePagination();
  }

  // load more 
  updatePagination(): void {
    // Show only the first visibleCount items
    this.paginatedCommunities = this.filteredCommunities.slice(0, this.visibleCount);
    this.startIndex = 0;
    this.endIndex = this.paginatedCommunities.length;
  }

  loadMore(): void {
    // Calculate how many more items to show 
    const newVisibleCount = Math.min(
      this.visibleCount + this.loadMoreIncrement,
      this.filteredCommunities.length
    );
    
    // Update the visible count and refresh the displayed items
    this.visibleCount = newVisibleCount;
    this.updatePagination();
  }

  // Form handlers
  createCommunity(): void {
    this.isEditMode = false;
    this.selectedCommunity = null;
    this.showCommunityForm = true;
  }

  editCommunity(community: Community): void {
    this.isEditMode = true;
    this.selectedCommunity = { ...community };
    this.showCommunityForm = true;
  }

  handleCommunityFormClose(): void {
    this.showCommunityForm = false;
  }

  // Simplified submission handler
  handleCommunityFormSubmit(communityData: any): void {
    if (this.isEditMode && this.selectedCommunity) {
      // Update existing
      const index = this.communities.findIndex(c => c.id === this.selectedCommunity!.id);
      if (index !== -1) {
        this.communities[index].name = communityData.name;
        this.communities[index].description = communityData.description;
      }
    } else {
      // Create new
      this.communities.push({
        id: this.communities.length + 1,
        name: communityData.name,
        description: communityData.description,
        type: 'public', // Default to public
        memberCount: 0,
        createdAt: new Date(),
        coverImage: 'https://placehold.co/800x200?text=Community+Image'
      });
    }
    
    this.filterCommunities();
    this.showCommunityForm = false;
  }
}