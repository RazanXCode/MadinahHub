import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../user-list/user-list.component';
import { ManageCommunitiesComponent } from '../manage-communities/manage-communities.component';
import { CommunityFormComponent } from '../community-form/community-form.component';
import { EventFormComponent } from '../event-form/event-form.component';
import { ManageEventsComponent } from '../manage-events/manage-events.component';
import { CommunityService } from '../../../services/community/community.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/users/users.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserListComponent,
    ManageCommunitiesComponent,
    CommunityFormComponent,
    EventFormComponent,
    ManageEventsComponent,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  activeComponent: string = 'dashboard-home';
  sidebarOpen = false;

  // Dashboard metrics
  totalUsers = 0;
  totalCommunities = 0;
  totalEvents = 0;
  newUsersThisMonth = 0;

  // Recent data
  recentCommunities: any[] = [];
  recentEvents: any[] = [];
  recentUsers: any[] = [];

  // Loading state
  isLoadingDashboard = true;
  dashboardError: string | null = null;

  // User data
  adminName: string = '';

  // Export options
  showExportModal = false;
  exportOptions = {
    users: true,
    communities: false,
    events: false
  };
  constructor(
    private communityService: CommunityService,
    private eventService: EventService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }
  ngOnInit() {
    this.loadDashboardData();

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.adminName = profile.username || (profile as any).userName || 'Admin';
      }
    });
  }

  loadDashboardData() {
    this.isLoadingDashboard = true;
    this.dashboardError = null;

    forkJoin({
      users: this.userService.getUsers(),
      communities: this.communityService.getAllCommunities(),
      events: this.eventService.getEvents()
    }).subscribe({
      next: (results) => {
        // Process user data
        this.totalUsers = results.users.length;
        this.recentUsers = results.users.slice(0, 5);

        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        this.newUsersThisMonth = results.users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= oneMonthAgo && createdAt <= now;
        }).length;

        // Process community data
        this.totalCommunities = results.communities.length;
        this.recentCommunities = results.communities.slice(0, 5);

        // Process event data
        this.totalEvents = results.events.length;

        const upcomingEvents = results.events
          .filter(event => new Date(event.startDate) >= new Date())
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        this.recentEvents = upcomingEvents.slice(0, 5);

        this.isLoadingDashboard = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.dashboardError = 'Failed to load dashboard data. Please try again.';
        this.isLoadingDashboard = false;
      }
    });
  }
  exportInProgress = false;
  setActiveComponent(component: string): void {
    this.activeComponent = component;
  }
  navigateToUsers() {
    this.setActiveComponent('user-list');
  }

  navigateToManageCommunities() {
    this.setActiveComponent('manage-communities');
  }

  navigateToManageEvents() {
    this.setActiveComponent('manage-events');
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
  // Export functionality
  openExportModal(): void {
    this.showExportModal = true;
  }

  isExportSelectionValid(): boolean {
    return this.exportOptions.users || this.exportOptions.communities || this.exportOptions.events;
  }

  // Export data based on user selections
  exportData(): void {
    if (!this.isExportSelectionValid()) return;

    this.exportInProgress = true;

    // Create array of data requests based on selected options
    const requests = {
      ...(this.exportOptions.users && { users: this.userService.getUsers() }),
      ...(this.exportOptions.communities && { communities: this.communityService.getAllCommunities() }),
      ...(this.exportOptions.events && { events: this.eventService.getEvents() })
    };

    // Fetch all selected data
    forkJoin(requests).subscribe({
      next: (data) => {
        this.generatePDF(data);
        this.exportInProgress = false;
        this.showExportModal = false;
      },
      error: (err) => {
        console.error('Export failed:', err);
        this.exportInProgress = false;
      }
    });
  }
  // Generate PDF from exported data
  private generatePDF(data: Record<string, any[]>): void {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(230, 155, 107);
    doc.text('Madinah Hub Data Export', 105, 20, { align: 'center' });

    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    // Add line below title
    doc.setDrawColor(230, 155, 107);
    doc.setLineWidth(0.5);
    doc.line(40, 35, 170, 35);

    let yPosition = 45; // spacing

    // Add each data section
    Object.entries(data).forEach(([section, items]) => {
      // Add section title
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text(section.charAt(0).toUpperCase() + section.slice(1), 14, yPosition);

      // section divider
      doc.setDrawColor(230, 155, 107);
      doc.setLineWidth(0.3);
      doc.line(14, yPosition + 2, 195, yPosition + 2);
      yPosition += 12;

      if (items.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('No data available', 14, yPosition);
        yPosition += 10;
        return;
      }

      // header filtering
      const headers = Object.keys(items[0]).filter(key =>
        (typeof items[0][key] !== 'object' || items[0][key] === null) &&
        !['imageUrl', 'avatarUrl', 'profilePicture', 'photoUrl', 'logo'].includes(key) &&
        !key.toLowerCase().includes('id')
      );

      // Create table
      autoTable(doc, {
        head: [headers],
        body: items.map(item => headers.map(h =>
          item[h] === null || item[h] === undefined ? '' :
            item[h] instanceof Date ? item[h].toLocaleDateString() :
              String(item[h])
        )),
        startY: yPosition,
        theme: 'grid',
        styles: {
          fontSize: section === 'events' ? 7 : 8,
          cellPadding: 4,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [80, 80, 80],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        columnStyles: section === 'events' ? { 0: { cellWidth: 30 } } : {}
      });

      // Update position and add page break if needed
      yPosition = (doc as any).lastAutoTable.finalY + 20; //  spacing
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // footer
    doc.setDrawColor(230, 155, 107);
    doc.setLineWidth(0.3);
    doc.line(40, 280, 170, 280);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Madinah Hub © ${new Date().getFullYear()}`, 105, 287, { align: 'center' });

    // Save PDF
    doc.save('madinah-hub-export.pdf');
  }
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Successfully logged out
        this.router.navigate(['/landing']);
      }
    });
  }
}