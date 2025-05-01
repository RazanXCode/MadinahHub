import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/users/users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})

export class UserListComponent implements OnInit {
  window = window;

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

  // User data
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  // UI state
  isLoading = false;
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }
  loadUsers() {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUsers().subscribe({
      next: (data) => {
        // Convert string dates to Date objects
        this.users = data.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt)
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
        this.formatDate(user.createdAt).includes(term)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
    if (this.sortColumn === 'createdAt') {
      return this.sortDirection === 'asc' 
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    }
      const aValue = a[this.sortColumn as keyof User];
      const bValue = b[this.sortColumn as keyof User];

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
    
    for (let i = 1; i <= this.totalPages; i++) {
      visiblePages.push(i);
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
}