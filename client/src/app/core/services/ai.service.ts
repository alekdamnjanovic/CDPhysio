import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../config';
import type { ChatResponse, ChatStreamToken, ChatMessage, ChatRole } from '../models/chat.model';

export type { ChatMessage, ChatRole, ChatResponse, ChatStreamToken };

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  sendMessage(prompt: string): Observable<string> {
    return this.http.post<ChatResponse>(this.apiUrl, { prompt }).pipe(
      map(res => res.response)
    );
  }

  streamMessage(prompt: string): Observable<string> {
    return new Observable<string>((subscriber) => {
      const controller = new AbortController();
      const url = `${this.apiUrl}/stream`;

      (async () => {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
            signal: controller.signal
          });

          if (!res.ok) {
            let message = `Request failed with status ${res.status}.`;
            try {
              const body = await res.json();
              if (body?.error) message = body.error;
            } catch {
              /* ignore malformed error body */
            }
            subscriber.error(new Error(message));
            return;
          }

          const reader = res.body?.getReader();
          if (!reader) {
            subscriber.error(new Error('Streaming is not supported by this browser.'));
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split('\n\n');
            buffer = events.pop() ?? '';

            for (const event of events) {
              for (const line of event.split('\n')) {
                if (!line.startsWith('data:')) continue;
                const data = line.slice(5).trim();

                if (data === '[DONE]') {
                  subscriber.complete();
                  return;
                }

                try {
                  const parsed: ChatStreamToken = JSON.parse(data);
                  if (parsed.token != null) subscriber.next(parsed.token);
                  if (parsed.error) subscriber.error(new Error(parsed.error));
                } catch {
                  /* ignore malformed data frame */
                }
              }
            }
          }

          subscriber.complete();
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') {
            subscriber.complete();
          } else {
            subscriber.error(err);
          }
        }
      })();

      return () => controller.abort();
    });
  }
}
