import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { Router } from '@angular/router';

const firebaseConfig = {
    apiKey: "AIzaSyBs7lwNIbgJK9ZxKx6pItWztyOnO0SS8hw",
    authDomain: "fir-fbe50.firebaseapp.com",
    projectId: "fir-fbe50",
    storageBucket: "fir-fbe50.firebasestorage.app",
    messagingSenderId: "5731260859",
    appId: "1:5731260859:web:d03576464fe82bb0970c9e",
    measurementId: "G-1WHBW3QNL8"
};

export interface UserProfile {
  id: number;
  username: string;
  address: string;
  role: string;
  phoneNumber: string;
  userIdPublic: string;
  publicUserId?: string; // Added for compatibility with backend response
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth(initializeApp(firebaseConfig));
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiUrl = 'http://localhost:5063/api';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private isNewlyRegistered = false;
  private jwtToken = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for token in localStorage
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      this.jwtToken.next(savedToken);
    }

    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        // When user is authenticated and it's not a new registration,
        // fetch their profile
        if (!this.isNewlyRegistered) {
          this.getIdToken().then(token => {
            localStorage.setItem('jwt_token', token);
            this.jwtToken.next(token);

            this.getCurrentUser().subscribe({
              next: (profile) => this.userProfileSubject.next(profile),
              error: (err) => {
                console.error('Failed to get user profile:', err);
                this.userProfileSubject.next(null);
              }
            });
          });
        }
        // Reset the flag
        this.isNewlyRegistered = false;
      } else {
        this.userProfileSubject.next(null);
        localStorage.removeItem('jwt_token');
        this.jwtToken.next(null);
      }
    });
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get userProfile$(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }

  get jwtToken$(): Observable<string | null> {
    return this.jwtToken.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get userProfileValue(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  async getIdToken(): Promise<string> {
    if (this.auth.currentUser) {
      return this.auth.currentUser.getIdToken();
    }

    // Wait for user to be available via onAuthStateChanged
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
        unsubscribe();
        if (user) {
          const token = await user.getIdToken();
          resolve(token);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  register(email: string, password: string): Observable<UserCredential> {
    // Set the flag to indicate a new registration
    this.isNewlyRegistered = true;
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        // Clear stored user data and token
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('userRole');
        this.jwtToken.next(null);
        this.userProfileSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  // Create user in backend after Firebase authentication
  createUserInBackend(userData: any): Observable<UserProfile> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        // Store token
        localStorage.setItem('jwt_token', token);
        this.jwtToken.next(token);

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<UserProfile>(`${this.apiUrl}/Auth/register`, {
          firebaseUid: this.auth.currentUser?.uid,
          ...userData
        }, { headers }).pipe(
          tap(userProfile => {
            this.userProfileSubject.next(userProfile);
            // Store role for reuse in guards
            localStorage.setItem('userRole', userProfile.role);
          })
        );
      })
    );
  }

  // Login to backend
  loginToBackend(): Observable<UserProfile> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        // Store token
        localStorage.setItem('jwt_token', token);
        this.jwtToken.next(token);

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<UserProfile>(`${this.apiUrl}/Auth/login`, {}, { headers }).pipe(
          tap(userProfile => {
            this.userProfileSubject.next(userProfile);
            // Store role for reuse in guards
            localStorage.setItem('userRole', userProfile.role);
          })
        );
      })
    );
  }

  // Get current user data from backend
  getCurrentUser(): Observable<UserProfile> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        // Update stored token
        localStorage.setItem('jwt_token', token);
        this.jwtToken.next(token);

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<UserProfile>(`${this.apiUrl}/Auth/login`, {}, { headers }).pipe(
          tap(userProfile => {
            this.userProfileSubject.next(userProfile);
            // Store role for reuse in guards
            localStorage.setItem('userRole', userProfile.role);
          })
        );
      }),
      catchError(error => {
        console.error('Error getting current user:', error);
        return of(null as unknown as UserProfile);
      })
    );
  }

  // Check if user has a specific role
  hasRole(role: string): Observable<boolean> {
    return this.userProfile$.pipe(
      map(profile => !!profile && profile.role === role)
    );
  }

  // Get the authenticated HTTP headers with JWT
  getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.getIdToken()).pipe(
      map(token => new HttpHeaders().set('Authorization', `Bearer ${token}`))
    );
  }
}