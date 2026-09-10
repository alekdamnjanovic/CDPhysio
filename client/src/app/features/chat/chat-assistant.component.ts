import {
  Component,
  signal,
  inject,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AiService } from '../../core/services/ai.service';
import { QUICK_QUESTIONS } from '../../core/constants/content.constants';
import type { ChatMessage } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-assistant.component.html',
  styleUrl: './chat-assistant.component.scss',
})
export class ChatAssistantComponent implements OnInit, OnDestroy {
  private readonly aiService = inject(AiService);
  private readonly router = inject(Router);
  @ViewChild('history') private history?: ElementRef<HTMLElement>;

  protected readonly isChatOpen = signal(false);
  protected readonly isHiddenOnRoute = signal(false);
  protected readonly userInput = signal('');
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isStreaming = signal(false);
  protected readonly streamText = signal('');

  private routerSub?: Subscription;
  private streamSub?: Subscription;
  private pending = '';
  private revealTimer?: ReturnType<typeof setInterval>;
  private thinkTimer?: ReturnType<typeof setTimeout>;
  private revealDone = false;
  private userScrolledUp = false;

  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly revealIntervalMs = 50;
  private readonly revealChars = 6;
  private readonly minThinkMs = 450;

  protected readonly quickQuestions = QUICK_QUESTIONS;

  ngOnInit() {
    this.checkRoute(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkRoute(event.urlAfterRedirects || event.url);
      });
  }

  private checkRoute(url: string) {
    this.isHiddenOnRoute.set(false);
  }

  toggleChat() {
    this.isChatOpen.update((v) => !v);
    if (this.isChatOpen()) {
      this.userScrolledUp = false;
      setTimeout(() => this.scrollToBottom('instant'), 50);
    }
  }

  onScroll() {
    const el = this.history?.nativeElement;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only flag as scrolled up if user has scrolled away more than 100px from the bottom
    this.userScrolledUp = distanceFromBottom > 100;
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
    this.userScrolledUp = false;
    const el = this.history?.nativeElement;
    if (el) el.scrollTo({ top: 0 });
  }

  sendMessage() {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading() || this.isStreaming()) return;

    const newMessages: ChatMessage[] = [...this.messages(), { role: 'user', content: prompt }];
    this.messages.set(newMessages);
    this.userInput.set('');
    this.isLoading.set(true);
    this.streamText.set('');
    this.userScrolledUp = false;

    // Force instant scroll to bottom on submission
    this.scrollToBottom('instant');
    setTimeout(() => this.scrollToBottom('instant'), 40);

    this.streamSub = this.aiService.streamMessage(newMessages).subscribe({
      next: (token) => {
        if (this.reducedMotion) {
          if (this.isLoading()) {
            this.isLoading.set(false);
            this.isStreaming.set(true);
          }
          this.streamText.update((text) => text + token);
          this.autoScrollToBottom();
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
        const fallback =
          'Sorry, I could not reach the assistant right now. Please try again in a moment.';
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', content: err?.message || fallback },
        ]);
        this.scrollToBottom('smooth');
      },
      complete: () => {
        this.revealDone = true;
        if (this.reducedMotion || !this.pending) {
          this.commitStream();
          return;
        }
        this.ensureReveal();
      },
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
      this.autoScrollToBottom();
      this.revealTimer = setInterval(() => this.revealTick(), this.revealIntervalMs);
    }, this.minThinkMs);
  }

  private revealTick() {
    if (this.pending) {
      const chunk = this.pending.slice(0, this.revealChars);
      this.pending = this.pending.slice(chunk.length);
      this.streamText.update((text) => text + chunk);
      this.autoScrollToBottom();
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
      this.messages.update((msgs) => [...msgs, { role: 'assistant', content: text }]);
    }
    if (!this.userScrolledUp) {
      setTimeout(() => this.scrollToBottom('smooth'), 40);
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

  private scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = this.history?.nativeElement;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
    }
  }

  private autoScrollToBottom() {
    if (!this.userScrolledUp) {
      const el = this.history?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.streamSub?.unsubscribe();
    this.cancelReveal();
  }
}
