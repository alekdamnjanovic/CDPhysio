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
  private pending = '';
  private revealTimer?: ReturnType<typeof setInterval>;
  private thinkTimer?: ReturnType<typeof setTimeout>;
  private revealDone = false;
  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly revealIntervalMs = 67;
  private readonly revealChars = 4;
  private readonly minThinkMs = 700;

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
    this.cancelReveal();
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
        if (this.reducedMotion) {
          if (this.isLoading()) {
            this.isLoading.set(false);
            this.isStreaming.set(true);
          }
          this.streamText.update(text => text + token);
          this.scrollIfNearBottom();
          return;
        }
        this.pending += token;
        this.ensureReveal();
      },
      error: (err) => {
        this.cancelReveal();
        this.pending = '';
        this.revealDone = false;
        this.isLoading.set(false);
        this.isStreaming.set(false);
        this.streamText.set('');
        const fallback = 'Sorry, I could not reach the assistant right now. Please try again in a moment.';
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: err?.message || fallback }]);
        this.scrollToMessageTop();
      },
      complete: () => {
        this.revealDone = true;
        if (this.reducedMotion || !this.pending) {
          this.commitStream();
          return;
        }
        this.ensureReveal();
      }
    });
  }

  private ensureReveal() {
    if (this.revealTimer) return;
    if (this.thinkTimer) return;
    this.thinkTimer = setTimeout(() => {
      this.thinkTimer = undefined;
      if (this.isLoading()) {
        this.isLoading.set(false);
        this.isStreaming.set(true);
      }
      this.revealTimer = setInterval(() => this.revealTick(), this.revealIntervalMs);
    }, this.minThinkMs);
  }

  private revealTick() {
    if (this.pending) {
      const chunk = this.pending.slice(0, this.revealChars);
      this.pending = this.pending.slice(chunk.length);
      this.streamText.update(text => text + chunk);
      this.scrollIfNearBottom();
    }
    if (!this.pending && this.revealDone) {
      this.commitStream();
    }
  }

  private commitStream() {
    const text = this.streamText();
    this.cancelReveal();
    this.pending = '';
    this.revealDone = false;
    this.isLoading.set(false);
    this.isStreaming.set(false);
    this.streamText.set('');
    if (text.trim()) {
      this.messages.update(msgs => [...msgs, { role: 'assistant', content: text }]);
    }
  }

  private cancelReveal() {
    if (this.revealTimer) {
      clearInterval(this.revealTimer);
      this.revealTimer = undefined;
    }
    if (this.thinkTimer) {
      clearTimeout(this.thinkTimer);
      this.thinkTimer = undefined;
    }
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
    this.cancelReveal();
  }
}
