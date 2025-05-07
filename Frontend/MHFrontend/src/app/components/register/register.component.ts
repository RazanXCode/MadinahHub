import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize, catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';
  roles = ['User', 'Admin']; // Add roles list for selection

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
      phoneNumber: ['', Validators.required],
      role: ['User', Validators.required] // Default role is 'User'
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password, username, address, phoneNumber, role } = this.registerForm.value;

    this.authService.register(email, password)
      .pipe(
        catchError(err => {
          console.error('Firebase error:', err);
          this.error = this.getFirebaseErrorMessage(err.code);
          this.loading = false;
          return of(null);
        }),
        switchMap(credential => {
          if (!credential) return of(null);

          console.log('Firebase registration successful, creating backend user');

          return this.authService.createUserInBackend({
            username,
            address,
            phoneNumber,
            role
          }).pipe(
            catchError(err => {
              console.error('Backend error:', err);
              this.error = err.error || 'Failed to create user in database';
              return of(null);
            })
          );
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: userProfile => {
          if (!userProfile) return;

          console.log('Registration successful, redirecting based on role');

          // Store user role in local storage for easy access in guards
          localStorage.setItem('userRole', userProfile.role);

          // Add a brief timeout to let Angular complete its cycle
          setTimeout(() => {
            if (userProfile.role === 'Admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 100);
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