import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, Message } from '../../../services/chat/chat.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-community-chat',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ToastModule, 
    ButtonModule, 
    InputTextarea,
    SkeletonModule
  ],
  templateUrl: './community-chat.component.html',
  providers: [MessageService]
})
export class CommunityChatComponent implements OnInit, OnDestroy, OnChanges {
  @Input() communityId!: string;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  
  messages: Message[] = [];
  messageForm: FormGroup;
  loading = true;
  error = '';
  connected = false;
  currentUserId: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Get current user ID
    this.subscriptions.push(
      this.authService.userProfile$.subscribe(profile => {
        this.currentUserId = profile?.publicUserId || null;
      })
    );

    // Subscribe to messages
    this.subscriptions.push(
      this.chatService.messages$.subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      })
    );

    // Subscribe to new messages
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe(() => {
        this.scrollToBottom();
      })
    );
    
    // Subscribe to message deletions
    this.subscriptions.push(
      this.chatService.messageDeleted$.subscribe(messageId => {
        this.messages = this.messages.filter(m => m.messageId !== messageId);
      })
    );
    
    // Subscribe to connection status
    this.subscriptions.push(
      this.chatService.connectionStatus$.subscribe(status => {
        this.connected = status;
      })
    );

    // If we have a community ID, connect to it
    if (this.communityId) {
      this.connectToChat();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If community ID changes, reconnect
    if (changes['communityId'] && !changes['communityId'].firstChange) {
      this.connectToChat();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Disconnect from chat
    this.chatService.disconnect();
  }

  async connectToChat(): Promise<void> {
    if (!this.communityId) {
      this.error = 'Community ID is required';
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Community ID',
        detail: this.error
      });
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    
    try {
      // Connect to SignalR
      const connected = await this.chatService.initConnection();
      if (!connected) {
        throw new Error('Failed to connect to chat service');
      }
      
      // Join community chat
      await this.chatService.joinCommunityChat(this.communityId);
      
      // If we get here, we're connected
      this.messageService.add({
        severity: 'success',
        summary: 'Connected',
        detail: 'You are now connected to the chat'
      });
      
    } catch (err: any) {
      // If SignalR fails, try to fallback to REST API
      this.error = err.message || 'An error occurred connecting to chat';
      console.error('Chat connection error:', err);
      
      this.messageService.add({
        severity: 'error',
        summary: 'Chat Connection Error',
        detail: 'Using offline mode. Some features may be limited.'
      });
      
      // Try to load messages via REST API as fallback
      this.chatService.getMessages(this.communityId).subscribe({
        next: (messages) => {
          this.messages = messages;
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error loading messages via REST:', err);
          // Don't show another toast for this
        }
      });
    } finally {
      this.loading = false;
    }
  }

  async sendMessage(): Promise<void> {
    if (this.messageForm.invalid) {
      return;
    }
    
    const content = this.messageForm.get('content')?.value;
    if (!content.trim()) {
      return; // Don't send empty messages
    }
    
    try {
      let sent = false;
      
      // Try SignalR first if connected
      if (this.connected) {
        sent = await this.chatService.sendMessage(content);
      }
      
      // If SignalR fails or not connected, fallback to REST API
      if (!sent) {
        this.chatService.postMessage(this.communityId, content).subscribe({
          next: () => {
            // Add a temporary message to the UI
            const tempMessage: Message = {
              messageId: 'temp_' + Date.now(),
              content: content,
              timestamp: new Date(),
              userName: 'You', // This will be updated when messages are reloaded
              userId: this.currentUserId || 'unknown'
            };
            this.messages = [...this.messages, tempMessage];
            this.scrollToBottom();
            
            // Reload messages to get the new one with proper ID
            this.chatService.getMessages(this.communityId).subscribe(messages => {
              this.messages = messages;
              this.scrollToBottom();
            });
          },
          error: (err) => {
            console.error('Error posting message via REST:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Send Error',
              detail: 'Failed to send message. Please try again.'
            });
          }
        });
      }
      
      // Clear form on success
      this.messageForm.reset({ content: '' });
      
    } catch (err: any) {
      this.error = err.message || 'Failed to send message';
      console.error('Error sending message:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Message Error',
        detail: this.error
      });
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      let deleted = false;
      
      // Try SignalR first if connected
      if (this.connected) {
        deleted = await this.chatService.deleteMessage(messageId);
      }
      
      // If SignalR fails or not connected, fallback to REST API
      if (!deleted) {
        this.chatService.removeMessage(messageId).subscribe({
          next: () => {
            // Remove the message from the UI
            this.messages = this.messages.filter(m => m.messageId !== messageId);
          },
          error: (err) => {
            console.error('Error deleting message via REST:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Error',
              detail: 'Failed to delete message. Please try again.'
            });
          }
        });
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to delete message';
      console.error('Error deleting message:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Delete Error',
        detail: this.error
      });
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    // Send message on Shift+Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOwnMessage(message: any): boolean {
  if (!this.currentUserId) return false;
  
  // Check both possible property names
  const messageUserId = message.userId || message.userPublicId;
  
  if (!messageUserId) {
    console.warn('Message has no userId or userPublicId property:', message);
    return false;
  }
  
  return messageUserId === this.currentUserId;
}

  getTimeString(timestamp: Date): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 50);
  }
}