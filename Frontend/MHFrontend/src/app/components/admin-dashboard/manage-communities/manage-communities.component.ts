import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityFormComponent } from '../community-form/community-form.component';
import { CommunityService, CommunityDto, CreateCommunityDto } from '../../../services/community/community.service';

interface Community {
  publicCommunityId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  imageUrl?: string;
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
  isLoading = false;
  error: string | null = null;
  pendingDeleteCommunity: Community | null = null;

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

  constructor(private communityService: CommunityService) { }

  ngOnInit(): void {
    this.loadCommunities();
  }

  loadCommunities(): void {
    this.isLoading = true;
    this.error = null;

    this.communityService.getAllCommunities().subscribe({
      next: (communities) => {
        this.communities = communities;
        this.isLoading = false;
        this.filterCommunities();
      },
      error: (err) => {
        console.error('Error loading communities:', err);
        this.error = 'Failed to load communities. Please try again.';
        this.isLoading = false;
      }
    });
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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return b.memberCount - a.memberCount;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
  confirmDeleteCommunity(community: Community): void {
    this.pendingDeleteCommunity = community;
  }

  deleteCommunity(): void {
    if (!this.pendingDeleteCommunity) return;

    const communityId = this.pendingDeleteCommunity.publicCommunityId;

    this.communityService.deleteCommunity(communityId).subscribe({
      next: () => {
        // Remove from local arrays
        this.communities = this.communities.filter(c => c.publicCommunityId !== communityId);
        this.filterCommunities();
        this.pendingDeleteCommunity = null;
      },
      error: (err) => {
        console.error('Error deleting community:', err);
        this.error = 'Failed to delete community. Please try again.';
        this.pendingDeleteCommunity = null;
      }
    });
  }
  cancelDelete(): void {
    this.pendingDeleteCommunity = null;
  }

  handleCommunityFormClose(): void {
    this.showCommunityForm = false;
  }

  // submission handler
  handleCommunityFormSubmit(communityData: any): void {
    const createData: CreateCommunityDto = {
      name: communityData.name,
      description: communityData.description,
      imageUrl: communityData.imageUrl || null
    };

    if (this.isEditMode && this.selectedCommunity) {
      // Update existing community
      this.communityService.updateCommunity(this.selectedCommunity.publicCommunityId, createData).subscribe({
        next: () => {
          this.loadCommunities(); // Reload all communities
          this.showCommunityForm = false;
        },
        error: (err) => {
          console.error('Error updating community:', err);
          this.error = 'Failed to update community. Please try again.';
        }
      });
    } else {
      // Create new community
      this.communityService.createCommunity(createData).subscribe({
        next: (newCommunity) => {
          this.communities.push(newCommunity);
          this.filterCommunities();
          this.showCommunityForm = false;
        },
        error: (err) => {
          console.error('Error creating community:', err);
          this.error = 'Failed to create community. Please try again.';
        }
      });
    }
  }
}