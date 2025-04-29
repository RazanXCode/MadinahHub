// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  template: `
    <div>
      <h3>Login</h3>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" formControlName="email" required>
          <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            Valid email is required
          </div>
        </div>
        
        <div>
          <label for="password">Password</label>
          <input type="password" id="password" formControlName="password" required>
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            Password is required
          </div>
        </div>
        
        <div>
          <button type="submit" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
        
        <div *ngIf="error">{{ error }}</div>
      </form>
      <div>
        Don't have an account? <a routerLink="/register">Register</a>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .subscribe({
        next: () => {
          // After Firebase authentication, login to the backend
          this.authService.loginToBackend()
            .subscribe({
              next: () => {
                this.loading = false;
                this.router.navigate(['/']);
              },
              error: (err) => {
                this.loading = false;
                if (err.status === 404) {
                  this.error = 'User not found in system. Please register first.';
                } else {
                  this.error = err.error || 'Failed to authenticate with backend';
                }
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
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      default:
        return 'Login failed. Please try again.';
    }
  }
}