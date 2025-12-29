
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


export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}
