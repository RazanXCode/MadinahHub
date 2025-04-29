import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  createdAt: Date;
  phone: string;  
}

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
  sortColumn = 'name';
  sortDirection = 'asc';

  // User data
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  constructor() { }

  ngOnInit() {
    // Generate mock data
    this.generateMockUsers();
    this.filterUsers();
  }

  generateMockUsers() {
    for (let i = 1; i <= 20; i++) {
      // Generate random phone numbers
      const areaCode = 966;
      const prefix = Math.floor(100 + Math.random() * 900);
      const lineNumber = Math.floor(1000 + Math.random() * 9000);
      const phone = `(${areaCode}) ${prefix}-${lineNumber}`;
      
      // Generate a random date 
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const createdAt = new Date(oneYearAgo.getTime() + Math.random() * (today.getTime() - oneYearAgo.getTime()));

      this.users.push({
        id: i,
        name: `User ${i}`,
        createdAt: createdAt,
        phone: phone  
      });
    }
  }

  filterUsers() {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) || 
        this.formatDate(user.createdAt).includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
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