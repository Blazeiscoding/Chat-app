// Chat Widget Component - Main container for the chat interface
import React, { useState, useEffect, useCallback } from 'react'
import type { Message, ChatResponse, HistoryResponse } from '@/src/types'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { v4 as uuidv4 } from 'uuid'

const SESSION_STORAGE_KEY = 'chat_session_id'

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestedQuestion, setSuggestedQuestion] = useState('')

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    if (storedSessionId) {
      setSessionId(storedSessionId)
      fetchHistory(storedSessionId)
    }
  }, [])

  // Fetch conversation history
  const fetchHistory = async (sid: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sid}`)
      const data: HistoryResponse = await response.json()
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
      // Don't show error for history fetch - just start fresh
    }
  }

  // Send message handler
  const handleSendMessage = useCallback(async (text: string) => {
    setError(null)
    setIsLoading(true)
    setSuggestedQuestion('')

    // Create optimistic user message
    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      text,
      createdAt: new Date(),
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      })

      const data: ChatResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Save session ID
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId)
      }

      // Add AI response
      const aiMessage: Message = {
        id: uuidv4(),
        sender: 'ai',
        text: data.reply,
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Show error hint if there was an LLM issue but still got a response
      if (data.error) {
        console.warn('LLM warning:', data.error)
      }

    } catch (err) {
      console.error('Send message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setSuggestedQuestion(question)
  }

  // Clear chat handler
  const handleClearChat = () => {
    setMessages([])
    setSessionId(null)
    setSuggestedQuestion('')
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  return (
    <div className="chat-widget">
      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      <MessageList 
        messages={messages} 
        isLoading={isLoading}
        onSuggestedQuestion={handleSuggestedQuestion}
      />
      
      <ChatInput 
        onSend={handleSendMessage} 
        isLoading={isLoading}
        initialValue={suggestedQuestion}
      />
    </div>
  )
}
