import { Injectable } from '@angular/core';
import { getToken, onMessage, getMessaging } from 'firebase/messaging';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { getApp, initializeApp } from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { filter } from 'rxjs/operators';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs7lwNIbgJK9ZxKx6pItWztyOnO0SS8hw",
  authDomain: "fir-fbe50.firebaseapp.com",
  projectId: "fir-fbe50",
  storageBucket: "fir-fbe50.firebasestorage.app",
  messagingSenderId: "5731260859",
  appId: "1:5731260859:web:d03576464fe82bb0970c9e",
  measurementId: "G-1WHBW3QNL8"
};

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  clickAction?: string;
  data?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessagingService {
  currentMessage = new BehaviorSubject<any>(null);
  private fcmToken: string | null = null;
  private messaging: any;
  private apiUrl = 'http://localhost:5063/api/notification';
  private tokenPending = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize Firebase messaging
    try {
      const app = getApp();
      this.messaging = getMessaging(app);
    } catch (error) {
      const app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(app);
    }

    // Listen for user authentication to register token
    this.authService.userProfile$.pipe(
      filter((profile: any) => !!profile)
    ).subscribe((profile: any) => {
      if (this.tokenPending && this.fcmToken) {
        this.registerTokenWithBackend(this.fcmToken).subscribe();
      }
    });
  }

  // Register token with backend API
  registerTokenWithBackend(token: string): Observable<any> {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      this.tokenPending = true;
      return of({ status: 'pending' });
    }
    
    this.tokenPending = false;
    return this.http.post(`${this.apiUrl}/register-device`, {
      userId: userId,
      token: token
    });
  }

  // Get current user ID
  private getCurrentUserId(): string | null {
    const userProfile = this.authService.userProfileValue;
    if (!userProfile) return null;
    return (userProfile as any).publicUserId || (userProfile as any).userId?.toString();
  }

  // Request permission and get FCM token
  requestPermission(): Promise<string | null> {
    if (!this.messaging) {
      return Promise.resolve(null);
    }
  
    const vapidKey = "BHGs3zk9b4Hi10fXnn_hYJ800hZ4d5SVufIE9ZSYemzLZXYNHJwRzW0_DORhV8nIO3j95kGFq0-2T8n6zkcOXPg"; 
  
    return getToken(this.messaging, { vapidKey })
      .then(token => {
        if (token) {
          this.fcmToken = token;
          localStorage.setItem('fcm_token', token);
          
          const userId = this.getCurrentUserId();
          if (userId) {
            this.registerTokenWithBackend(token).subscribe();
          } else {
            this.tokenPending = true;
          }
          
          return token;
        }
        return null;
      })
      .catch(() => null);
  }

  // Listen for incoming messages
  receiveMessage(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, payload => {
      this.currentMessage.next(payload);
      
      if ('Notification' in window && Notification.permission === 'granted' && payload.notification) {
        const title = payload.notification.title || 'New Notification';
        const body = payload.notification.body || '';
        const icon = payload.notification.icon as string || '/assets/images/logo.png';
        
        new Notification(title, { body, icon });
      }
    });
  }

  // Show a local notification
  showLocalNotification(payload: NotificationPayload): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = payload.title || 'New Notification';
      const body = payload.body || '';
      const icon = payload.icon || '/assets/images/logo.png';
      
      new Notification(title, { body, icon });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const title = payload.title || 'New Notification';
          const body = payload.body || '';
          const icon = payload.icon || '/assets/images/logo.png';
          
          new Notification(title, { body, icon });
        }
      });
    }
    
    this.currentMessage.next({
      notification: payload
    });
  }

  // Get the token from local storage
  getToken(): string | null {
    return this.fcmToken || localStorage.getItem('fcm_token');
  }
  
  // Clear token (for logout)
  clearToken(): void {
    this.fcmToken = null;
    localStorage.removeItem('fcm_token');
  }
}