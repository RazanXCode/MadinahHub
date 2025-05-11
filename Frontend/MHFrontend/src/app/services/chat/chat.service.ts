import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, switchMap, Subject, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import * as signalR from '@microsoft/signalr';
import { catchError } from 'rxjs/operators';

export interface Message {
  messageId: string;
  content: string;
  timestamp: Date;
  userName: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5063/api/chat';
  private hubUrl = 'http://localhost:5063/chatHub';
  private hubConnection: signalR.HubConnection | null = null;
  
  // Subjects for message events
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private newMessageSubject = new Subject<Message>();
  private messageDeletedSubject = new Subject<string>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  messages$ = this.messagesSubject.asObservable();
  newMessage$ = this.newMessageSubject.asObservable();
  messageDeleted$ = this.messageDeletedSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  // Track the current community connection
  private currentCommunityId: string | null = null;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  // Initialize SignalR connection
  async initConnection(): Promise<boolean> {
    try {
      // If we already have a connection, close it
      if (this.hubConnection) {
        await this.hubConnection.stop();
      }

      // Get token for authentication
      const token = await this.authService.getIdToken();
      if (!token) {
        console.error('No authentication token available');
        return false;
      }

      console.log('Token available, connecting to SignalR hub');

      // Create hub connection with better logging
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.hubUrl}?access_token=${token}`, {
          // Important: Do NOT use accessTokenFactory with query parameters
          // as it can cause duplicate tokens
          withCredentials: false // Change to false since we're using query param
        })
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry with increasing delays
        .build();

      // Add event listeners
      this.hubConnection.on('ReceiveMessage', (message: Message) => {
        console.log('Received message:', message);
        // Add new message to the messages array
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, message]);
        this.newMessageSubject.next(message);
      });

      this.hubConnection.on('MessageDeleted', (messageId: string) => {
        console.log('Message deleted:', messageId);
        // Remove deleted message from messages array
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next(currentMessages.filter(m => m.messageId !== messageId));
        this.messageDeletedSubject.next(messageId);
      });

      // Connection events
      this.hubConnection.onreconnecting(error => {
        console.log('Attempting to reconnect to SignalR hub:', error);
        this.connectionStatusSubject.next(false);
      });

      this.hubConnection.onreconnected(connectionId => {
        console.log('Reconnected to SignalR hub:', connectionId);
        this.connectionStatusSubject.next(true);
        // Rejoin community if we were in one
        if (this.currentCommunityId) {
          this.joinCommunityChat(this.currentCommunityId).catch(err => 
            console.error('Error rejoining community after reconnect:', err)
          );
        }
      });

      this.hubConnection.onclose(error => {
        console.log('Connection closed:', error);
        this.connectionStatusSubject.next(false);
      });

      // Start connection
      await this.hubConnection.start();
      console.log('SignalR connection established');
      this.connectionStatusSubject.next(true);
      return true;
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      this.connectionStatusSubject.next(false);
      return false;
    }
  }

  // Join community chat
  async joinCommunityChat(communityId: string): Promise<boolean> {
    if (!communityId) {
      console.error('Community ID is empty or null');
      return false;
    }
    
    if (!this.hubConnection) {
      const connected = await this.initConnection();
      if (!connected) {
        throw new Error('Failed to establish SignalR connection');
      }
    }

    if (this.currentCommunityId === communityId) {
      return true; // Already joined this community
    }

    try {
      // If we're already in a community, leave it first
      if (this.currentCommunityId) {
        await this.hubConnection!.invoke('LeaveCommunity', this.currentCommunityId);
      }

      // Join the new community
      await this.hubConnection!.invoke('JoinCommunity', communityId);
      this.currentCommunityId = communityId;
      console.log('Joined community chat:', communityId);

      try {
        // Load recent messages - use try-catch to handle this separately
        console.log('Getting recent messages for community:', communityId);
        const messages = await this.hubConnection!.invoke<Message[]>('GetRecentMessages', communityId);
        console.log('Retrieved messages:', messages);
        this.messagesSubject.next(messages || []);
      } catch (messagesError) {
        console.error('Error getting recent messages:', messagesError);
        // Don't fail the entire operation, just show empty messages
        this.messagesSubject.next([]);
        
        // Try fallback to REST API
        this.getMessages(communityId).subscribe({
          next: (messages) => {
            console.log('Got messages via REST API:', messages);
            this.messagesSubject.next(messages);
          },
          error: (err) => console.error('Failed to get messages via REST API too:', err)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error joining community chat:', error);
      throw new Error('Failed to join community chat');
    }
  }

  // Leave community chat
  async leaveCommunityChat(): Promise<boolean> {
    if (!this.hubConnection || !this.currentCommunityId) {
      return true; // Already left
    }

    try {
      await this.hubConnection.invoke('LeaveCommunity', this.currentCommunityId);
      this.currentCommunityId = null;
      this.messagesSubject.next([]);
      return true;
    } catch (error) {
      console.error('Error leaving community chat:', error);
      return false;
    }
  }

  // Send a message to the current community
  async sendMessage(content: string): Promise<boolean> {
    if (!this.hubConnection || !this.currentCommunityId) {
      console.error('Cannot send message: not connected to a community');
      return false;
    }

    try {
      console.log('Sending message to community:', this.currentCommunityId);
      await this.hubConnection.invoke('SendMessage', this.currentCommunityId, content);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Try REST API as fallback
      try {
        await this.postMessage(this.currentCommunityId, content).toPromise();
        return true;
      } catch (restError) {
        console.error('REST API fallback also failed:', restError);
        return false;
      }
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<boolean> {
    if (!this.hubConnection) {
      console.error('Cannot delete message: not connected');
      return false;
    }

    try {
      await this.hubConnection.invoke('DeleteMessage', messageId);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Close the SignalR connection
  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.leaveCommunityChat();
      await this.hubConnection.stop();
      this.hubConnection = null;
      this.connectionStatusSubject.next(false);
    }
  }

  // REST API methods for fallback or initial loading
  getMessages(communityId: string, count: number = 50): Observable<Message[]> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.get<Message[]>(`${this.apiUrl}/community/${communityId}?count=${count}`, { headers });
      }),
      catchError(error => {
        console.error('Error fetching messages via REST API:', error);
        return throwError(() => new Error('Failed to load messages'));
      })
    );
  }

  postMessage(communityId: string, content: string): Observable<any> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.post(`${this.apiUrl}/community/${communityId}`, { content }, { headers });
      }),
      catchError(error => {
        console.error('Error posting message via REST API:', error);
        return throwError(() => new Error('Failed to send message'));
      })
    );
  }

  removeMessage(messageId: string): Observable<any> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        const headers = { Authorization: `Bearer ${token}` };
        return this.http.delete(`${this.apiUrl}/message/${messageId}`, { headers });
      }),
      catchError(error => {
        console.error('Error deleting message via REST API:', error);
        return throwError(() => new Error('Failed to delete message'));
      })
    );
  }
}