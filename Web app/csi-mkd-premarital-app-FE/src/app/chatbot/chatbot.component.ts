import { Component, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';
import { MarkdownPipe } from '../shared/pipes/markdown.pipe';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
    MarkdownPipe,
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly messages = signal<Message[]>([]);
  userInput = '';
  
  // Tooltip visibility
  readonly showTooltip = signal(true);

  readonly suggestedQuestions = [
    'What services do you offer?',
    'How do I register for premarital counselling?',
    'Where is the counselling centre located?',
    'What are the fees for counselling sessions?',
  ];

  constructor(private chatService: ChatService) {
    // Load chat history from session storage
    this.loadChatHistory();
    
    // Hide tooltip after 8 seconds
    setTimeout(() => {
      this.showTooltip.set(false);
    }, 8000);
  }

  toggleChat(): void {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.showTooltip.set(false);
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  async sendMessage(message?: string): Promise<void> {
    const text = message || this.userInput.trim();
    if (!text || this.isLoading()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    this.messages.update(msgs => [...msgs, userMessage]);
    this.userInput = '';
    this.isLoading.set(true);

    try {
      // Get AI response
      const response = await this.chatService.sendMessage(text, this.messages());
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      this.messages.update(msgs => [...msgs, assistantMessage]);
      
      // Save to session storage
      this.saveChatHistory();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact us directly.',
        timestamp: new Date(),
      };
      this.messages.update(msgs => [...msgs, errorMessage]);
    } finally {
      this.isLoading.set(false);
    }
  }

  clearChat(): void {
    this.messages.set([]);
    sessionStorage.removeItem('chatHistory');
  }

  private loadChatHistory(): void {
    const saved = sessionStorage.getItem('chatHistory');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        this.messages.set(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }

  private saveChatHistory(): void {
    sessionStorage.setItem('chatHistory', JSON.stringify(this.messages()));
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.closeChat();
    }
  }
}
