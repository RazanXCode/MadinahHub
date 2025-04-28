import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../user-list/user-list.component';
import { ManageCommunitiesComponent } from '../manage-communities/manage-communities.component';
import { CommunityFormComponent } from '../community-form/community-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent,
    ManageCommunitiesComponent,
    CommunityFormComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  activeComponent: string = 'dashboard-home';
  sidebarOpen = false;

  setActiveComponent(component: string): void {
    this.activeComponent = component;
  }

  getPageTitle(): string {
    switch (this.activeComponent) {
      case 'dashboard-home':
        return 'Dashboard Overview';
      case 'user-list':
        return 'User Management';
      case 'manage-communities':
        return 'Communities';
      case 'community-form':
        return 'Create/Edit Community';
      default:
        return 'Dashboard';
    }
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  closeSidebarOnMobile() {
    // Only close sidebar if on mobile view
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }
}