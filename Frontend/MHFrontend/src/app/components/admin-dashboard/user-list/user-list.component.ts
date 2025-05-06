import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserDto } from '../../../services/users/users.service';
import { AuthService } from '../../../services/auth.service';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  window = window;

  // Services using inject pattern
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;

  // Filter properties
  searchTerm = '';
  sortColumn = 'userName';
  sortDirection = 'asc';
  roleFilter = 'All';
  availableRoles = ['All', 'Admin', 'User'];

  // User data
  users: Array<UserDto & { createdAtDate: Date }> = [];
  filteredUsers: Array<UserDto & { createdAtDate: Date }> = [];
  paginatedUsers: Array<UserDto & { createdAtDate: Date }> = [];

  // Current user info
  currentUserRole: string | null = null;
  isAdmin = false;

  // UI state
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    // Check current user role for permission-based UI
    this.authService.userProfile$.pipe(take(1)).subscribe(profile => {
      if (profile) {
        this.currentUserRole = profile.role;
        this.isAdmin = profile.role === 'Admin';
        this.loadUsers();
      } else {
        this.error = 'Authentication required';
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (data) => {
        // Keep the original createdAt string but add a Date object for sorting/formatting
        this.users = data.map(user => ({
          ...user,
          createdAtDate: new Date(user.createdAt)
        }));
        this.isLoading = false;
        this.filterUsers();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  filterUsers() {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(term) ||
        user.publicUserId.toLowerCase().includes(term) ||
        (user.address && user.address.toLowerCase().includes(term)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term)) ||
        this.formatDate(user.createdAtDate).includes(term)
      );
    }

    // Apply role filter
    if (this.roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (this.sortColumn === 'createdAt') {
        return this.sortDirection === 'asc'
          ? a.createdAtDate.getTime() - b.createdAtDate.getTime()
          : b.createdAtDate.getTime() - a.createdAtDate.getTime();
      }

      // For other columns, use regular string comparison
      const aValue = a[this.sortColumn as keyof UserDto];
      const bValue = b[this.sortColumn as keyof UserDto];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    this.filteredUsers = filtered;
    this.updatePagination();
  }

  formatDate(date: Date): string {
    // DD/MM/YYYY format
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);

    // Adjust current page if out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.filteredUsers.length);

    this.paginatedUsers = this.filteredUsers.slice(this.startIndex, this.endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // pagination
  getVisiblePageNumbers(): number[] {
    const visiblePages: number[] = [];
    // Show max 5 page numbers
    const totalPagesToShow = 5;

    if (this.totalPages <= totalPagesToShow) {
      // Show all pages if total is less than or equal to totalPagesToShow
      for (let i = 1; i <= this.totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Calculate start and end page numbers
      let startPage = Math.max(1, this.currentPage - Math.floor(totalPagesToShow / 2));
      let endPage = startPage + totalPagesToShow - 1;

      // Adjust if endPage exceeds totalPages
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - totalPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }
    }

    return visiblePages;
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filterUsers();
  }

  // Role-based methods
  getRoleBadgeClass(role: string): string {
    return role === 'Admin' ? 'badge-admin' : 'badge-user';
  }

  // Permission-based actions
  canEditUser(user: UserDto): boolean {
    // Only admins can edit other admins
    if (user.role === 'Admin') {
      return this.currentUserRole === 'Admin';
    }
    // Admins can edit all users
    return this.isAdmin;
  }

  canDeleteUser(user: UserDto): boolean {
    // Admins can delete all users except themselves
    return this.isAdmin && this.authService.userProfileValue?.publicUserId !== user.publicUserId;
  }

  deleteUser(publicUserId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.isLoading = true;
      this.userService.deleteUser(publicUserId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.publicUserId !== publicUserId);
          this.filterUsers();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.error = 'Failed to delete user. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }
}