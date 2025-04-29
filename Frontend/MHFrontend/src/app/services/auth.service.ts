// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
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
import { switchMap, tap, catchError } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';

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
  role: string; // This will be the string representation of the UserRole enum
  phoneNumber: string;
  userIdPublic: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth(initializeApp(firebaseConfig));
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiUrl = 'http://localhost:5063/api'; // Updated API URL
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);

  constructor(private http: HttpClient) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        // When user is authenticated, fetch their profile
        this.getCurrentUser().subscribe({
          next: (profile) => this.userProfileSubject.next(profile),
          error: () => this.userProfileSubject.next(null)
        });
      } else {
        this.userProfileSubject.next(null);
      }
    });
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get userProfile$(): Observable<UserProfile | null> {
    return this.userProfileSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get userProfileValue(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  async getIdToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    return user.getIdToken();
  }

  register(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // Create user in backend after Firebase authentication
  createUserInBackend(userData: any): Observable<any> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/Auth/register`, {
          firebaseUid: this.auth.currentUser?.uid,
          ...userData
        }, { headers }).pipe(
          tap(userProfile => this.userProfileSubject.next(userProfile as UserProfile))
        );
      })
    );
  }

  // Login to backend
  loginToBackend(): Observable<UserProfile> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<UserProfile>(`${this.apiUrl}/Auth/login`, {}, { headers }).pipe(
          tap(userProfile => this.userProfileSubject.next(userProfile))
        );
      })
    );
  }

  // Get current user data from backend
  getCurrentUser(): Observable<UserProfile> {
    return from(this.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<UserProfile>(`${this.apiUrl}/Auth/login`, {}, { headers }).pipe(
          tap(userProfile => this.userProfileSubject.next(userProfile))
        );
      })
    );
  }
}