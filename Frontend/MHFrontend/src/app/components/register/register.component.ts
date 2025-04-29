// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  template: `
    <div>
      <h3>Register</h3>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" formControlName="email" required>
          <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            Valid email is required
          </div>
        </div>
        
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" formControlName="password" required>
          <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            Password must be at least 6 characters
          </div>
        </div>
        
        <div>
          <label for="username">Username</label>
          <input type="text" id="username" formControlName="username" required>
        </div>
        
        <div>
          <label for="address">Address</label>
          <input type="text" id="address" formControlName="address" required>
        </div>
        
        <div>
          <label for="phoneNumber">Phone Number</label>
          <input type="text" id="phoneNumber" formControlName="phoneNumber" required>
        </div>
        
        <div>
          <button type="submit" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </div>
        
        <div *ngIf="error">{{ error }}</div>
      </form>
      <div>
        Already have an account? <a routerLink="/login">Login</a>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password, username, address, phoneNumber } = this.registerForm.value;

    this.authService.register(email, password)
      .subscribe({
        next: (userCredential) => {
          // Now create user in backend
          this.authService.createUserInBackend({ username, address, phoneNumber })
            .subscribe({
              next: () => {
                this.loading = false;
                this.router.navigate(['/']);
              },
              error: (err) => {
                this.loading = false;
                this.error = err.error || 'Failed to create user in database';
                console.error('Backend error:', err);
              }
            });
        },
        error: (err) => {
          this.loading = false;
          this.error = this.getFirebaseErrorMessage(err.code);
          console.error('Firebase error:', err);
        }
      });
  }

  private getFirebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}