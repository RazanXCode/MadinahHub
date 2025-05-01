import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../user-list/user-list.component';
import { ManageCommunitiesComponent } from '../manage-communities/manage-communities.component';
import { CommunityFormComponent } from '../community-form/community-form.component';
import { EventFormComponent } from '../event-form/event-form.component';
import { ManageEventsComponent } from '../manage-events/manage-events.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent,
    ManageCommunitiesComponent,
    CommunityFormComponent,
    EventFormComponent,
    ManageEventsComponent
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
      case 'manage-events':
        return 'Events';
      case 'event-form':
        return 'Create/Edit Event';
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