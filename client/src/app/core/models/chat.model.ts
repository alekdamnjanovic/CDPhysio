export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChatStreamToken {
  token?: string;
  error?: string;
}
