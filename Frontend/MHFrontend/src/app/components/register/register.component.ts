import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

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
          // After Firebase registration, create user in backend directly without trying to login
          this.authService.createUserInBackend({ username, address, phoneNumber })
            .subscribe({
              next: (userProfile) => {
                this.loading = false;
                this.router.navigate(['/dashboard']);
              },
              error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Failed to create user in database';
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