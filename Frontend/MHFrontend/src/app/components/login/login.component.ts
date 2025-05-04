import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users/users.service';
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

    this.authService.login(email, password).subscribe({
      next: () => {
        this.authService.loginToBackend().subscribe({
          next: (userProfile) => {
            this.loading = false;

          const publicUserId = userProfile.userIdPublic || (userProfile as any).publicUserId;
  
          if (!publicUserId) {
            this.error = 'User ID not found in profile.';
            console.error('User ID is missing in userProfile:', userProfile);
            return;
          }
            // Fetch user details using UserService
            this.userService.getUser(publicUserId).subscribe({
              next: (user) => {
                console.log('Fetched User:', user);

                // Role-based redirection
                if (user.role === 'Admin') {
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              },
              error: (err) => {
                console.error('Error fetching user details:', err);
                this.error = 'Failed to fetch user details. Please try again.';
              }
            });
          },
          error: (err) => {
            this.loading = false;
            this.error = err.status === 404
              ? 'User not found in system. Please register first.'
              : err.error || 'Failed to authenticate with backend';
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