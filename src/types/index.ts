// TypeScript interfaces for the AI Chat Agent

export interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  createdAt: Date | string
}

export interface Conversation {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
  messages: Message[]
}

// API Request/Response types
export interface ChatRequest {
  message: string
  sessionId?: string
}

export interface ChatResponse {
  reply: string
  sessionId: string
  error?: string
}

export interface HistoryResponse {
  messages: Message[]
  sessionId: string
  error?: string
}

// LLM types
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
