import { Component, signal, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AiService } from '../../core/services/ai.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-assistant.component.html',
  styleUrl: './chat-assistant.component.scss'
})
export class ChatAssistantComponent implements OnDestroy {
  private aiService = inject(AiService);
  @ViewChild('history') private history?: ElementRef<HTMLElement>;

  protected isChatOpen = signal(false);
  protected userInput = signal('');
  protected messages = signal<ChatMessage[]>([]);
  protected isLoading = signal(false);
  protected isStreaming = signal(false);
  protected streamText = signal('');

  private streamSub?: Subscription;

  protected quickQuestions = [
    'How do I book an appointment?',
    'What are the prices for treatment?',
    'Where is CD Physio located?',
    'What conditions does Carole treat?',
    "Tell me about Carole's experience."
  ];

  toggleChat() {
    this.isChatOpen.update(v => !v);
    if (this.isChatOpen()) {
      this.scrollToBottom();
    }
  }

  sendQuick(question: string) {
    if (this.isLoading() || this.isStreaming()) return;
    this.userInput.set(question);
    this.sendMessage();
  }

  clearChat() {
    if (this.isLoading() || this.isStreaming()) return;
    this.streamSub?.unsubscribe();
    this.messages.set([]);
    this.streamText.set('');
    this.isLoading.set(false);
    this.isStreaming.set(false);
    this.userInput.set('');
    const el = this.history?.nativeElement;
    if (el) el.scrollTo({ top: 0 });
  }

  sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading() || this.isStreaming()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: prompt }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.streamText.set('');
    this.scrollToBottom();

    this.streamSub = this.aiService.streamMessage(prompt).subscribe({
      next: (token) => {
        if (this.isLoading()) {
          this.isLoading.set(false);
          this.isStreaming.set(true);
        }
        this.streamText.update(text => text + token);
        this.scrollIfNearBottom();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isStreaming.set(false);
        this.streamText.set('');
        const fallback = 'Sorry, I could not reach the assistant right now. Please try again in a moment.';
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: err?.message || fallback }]);
        this.scrollToMessageTop();
      },
      complete: () => {
        const text = this.streamText();
        this.isLoading.set(false);
        this.isStreaming.set(false);
        this.streamText.set('');
        if (text.trim()) {
          this.messages.update(msgs => [...msgs, { role: 'assistant', content: text }]);
        }
      }
    });
  }

  private scrollToBottom() {
    const el = this.history?.nativeElement;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }

  private scrollIfNearBottom() {
    const el = this.history?.nativeElement;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) el.scrollTo({ top: el.scrollHeight });
  }

  private scrollToMessageTop() {
    const el = this.history?.nativeElement;
    if (!el) return;
    const msgs = el.querySelectorAll('.msg');
    const last = msgs[msgs.length - 1] as HTMLElement | undefined;
    if (!last) {
      el.scrollTo({ top: el.scrollHeight });
      return;
    }
    el.scrollTo({ top: last.offsetTop - el.offsetTop });
  }

  ngOnDestroy() {
    this.streamSub?.unsubscribe();
  }
}
