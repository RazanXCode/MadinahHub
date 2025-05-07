import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users/users.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(
        // Add proper error handling
        catchError(err => {
          this.loading = false;
          this.error = this.getFirebaseErrorMessage(err.code);
          console.error('Firebase error:', err);
          return of(null); // Return observable to continue the chain
        }),
        // Ensure loading is always set to false at the end
        finalize(() => this.loading = false)
      )
      .subscribe(userCredential => {
        if (!userCredential) return; // Handle the error case

        this.authService.loginToBackend()
          .pipe(
            // Add proper error handling
            catchError(err => {
              this.loading = false;
              this.error = err.status === 404
                ? 'User not found in system. Please register first.'
                : err.error || 'Failed to authenticate with backend';
              console.error('Backend error:', err);
              return of(null); // Return observable to continue the chain
            }),
            // Ensure loading is always set to false at the end
            finalize(() => this.loading = false)
          )
          .subscribe(userProfile => {
            if (!userProfile) return; // Handle the error case

            // Extract publicUserId from the userProfile
            const publicUserId = userProfile.userIdPublic || userProfile.publicUserId;

            if (!publicUserId) {
              this.error = 'User ID not found in profile.';
              console.error('User ID is missing in userProfile:', userProfile);
              return;
            }

            // Store user role in local storage for easy access in guards
            localStorage.setItem('userRole', userProfile.role);

            console.log('Login successful, navigating to dashboard');

            // Add a small timeout to let angular complete its rendering cycle
            setTimeout(() => {
              // Role-based redirection directly from the JWT response
              if (userProfile.role === 'Admin') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }, 0);
          });
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